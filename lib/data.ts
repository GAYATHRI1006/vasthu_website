import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { fallbackClass } from "@/lib/constants";
import { getSupabaseAdmin } from "@/services/supabase";
import type { BookingRecord, GalleryImage, RegistrationPayload, VastuClass } from "@/types";
import { generateBookingId } from "@/lib/utils";

const inMemoryCustomers = new Map<string, any>();
const inMemoryPayments: any[] = [];

const DUPLICATE_PAID_CUSTOMER_ERROR = "CUSTOMER_ALREADY_CONFIRMED_FOR_CLASS";

export async function getUpcomingClass(): Promise<VastuClass> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return fallbackClass;
  }

  const nowIso = new Date().toISOString();
  const { data: upcomingData } = await supabase
    .from("classes")
    .select("*")
    .gte("event_date", nowIso)
    .order("event_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (upcomingData) {
    return upcomingData as VastuClass;
  }

  const { data: latestData } = await supabase
    .from("classes")
    .select("*")
    .order("event_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (latestData as VastuClass | null) ?? fallbackClass;
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
  const imageRoot = path.join(process.cwd(), "public", "images");
  const galleryDir = path.join(imageRoot, "gallery");
  const [rootFiles, galleryFiles] = await Promise.all([
    fs.readdir(imageRoot).catch(() => []),
    fs.readdir(galleryDir).catch(() => [])
  ]);

  const imageFiles = [
    ...rootFiles
      .filter((file) => /\.(png|jpe?g|webp|avif)$/i.test(file))
      .filter((file) => !/^trainer\./i.test(file))
      .map((file) => ({
        file,
        src: `/images/${file}`
      })),
    ...galleryFiles
      .filter((file) => /\.(png|jpe?g|webp|avif)$/i.test(file))
      .filter((file) => !/^trainer\./i.test(file))
      .map((file) => ({
        file,
        src: `/images/gallery/${file}`
      }))
  ].sort((a, b) => a.file.localeCompare(b.file));

  return imageFiles.map(({ file, src }, index) => ({
    id: `${index}-${file}`,
    src,
    alt: `HariOm Vastu workshop gallery image ${index + 1}`
  }));
}

export async function createDraftRegistration(payload: RegistrationPayload) {
  const eventClass = await getUpcomingClass();
  const supabase = getSupabaseAdmin();
  const bookingId = generateBookingId();

  if (supabase) {
    const { data: existingRows, error: existingError } = await supabase
      .from("customers")
      .select("id, booking_id, payment_status")
      .eq("class_id", payload.classId)
      .eq("phone", payload.phone)
      .order("created_at", { ascending: false });

    if (existingError) {
      throw new Error(existingError.message);
    }

    const paidRow = existingRows?.find((row) => row.payment_status === "paid");

    if (paidRow) {
      throw new Error(
        `${DUPLICATE_PAID_CUSTOMER_ERROR}:${paidRow.booking_id as string}`
      );
    }

    const pendingRow = existingRows?.find((row) => row.payment_status !== "paid");

    if (pendingRow) {
      const { data, error } = await supabase
        .from("customers")
        .update({
          name: payload.fullName,
          email: payload.email || null,
          place: payload.place,
          occupation: payload.occupation || null,
          interested_class: payload.interestedClass,
          amount_paid: eventClass.fee
        })
        .eq("id", pendingRow.id as string)
        .select("id, booking_id")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        id: data.id as string,
        bookingId: data.booking_id as string,
        amount: eventClass.fee
      };
    }

    const { data, error } = await supabase
      .from("customers")
      .insert({
        booking_id: bookingId,
        class_id: payload.classId,
        name: payload.fullName,
        phone: payload.phone,
        email: payload.email || null,
        place: payload.place,
        occupation: payload.occupation || null,
        interested_class: payload.interestedClass,
        payment_status: "pending",
        booking_status: "pending",
        amount_paid: eventClass.fee
      })
      .select("id, booking_id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id as string,
      bookingId: data.booking_id as string,
      amount: eventClass.fee
    };
  }

  const existingRecords = Array.from(inMemoryCustomers.values()).filter(
    (customer) =>
      customer.class_id === payload.classId && customer.phone === payload.phone
  );

  const paidRecord = existingRecords.find(
    (customer) => customer.payment_status === "paid"
  );

  if (paidRecord) {
    throw new Error(
      `${DUPLICATE_PAID_CUSTOMER_ERROR}:${paidRecord.booking_id as string}`
    );
  }

  const pendingRecord = existingRecords.find(
    (customer) => customer.payment_status !== "paid"
  );

  if (pendingRecord) {
    pendingRecord.name = payload.fullName;
    pendingRecord.email = payload.email || null;
    pendingRecord.place = payload.place;
    pendingRecord.occupation = payload.occupation || null;
    pendingRecord.interested_class = payload.interestedClass;
    pendingRecord.amount_paid = eventClass.fee;

    return {
      id: pendingRecord.id,
      bookingId: pendingRecord.booking_id,
      amount: eventClass.fee
    };
  }

  const id = crypto.randomUUID();
  inMemoryCustomers.set(id, {
    id,
    booking_id: bookingId,
    class_id: payload.classId,
    name: payload.fullName,
    phone: payload.phone,
    email: payload.email || null,
    place: payload.place,
    occupation: payload.occupation || null,
    interested_class: payload.interestedClass,
    payment_status: "pending",
    booking_status: "pending",
    amount_paid: eventClass.fee,
    program: eventClass.title,
    venue: eventClass.venue,
    event_date: eventClass.event_date
  });

  return {
    id,
    bookingId,
    amount: eventClass.fee
  };
}

export async function storePaymentAttempt(input: {
  customerId: string;
  classId: string;
  orderId: string;
  paymentId?: string;
  amount: number;
  status: string;
  gatewayPayload?: unknown;
}) {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { error } = await supabase.from("payment_logs").insert({
      customer_id: input.customerId,
      class_id: input.classId,
      order_id: input.orderId,
      payment_id: input.paymentId ?? null,
      amount: input.amount,
      status: input.status,
      gateway_payload: input.gatewayPayload ?? {}
    });

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  inMemoryPayments.push(input);
}

export async function assignOrderToCustomer(customerId: string, orderId: string) {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { error } = await supabase
      .from("customers")
      .update({ order_id: orderId })
      .eq("id", customerId);

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  const record = inMemoryCustomers.get(customerId);
  if (record) {
    record.order_id = orderId;
  }
}

export async function getBookingContextByOrderId(orderId: string): Promise<{
  customerId: string;
  classId: string;
  bookingId: string;
  phone: string;
} | null> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data } = await supabase
      .from("customers")
      .select("id, class_id, booking_id, phone")
      .eq("order_id", orderId)
      .maybeSingle();

    if (!data) {
      return null;
    }

    return {
      customerId: data.id as string,
      classId: data.class_id as string,
      bookingId: data.booking_id as string,
      phone: data.phone as string
    };
  }

  const record = Array.from(inMemoryCustomers.values()).find(
    (customer) => customer.order_id === orderId
  );

  if (!record) {
    return null;
  }

  return {
    customerId: record.id,
    classId: record.class_id,
    bookingId: record.booking_id,
    phone: record.phone
  };
}

export async function getConfirmedBookingByPhoneAndClass(input: {
  phone: string;
  classId: string;
}): Promise<string | null> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data } = await supabase
      .from("customers")
      .select("booking_id")
      .eq("class_id", input.classId)
      .eq("phone", input.phone)
      .eq("payment_status", "paid")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return (data?.booking_id as string | undefined) ?? null;
  }

  const record = Array.from(inMemoryCustomers.values()).find(
    (customer) =>
      customer.class_id === input.classId &&
      customer.phone === input.phone &&
      customer.payment_status === "paid"
  );

  return record?.booking_id ?? null;
}

export async function confirmBooking(input: {
  customerId: string;
  classId: string;
  orderId: string;
  paymentId: string;
  amount: number;
}) {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { error } = await supabase.rpc("confirm_booking_payment", {
      p_customer_id: input.customerId,
      p_class_id: input.classId,
      p_order_id: input.orderId,
      p_payment_id: input.paymentId,
      p_amount_paid: input.amount
    });

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  const record = inMemoryCustomers.get(input.customerId);
  if (!record) {
    throw new Error("Customer not found");
  }

  if (record.payment_status === "paid") {
    return;
  }

  if (fallbackClass.available_seats < 1) {
    throw new Error("Seats are full");
  }

  fallbackClass.available_seats -= 1;
  record.payment_status = "paid";
  record.booking_status = "confirmed";
  record.order_id = input.orderId;
  record.payment_id = input.paymentId;
}

export async function getBookingById(
  bookingId: string
): Promise<BookingRecord | null> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data } = await supabase
      .from("customers")
      .select(
        "booking_id, name, phone, email, place, occupation, amount_paid, payment_id, payment_status, booking_status, classes(title, venue, event_date)"
      )
      .eq("booking_id", bookingId)
      .maybeSingle();

    if (!data) {
      return null;
    }

    const classData = Array.isArray(data.classes) ? data.classes[0] : data.classes;

    return {
      bookingId: data.booking_id,
      customerName: data.name,
      phone: data.phone,
      email: data.email,
      place: data.place,
      occupation: data.occupation,
      program: classData?.title ?? fallbackClass.title,
      amountPaid: data.amount_paid,
      paymentId: data.payment_id,
      venue: classData?.venue ?? fallbackClass.venue,
      eventDate: classData?.event_date ?? fallbackClass.event_date,
      paymentStatus: data.payment_status,
      bookingStatus: data.booking_status
    } as BookingRecord;
  }

  const record = Array.from(inMemoryCustomers.values()).find(
    (customer) => customer.booking_id === bookingId
  );

  if (!record) {
    return null;
  }

  return {
    bookingId: record.booking_id,
    customerName: record.name,
    phone: record.phone,
    email: record.email,
    place: record.place,
    occupation: record.occupation,
    program: record.program ?? fallbackClass.title,
    amountPaid: record.amount_paid,
    paymentId: record.payment_id ?? "pending",
    venue: record.venue ?? fallbackClass.venue,
    eventDate: record.event_date ?? fallbackClass.event_date,
    paymentStatus: record.payment_status,
    bookingStatus: record.booking_status
  };
}

export type AdminCustomer = {
  id: string;
  bookingId: string;
  name: string;
  phone: string;
  email: string | null;
  place: string;
  occupation: string | null;
  interestedClass: string | null;
  amountPaid: number;
  paymentStatus: string;
  bookingStatus: string;
  paymentId: string | null;
  orderId: string | null;
  program: string;
  venue: string;
  eventDate: string;
  createdAt: string;
};

export type AdminPaymentLog = {
  id: string;
  customerName: string;
  phone: string;
  orderId: string;
  paymentId: string | null;
  amount: number;
  status: string;
  createdAt: string;
};

export async function getAllCustomers(): Promise<AdminCustomer[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("customers")
    .select(
      "id, booking_id, name, phone, email, place, occupation, interested_class, amount_paid, payment_status, booking_status, payment_id, order_id, created_at, classes(title, venue, event_date)"
    )
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => {
    const cls = Array.isArray(row.classes) ? row.classes[0] : row.classes;
    return {
      id: row.id,
      bookingId: row.booking_id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      place: row.place,
      occupation: row.occupation,
      interestedClass: row.interested_class,
      amountPaid: row.amount_paid,
      paymentStatus: row.payment_status,
      bookingStatus: row.booking_status,
      paymentId: row.payment_id,
      orderId: row.order_id,
      program: cls?.title ?? fallbackClass.title,
      venue: cls?.venue ?? fallbackClass.venue,
      eventDate: cls?.event_date ?? fallbackClass.event_date,
      createdAt: row.created_at
    };
  });
}

export async function getPaymentLogs(): Promise<AdminPaymentLog[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("payment_logs")
    .select("id, order_id, payment_id, amount, status, created_at, customers(name, phone)")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => {
    const customer = Array.isArray(row.customers) ? row.customers[0] : row.customers;
    return {
      id: row.id,
      customerName: customer?.name ?? "Unknown",
      phone: customer?.phone ?? "--",
      orderId: row.order_id,
      paymentId: row.payment_id,
      amount: row.amount,
      status: row.status,
      createdAt: row.created_at
    };
  });
}

export async function updateClassById(
  classId: string,
  fields: Partial<{
    title: string;
    subtitle: string;
    description: string;
    event_date: string;
    event_time: string;
    venue: string;
    address: string;
    fee: number;
    total_seats: number;
    registration_open: boolean;
  }>
): Promise<VastuClass> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  const { data: currentClass, error: currentClassError } = await supabase
    .from("classes")
    .select("*")
    .eq("id", classId)
    .maybeSingle();

  if (currentClassError) {
    throw new Error(currentClassError.message);
  }

  if (!currentClass) {
    throw new Error("Class not found");
  }

  const updatePayload = Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined)
  ) as typeof fields & Partial<Pick<VastuClass, "available_seats">>;

  if (
    typeof updatePayload.total_seats === "number" &&
    Number.isFinite(updatePayload.total_seats)
  ) {
    const soldSeats = currentClass.total_seats - currentClass.available_seats;

    if (updatePayload.total_seats < soldSeats) {
      throw new Error(
        `Total seats cannot be less than sold seats (${soldSeats}).`
      );
    }

    updatePayload.available_seats = updatePayload.total_seats - soldSeats;
  }

  const { data, error } = await supabase
    .from("classes")
    .update(updatePayload)
    .eq("id", classId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  return data as VastuClass;
}

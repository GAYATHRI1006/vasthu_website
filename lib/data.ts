import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { fallbackClass } from "@/lib/constants";
import { getSupabaseAdmin } from "@/services/supabase";
import type { BookingRecord, GalleryImage, RegistrationPayload, VastuClass } from "@/types";
import { generateBookingId } from "@/lib/utils";

const inMemoryCustomers = new Map<string, any>();
const inMemoryPayments: any[] = [];

export async function getUpcomingClass(): Promise<VastuClass> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return fallbackClass;
  }

  const { data } = await supabase
    .from("classes")
    .select("*")
    .eq("registration_open", true)
    .order("event_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (data as VastuClass | null) ?? fallbackClass;
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
  const galleryDir = path.join(process.cwd(), "public", "images", "gallery");
  const files = await fs.readdir(galleryDir).catch(() => []);

  return files
    .filter((file) => /\.(png|jpe?g|webp|avif)$/i.test(file))
    .sort((a, b) => a.localeCompare(b))
    .map((file, index) => ({
      id: `${index}-${file}`,
      src: `/images/gallery/${file}`,
      alt: `HariOm Vastu workshop gallery image ${index + 1}`
    }));
}

export async function createDraftRegistration(payload: RegistrationPayload) {
  const eventClass = await getUpcomingClass();
  const supabase = getSupabaseAdmin();
  const bookingId = generateBookingId();

  if (supabase) {
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

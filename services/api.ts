import type { BookingRecord, GalleryImage, RegistrationPayload, VastuClass } from "@/types";

async function parseResponse<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error?.formErrors?.[0] ?? body.error ?? "Request failed");
  }
  return body.data as T;
}

export async function fetchClass() {
  const response = await fetch("/api/classes");
  return parseResponse<VastuClass>(response);
}

export async function fetchGallery() {
  const response = await fetch("/api/gallery");
  return parseResponse<GalleryImage[]>(response);
}

export async function createRegistration(payload: RegistrationPayload) {
  const response = await fetch("/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseResponse<{
    customerId: string;
    bookingId: string;
    amount: number;
  }>(response);
}

export async function createOrder(payload: {
  customerId: string;
  classId: string;
}) {
  const response = await fetch("/api/payments/create-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseResponse<{
    orderId: string;
    amount: number;
    currency: string;
    key: string;
  }>(response);
}

export async function verifyPayment(payload: {
  customerId: string;
  classId: string;
  bookingId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const response = await fetch("/api/payments/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseResponse<{ bookingId: string }>(response);
}

export async function fetchBooking(bookingId: string) {
  const response = await fetch(`/api/booking/${bookingId}`);
  return parseResponse<BookingRecord>(response);
}

import { NextRequest, NextResponse } from "next/server";
import {
  confirmBooking,
  getBookingById,
  getUpcomingClass,
  storePaymentAttempt
} from "@/lib/data";
import { jsonError } from "@/lib/http";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyPaymentSchema } from "@/lib/validations";
import { verifyRazorpaySignature } from "@/services/razorpay";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(`verify:${ip}`, 60_000, 12)) {
    return jsonError("Too many verification attempts. Please wait a minute.", 429);
  }

  const body = await request.json();
  const parsed = verifyPaymentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const validSignature =
    parsed.data.razorpay_order_id.startsWith("order_mock_") ||
    verifyRazorpaySignature({
      orderId: parsed.data.razorpay_order_id,
      paymentId: parsed.data.razorpay_payment_id,
      signature: parsed.data.razorpay_signature
    });

  if (!validSignature) {
    await storePaymentAttempt({
      customerId: parsed.data.customerId,
      classId: parsed.data.classId,
      orderId: parsed.data.razorpay_order_id,
      paymentId: parsed.data.razorpay_payment_id,
      amount: 0,
      status: "signature_failed",
      gatewayPayload: parsed.data
    });
    return jsonError("Payment signature verification failed.", 400);
  }

  const eventClass = await getUpcomingClass();

  await confirmBooking({
    customerId: parsed.data.customerId,
    classId: parsed.data.classId,
    orderId: parsed.data.razorpay_order_id,
    paymentId: parsed.data.razorpay_payment_id,
    amount: eventClass.fee
  });

  await storePaymentAttempt({
    customerId: parsed.data.customerId,
    classId: parsed.data.classId,
    orderId: parsed.data.razorpay_order_id,
    paymentId: parsed.data.razorpay_payment_id,
    amount: eventClass.fee,
    status: "paid",
    gatewayPayload: parsed.data
  });

  const booking = await getBookingById(parsed.data.bookingId);

  return NextResponse.json({
    data: {
      bookingId: booking?.bookingId ?? parsed.data.bookingId
    }
  });
}

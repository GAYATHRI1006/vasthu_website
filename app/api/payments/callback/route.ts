import { NextRequest, NextResponse } from "next/server";
import {
  confirmBooking,
  getConfirmedBookingByPhoneAndClass,
  getBookingContextByOrderId,
  getUpcomingClass,
  storePaymentAttempt
} from "@/lib/data";
import { verifyRazorpaySignature } from "@/services/razorpay";

function buildRedirectUrl(request: NextRequest, path: string) {
  return new URL(path, request.url);
}

function redirectSeeOther(url: URL) {
  return NextResponse.redirect(url, 303);
}

export async function POST(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const bookingIdFromQuery = requestUrl.searchParams.get("bookingId");
  const formData = await request.formData();

  const orderId = String(formData.get("razorpay_order_id") ?? "");
  const paymentId = String(formData.get("razorpay_payment_id") ?? "");
  const signature = String(formData.get("razorpay_signature") ?? "");

  if (!orderId || !paymentId || !signature) {
    const failedUrl = buildRedirectUrl(
      request,
      bookingIdFromQuery ? `/failed?bookingId=${encodeURIComponent(bookingIdFromQuery)}` : "/failed"
    );
    return redirectSeeOther(failedUrl);
  }

  const context = await getBookingContextByOrderId(orderId);

  if (!context) {
    const failedUrl = buildRedirectUrl(request, "/failed");
    return redirectSeeOther(failedUrl);
  }

  const validSignature =
    orderId.startsWith("order_mock_") ||
    verifyRazorpaySignature({
      orderId,
      paymentId,
      signature
    });

  if (!validSignature) {
    await storePaymentAttempt({
      customerId: context.customerId,
      classId: context.classId,
      orderId,
      paymentId,
      amount: 0,
      status: "signature_failed",
      gatewayPayload: {
        orderId,
        paymentId,
        signature
      }
    });

    const failedUrl = buildRedirectUrl(
      request,
      `/failed?bookingId=${encodeURIComponent(context.bookingId)}`
    );
    return redirectSeeOther(failedUrl);
  }

  const eventClass = await getUpcomingClass();

  try {
    await confirmBooking({
      customerId: context.customerId,
      classId: context.classId,
      orderId,
      paymentId,
      amount: eventClass.fee
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("customers_unique_paid_phone_per_class")
    ) {
      const existingBookingId = await getConfirmedBookingByPhoneAndClass({
        phone: context.phone,
        classId: context.classId
      });

      await storePaymentAttempt({
        customerId: context.customerId,
        classId: context.classId,
        orderId,
        paymentId,
        amount: eventClass.fee,
        status: "duplicate_paid_redirected",
        gatewayPayload: {
          orderId,
          paymentId,
          signature,
          source: "callback_url"
        }
      });

      const successUrl = buildRedirectUrl(
        request,
        `/success?bookingId=${encodeURIComponent(
          existingBookingId ?? context.bookingId
        )}`
      );

      return redirectSeeOther(successUrl);
    }

    throw error;
  }

  await storePaymentAttempt({
    customerId: context.customerId,
    classId: context.classId,
    orderId,
    paymentId,
    amount: eventClass.fee,
    status: "paid",
    gatewayPayload: {
      orderId,
      paymentId,
      signature,
      source: "callback_url"
    }
  });

  const successUrl = buildRedirectUrl(
    request,
    `/success?bookingId=${encodeURIComponent(context.bookingId)}`
  );

  return redirectSeeOther(successUrl);
}

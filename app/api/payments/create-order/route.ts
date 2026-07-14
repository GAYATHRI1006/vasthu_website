import { NextRequest, NextResponse } from "next/server";
import {
  assignOrderToCustomer,
  getUpcomingClass,
  storePaymentAttempt
} from "@/lib/data";
import { jsonError } from "@/lib/http";
import { checkRateLimit } from "@/lib/rate-limit";
import { createOrderSchema } from "@/lib/validations";
import { getRazorpayInstance } from "@/services/razorpay";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(`order:${ip}`, 60_000, 10)) {
    return jsonError("Too many payment attempts. Please wait a minute.", 429);
  }

  const body = await request.json();
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const eventClass = await getUpcomingClass();

  if (eventClass.available_seats < 1) {
    return jsonError("This batch is sold out.", 409);
  }

  const razorpay = getRazorpayInstance();
  const receipt = `rcpt_${Date.now()}`;

  if (!razorpay) {
    const mockOrderId = `order_mock_${Date.now()}`;
    await assignOrderToCustomer(parsed.data.customerId, mockOrderId);
    await storePaymentAttempt({
      customerId: parsed.data.customerId,
      classId: parsed.data.classId,
      orderId: mockOrderId,
      amount: eventClass.fee,
      status: "created",
      gatewayPayload: { mocked: true }
    });

    return NextResponse.json({
      data: {
        orderId: mockOrderId,
        amount: eventClass.fee * 100,
        currency: "INR",
        key: "rzp_test_mocked"
      }
    });
  }

  const order = await razorpay.orders.create({
    amount: eventClass.fee * 100,
    currency: "INR",
    receipt,
    notes: {
      classId: parsed.data.classId,
      customerId: parsed.data.customerId
    }
  });

  await assignOrderToCustomer(parsed.data.customerId, order.id);
  await storePaymentAttempt({
    customerId: parsed.data.customerId,
    classId: parsed.data.classId,
    orderId: order.id,
    amount: eventClass.fee,
    status: "created",
    gatewayPayload: order
  });

  return NextResponse.json({
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    }
  });
}

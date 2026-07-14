import crypto from "crypto";
import Razorpay from "razorpay";
import { env } from "@/lib/env";

export function getRazorpayInstance() {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return null;
  }

  return new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET
  });
}

export function verifyRazorpaySignature(payload: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  if (!env.RAZORPAY_KEY_SECRET) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${payload.orderId}|${payload.paymentId}`)
    .digest("hex");

  return expected === payload.signature;
}

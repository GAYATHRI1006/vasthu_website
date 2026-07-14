import { z } from "zod";

export const registrationSchema = z.object({
  classId: z.string().uuid(),
  fullName: z.string().min(3).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().email().optional().or(z.literal("")),
  place: z.string().min(2).max(100),
  interestedClass: z.string().min(3).max(120),
  occupation: z.string().max(120).optional().or(z.literal(""))
});

export const createOrderSchema = z.object({
  customerId: z.string().uuid(),
  classId: z.string().uuid()
});

export const verifyPaymentSchema = z.object({
  bookingId: z.string().min(1),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  customerId: z.string().uuid(),
  classId: z.string().uuid()
});

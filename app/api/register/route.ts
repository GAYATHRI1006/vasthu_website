import { NextRequest, NextResponse } from "next/server";
import { createDraftRegistration, getUpcomingClass } from "@/lib/data";
import { jsonError } from "@/lib/http";
import { checkRateLimit } from "@/lib/rate-limit";
import { registrationSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(`register:${ip}`, 60_000, 8)) {
    return jsonError("Too many registration attempts. Please wait a minute.", 429);
  }

  const body = await request.json();
  const parsed = registrationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const eventClass = await getUpcomingClass();

  if (!eventClass.registration_open || eventClass.available_seats < 1) {
    return jsonError("Registration is closed for this batch.", 409);
  }

  const registration = await createDraftRegistration(parsed.data);

  return NextResponse.json({
    data: {
      customerId: registration.id,
      bookingId: registration.bookingId,
      amount: registration.amount
    }
  });
}

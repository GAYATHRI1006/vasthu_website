import { NextRequest, NextResponse } from "next/server";
import { getBookingById } from "@/lib/data";
import { jsonError } from "@/lib/http";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;
  const booking = await getBookingById(bookingId);

  if (!booking) {
    return jsonError("Booking not found.", 404);
  }

  return NextResponse.json({ data: booking });
}

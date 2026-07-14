import { NextRequest } from "next/server";
import { getBookingById } from "@/lib/data";
import { formatCurrency, formatEventDate } from "@/lib/utils";
import { jsonError } from "@/lib/http";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;
  const booking = await getBookingById(bookingId);

  if (!booking) {
    return jsonError("Receipt not found.", 404);
  }

  const receipt = [
    "HariOm Vastu Solutions",
    "Payment Receipt",
    `Booking ID: ${booking.bookingId}`,
    `Customer Name: ${booking.customerName}`,
    `Phone: ${booking.phone}`,
    `Program: ${booking.program}`,
    `Date: ${formatEventDate(booking.eventDate)}`,
    `Venue: ${booking.venue}`,
    `Amount Paid: ${formatCurrency(booking.amountPaid)}`,
    `Payment ID: ${booking.paymentId}`,
    `Status: ${booking.bookingStatus}`
  ].join("\n");

  return new Response(receipt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="receipt-${bookingId}.txt"`
    }
  });
}

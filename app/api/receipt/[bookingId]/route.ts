import { NextRequest } from "next/server";
import { getBookingById } from "@/lib/data";
import { formatCurrency, formatEventDate } from "@/lib/utils";
import { jsonError } from "@/lib/http";
import { generateReceiptPdf } from "@/lib/receipt-pdf";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;
  const booking = await getBookingById(bookingId);

  if (!booking) {
    return jsonError("Receipt not found.", 404);
  }

  const pdf = generateReceiptPdf({
    booking: {
      ...booking,
      eventDate: formatEventDate(booking.eventDate),
      amountPaid: booking.amountPaid
    },
    generatedAt: new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date())
  });

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="receipt-${bookingId}.pdf"`,
      "Content-Length": String(pdf.byteLength),
      "Cache-Control": "no-store"
    }
  });
}

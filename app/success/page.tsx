"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Confetti from "react-confetti";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchBooking } from "@/services/api";
import { formatCurrency, formatEventDate } from "@/lib/utils";
import type { BookingRecord } from "@/types";

export default function SuccessPage() {
  return (
    <Suspense fallback={<StateCard title="Loading booking details..." />}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [booking, setBooking] = useState<BookingRecord | null>(null);

  useEffect(() => {
    if (!bookingId) {
      return;
    }

    fetchBooking(bookingId).then(setBooking).catch(() => null);
  }, [bookingId]);

  if (!bookingId) {
    return <StateCard title="Missing booking reference." />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background py-16">
      <Confetti recycle={false} numberOfPieces={240} />
      <div className="container">
        <Card className="mx-auto max-w-3xl border-primary/10">
          <CardContent className="space-y-8">
            <div className="space-y-3 text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-secondary">Payment Successful</p>
              <h1 className="font-serif text-5xl text-primary">Booking Confirmed</h1>
              <p className="text-sm leading-7 text-slate-600">
                Your seat is reserved. Receipt download is available below.
              </p>
            </div>

            {booking ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Detail label="Booking ID" value={booking.bookingId} />
                <Detail label="Customer Name" value={booking.customerName} />
                <Detail label="Phone" value={booking.phone} />
                <Detail label="Program" value={booking.program} />
                <Detail label="Date" value={formatEventDate(booking.eventDate)} />
                <Detail label="Venue" value={booking.venue} />
                <Detail label="Amount Paid" value={formatCurrency(booking.amountPaid)} />
                <Detail label="Payment ID" value={booking.paymentId} />
              </div>
            ) : (
              <p className="text-center text-sm text-slate-500">Loading booking details...</p>
            )}

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild variant="secondary">
                <a href={`/api/receipt/${bookingId}`}>Download Receipt</a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-accent/60 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function StateCard({ title }: { title: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="max-w-lg">
        <CardContent className="text-center">
          <h1 className="font-serif text-3xl text-primary">{title}</h1>
        </CardContent>
      </Card>
    </main>
  );
}

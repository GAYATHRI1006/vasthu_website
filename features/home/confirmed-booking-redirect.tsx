"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getConfirmedBookingId } from "@/lib/confirmed-booking";

export function ConfirmedBookingRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    const bookingId = getConfirmedBookingId();
    if (bookingId) {
      router.replace(`/success?bookingId=${encodeURIComponent(bookingId)}`);
    }
  }, [pathname, router]);

  return null;
}

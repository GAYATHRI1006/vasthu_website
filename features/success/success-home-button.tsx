"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { clearConfirmedBookingId } from "@/lib/confirmed-booking";

export function SuccessHomeButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      onClick={() => {
        clearConfirmedBookingId();
        router.push("/");
      }}
    >
      Back to Home
    </Button>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { MobileHistoryControls } from "@/components/site/mobile-history-controls";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "HariOm Vastu Solutions",
  description:
    "Premium event registration experience for the HariOm Vastu Awareness Program."
};

export default function RootLayout({
  children
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <MobileHistoryControls />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

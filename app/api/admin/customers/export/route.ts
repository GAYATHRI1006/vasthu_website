import * as XLSX from "xlsx";
import { NextResponse } from "next/server";
import { hasAdminAccess } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase-server";
import { getAllCustomers } from "@/lib/data";

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!hasAdminAccess(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customers = await getAllCustomers();
  const rows = customers.map((customer) => ({
    "Booking ID": customer.bookingId,
    Name: customer.name,
    Phone: customer.phone,
    Email: customer.email ?? "",
    Place: customer.place,
    Occupation: customer.occupation ?? "",
    "Interested Class": customer.interestedClass ?? "",
    Program: customer.program,
    Venue: customer.venue,
    "Event Date": customer.eventDate
      ? new Date(customer.eventDate).toLocaleDateString("en-IN")
      : "",
    "Amount Paid (INR)": customer.amountPaid,
    "Payment Status": customer.paymentStatus,
    "Booking Status": customer.bookingStatus,
    "Payment ID": customer.paymentId ?? "",
    "Registered On": customer.createdAt
      ? new Date(customer.createdAt).toLocaleString("en-IN")
      : ""
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
  worksheet["!cols"] = Object.keys(rows[0] ?? {}).map((key) => ({
    wch: Math.max(key.length, 18)
  }));

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="hariom-customers-${Date.now()}.xlsx"`
    }
  });
}

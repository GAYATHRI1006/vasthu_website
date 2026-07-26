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
  return NextResponse.json({ data: customers });
}

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasAdminAccess } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase-server";
import { getUpcomingClass, updateClassById } from "@/lib/data";

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!hasAdminAccess(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cls = await getUpcomingClass();
  return NextResponse.json({ data: cls });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!hasAdminAccess(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    id: string;
    title?: string;
    subtitle?: string;
    description?: string;
    event_date?: string;
    event_time?: string;
    venue?: string;
    address?: string;
    fee?: number;
    total_seats?: number;
    registration_open?: boolean;
  };

  const { id, ...fields } = body;
  if (!id) {
    return NextResponse.json(
      { error: "Class ID is required." },
      { status: 400 }
    );
  }

  const updatedClass = await updateClassById(id, fields);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/class");

  return NextResponse.json({ success: true, data: updatedClass });
}

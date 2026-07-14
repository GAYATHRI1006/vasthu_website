import { NextResponse } from "next/server";
import { getUpcomingClass } from "@/lib/data";

export async function GET() {
  const eventClass = await getUpcomingClass();
  return NextResponse.json({ data: eventClass });
}

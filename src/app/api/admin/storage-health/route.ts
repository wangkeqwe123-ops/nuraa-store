import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getHomepageStorageHealth } from "@/lib/supabase-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!await getAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const health = await getHomepageStorageHealth();
  return NextResponse.json(health, { headers: { "Cache-Control": "no-store" } });
}

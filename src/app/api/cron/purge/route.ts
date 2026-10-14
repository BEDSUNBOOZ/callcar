import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Appelée chaque nuit par Vercel Cron (voir vercel.json). Protégée par CRON_SECRET. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { data, error } = await createAdminClient().rpc("purge_old_messages");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ purged: data });
}

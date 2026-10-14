import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { qrPng, stickerSvg } from "@/lib/qr/generate";

/** Téléchargement du QR (autocollant SVG ou PNG). La RLS garantit que seul le propriétaire accède au jeton. */
export async function GET(req: Request, ctx: { params: Promise<{ vehicleId: string }> }) {
  const { vehicleId } = await ctx.params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return new NextResponse("Non autorisé", { status: 401 });

  const { data: qr } = await supabase.from("qr_tokens").select("token").eq("vehicle_id", vehicleId).eq("status", "active").maybeSingle();
  if (!qr) return new NextResponse("Introuvable", { status: 404 });

  const format = new URL(req.url).searchParams.get("format") === "png" ? "png" : "svg";
  if (format === "png") {
    const png = await qrPng(qr.token);
    return new NextResponse(new Uint8Array(png), {
      headers: { "Content-Type": "image/png", "Content-Disposition": 'attachment; filename="carcall-qr.png"', "Cache-Control": "private, no-store" },
    });
  }
  const svg = await stickerSvg(qr.token);
  return new NextResponse(svg, {
    headers: { "Content-Type": "image/svg+xml", "Content-Disposition": 'attachment; filename="carcall-autocollant.svg"', "Cache-Control": "private, no-store" },
  });
}

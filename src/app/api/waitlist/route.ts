import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  variant: z.string().min(1).max(60),
  email: z.string().email().max(160),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  // TODO: insert into `stock_alerts(variant_id, email)` — variant SKU maps to
  // product_variants.sku (DEMO- SKUs are demo-only; resolve real UUIDs in production).
  return NextResponse.json({ ok: true });
}

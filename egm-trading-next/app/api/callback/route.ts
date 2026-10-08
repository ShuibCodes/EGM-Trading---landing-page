import { NextResponse } from "next/server";

const UK_PHONE = /^(\+44|0)\d{9,10}$/;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const phone = typeof body?.phone === "string" ? body.phone : "";
  if (!body?.name || !UK_PHONE.test(phone.replace(/[\s()-]/g, ""))) {
    return NextResponse.json({ ok: false, error: "Invalid lead" }, { status: 400 });
  }

  const lead = {
    name: String(body.name).slice(0, 80),
    phone,
    time: String(body.time ?? "").slice(0, 80),
    mode: body.mode === "sell" ? "sell" : "buy",
    carId: body.carId ?? null,
    vehicle: body.vehicle ? String(body.vehicle).slice(0, 120) : null,
    createdAt: new Date().toISOString(),
  };

  // TODO: deliver the lead — e.g. insert into a database, send an email/SMS, or post to the CRM.
  console.log("[callback-request]", lead);

  return NextResponse.json({ ok: true });
}

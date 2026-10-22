import { NextResponse } from "next/server";
import { cars, carMeta } from "@/lib/cars";

export async function POST(req: Request) {
  const { question, carId, booked } = await req.json().catch(() => ({}));
  const fallback = booked
    ? "Good question — I've noted it for the team so they can answer on your call."
    : "Good question — the team can answer that properly. Want me to request a callback?";

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || typeof question !== "string" || !question.trim()) return NextResponse.json({ reply: fallback });

  const car = cars.find((c) => c.id === carId);
  const stock = cars.map((c) => `${c.name} (${carMeta(c)}, ${c.price}; ${c.detail})`).join("; ");
  const system = [
    "You are the chat assistant for EGM Trading, a pre-owned car dealership in London that buys and sells cars.",
    `Current stock: ${stock}.`,
    car ? `The customer is looking at the ${car.year} ${car.name}.` : "",
    booked ? "They have registered a callback request. Do not say a call has already been placed." : "They have not registered a callback request yet — gently suggest one.",
    "Reply in 1–2 short, friendly sentences, plain text, British English.",
    "Never invent details you weren't given (mileage, service history, finance, warranty) — say the team will confirm on the call.",
  ].join(" ");

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5",
        max_tokens: 200,
        system,
        messages: [{ role: "user", content: question.slice(0, 1000) }],
      }),
    });
    const data = await r.json();
    return NextResponse.json({ reply: data?.content?.[0]?.text?.trim() || fallback });
  } catch {
    return NextResponse.json({ reply: fallback });
  }
}

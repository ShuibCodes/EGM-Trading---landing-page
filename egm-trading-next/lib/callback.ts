import { type Car, cars } from "@/lib/cars";
import { normalizeUkPhone } from "@/lib/phone";

const NAME_MAX = 80;
const VEHICLE_MAX = 120;

/** Hidden form field that people never fill in. Bots that fill every field are rejected. */
export const HONEYPOT_FIELD = "website";

export type CallbackInsert = {
  insert: (row: { name: string; phone_e164: string; vehicle: string | null }) => Promise<{ error: { code?: string } | null }>;
};

export type CallbackResult =
  | { ok: true }
  | { ok: false; error: "invalid_request" | "invalid_name" | "invalid_phone" | "already_requested" | "unavailable" };

export type ChatStep = "intent" | "sellcar" | "name" | "phone" | "retry" | "ask" | "done";
type BotTurn = { texts: string[]; step: ChatStep };

function cleanName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim().slice(0, NAME_MAX);
  return name.length > 0 ? name : null;
}

/** Fields the chat may send. Preferred time and buy/sell mode are not part of the request. */
export function callbackPayload(input: { name?: string; phone?: string; vehicle?: string; carId?: string | null; website?: string }) {
  return {
    name: input.name,
    phone: input.phone,
    vehicle: input.vehicle,
    carId: input.carId ?? null,
    [HONEYPOT_FIELD]: input.website ?? "",
  };
}

/** Says the request is registered. A call is not confirmed until AgentZero processes it. */
export function registeredCallbackMessage(input: { name: string; phone: string; subject?: string | null }) {
  const subject = input.subject ? ` for ${input.subject}` : "";
  return `Thanks, ${input.name}. Your callback request${subject} is registered. We'll use ${input.phone} for the callback.`;
}

/** First bot turn when the panel opens. Without free-text chat the panel only collects a callback. */
export function chatOpening(opts: { car?: Car | null; mode?: "buy" | "sell"; ask?: boolean }, freeText: boolean): BotTurn {
  const { car, mode, ask } = opts;
  if (freeText && car && ask) return { texts: [`Ask me anything about the ${car.year} ${car.name}.`], step: "ask" };
  if (car) {
    return {
      texts: [`The ${car.year} ${car.name} at ${car.price} — good choice.`, "Leave your details and we'll register a callback.", "What's your first name?"],
      step: "name",
    };
  }
  if (mode === "sell") return { texts: ["We buy most pre-owned cars across London.", "What are you selling? A reg or make and model is fine."], step: "sellcar" };
  if (freeText) return { texts: ["Hi, I'm the EGM Trading assistant. How can I help?"], step: "intent" };
  return { texts: ["Leave your details and we'll register a callback.", "What's your first name?"], step: "name" };
}

/** Bot turn after POST /api/callback. An unrecognised error string, including one this route does not produce, gets the generic retry message. */
export function callbackOutcome(
  error: string,
  input: { name: string; phone: string; subject?: string | null },
  freeText: boolean,
): BotTurn & { registered: boolean } {
  const after: ChatStep = freeText ? "ask" : "done";
  if (!error) {
    const texts = [registeredCallbackMessage(input)];
    if (freeText) texts.push("Anything you want to know in the meantime?");
    return { texts, step: after, registered: true };
  }
  if (error === "already_requested") return { texts: ["We've already got a callback request for this number today."], step: after, registered: true };
  if (error === "invalid_phone") return { texts: ["That doesn't look like a UK number — could you check it?"], step: "phone", registered: false };
  if (error === "invalid_name") return { texts: ["What's your first name?"], step: "name", registered: false };
  return { texts: ["Sorry, that didn't go through. Please try again in a moment."], step: "retry", registered: false };
}

/** Stock callbacks store the catalogue car. Sell callbacks store the caller's description. */
export function resolveVehicle(body: { carId?: unknown; vehicle?: unknown }): string | null {
  if (typeof body.carId === "string" && body.carId) {
    const car = cars.find((item) => item.id === body.carId);
    if (car) return `${car.year} ${car.name}`.slice(0, VEHICLE_MAX);
  }
  if (typeof body.vehicle === "string") {
    const vehicle = body.vehicle.trim().slice(0, VEHICLE_MAX);
    if (vehicle) return vehicle;
  }
  return null;
}

export async function createCallbackLead(body: unknown, db: CallbackInsert): Promise<CallbackResult> {
  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const trap = record[HONEYPOT_FIELD];
  if (trap != null && trap !== "") return { ok: false, error: "invalid_request" };

  const name = cleanName(record.name);
  if (!name) return { ok: false, error: "invalid_name" };

  const phone = typeof record.phone === "string" ? normalizeUkPhone(record.phone) : null;
  if (!phone) return { ok: false, error: "invalid_phone" };

  try {
    const { error } = await db.insert({
      name,
      phone_e164: phone,
      vehicle: resolveVehicle(record),
    });
    if (!error) return { ok: true };
    if (error.code === "23505") return { ok: false, error: "already_requested" };
    return { ok: false, error: "unavailable" };
  } catch {
    return { ok: false, error: "unavailable" };
  }
}

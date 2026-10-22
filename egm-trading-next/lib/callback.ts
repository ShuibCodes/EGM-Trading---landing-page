import { cars } from "@/lib/cars";
import { normalizeUkPhone } from "@/lib/phone";

const NAME_MAX = 80;
const VEHICLE_MAX = 120;

export type CallbackInsert = {
  insert: (row: { name: string; phone_e164: string; vehicle: string | null }) => Promise<{ error: { code?: string } | null }>;
};

export type CallbackResult =
  | { ok: true }
  | { ok: false; error: "invalid_name" | "invalid_phone" | "already_requested" | "unavailable" };

function cleanName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim().slice(0, NAME_MAX);
  return name.length > 0 ? name : null;
}

/** Fields the chat may send. Preferred time and buy/sell mode are not part of the request. */
export function callbackPayload(input: { name?: string; phone?: string; vehicle?: string; carId?: string | null }) {
  return {
    name: input.name,
    phone: input.phone,
    vehicle: input.vehicle,
    carId: input.carId ?? null,
  };
}

/** Says the request is registered. A call is not confirmed until AgentZero processes it. */
export function registeredCallbackMessage(input: { name: string; phone: string; subject?: string | null }) {
  const subject = input.subject ? ` for ${input.subject}` : "";
  return `Thanks, ${input.name}. Your callback request${subject} is registered. We'll use ${input.phone} for the callback.`;
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
  const record = body && typeof body === "object" ? (body as { name?: unknown; phone?: unknown; carId?: unknown; vehicle?: unknown }) : {};
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

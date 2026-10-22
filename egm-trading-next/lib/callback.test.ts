import { describe, expect, it, vi } from "vitest";
import { callbackPayload, createCallbackLead, registeredCallbackMessage, resolveVehicle } from "./callback";

const phone = "07911 123456";

function db(error: { code?: string } | null = null) {
  const insert = vi.fn(async () => ({ error }));
  return { insert };
}

describe("resolveVehicle", () => {
  it("uses the stock car when the id is known", () => {
    expect(resolveVehicle({ carId: "audi-a4", vehicle: "something else" })).toBe("2019 Audi A4");
  });

  it("uses free text when the car id is unknown", () => {
    expect(resolveVehicle({ carId: "missing", vehicle: "  2018 Ford Focus  " })).toBe("2018 Ford Focus");
  });

  it("returns null when neither source is usable", () => {
    expect(resolveVehicle({})).toBeNull();
    expect(resolveVehicle({ vehicle: "   " })).toBeNull();
  });
});

describe("callbackPayload", () => {
  it("sends only the fields the callback request stores", () => {
    expect(callbackPayload({ name: "Sam", phone: "07911 123456", vehicle: "2018 Ford Focus", carId: "audi-a4" })).toEqual({
      name: "Sam",
      phone: "07911 123456",
      vehicle: "2018 Ford Focus",
      carId: "audi-a4",
    });
    const payload = callbackPayload({ name: "Sam", phone: "07911 123456" });
    expect(payload).not.toHaveProperty("time");
    expect(payload).not.toHaveProperty("mode");
  });
});

describe("registeredCallbackMessage", () => {
  it("registers the request without saying a call has been placed", () => {
    const message = registeredCallbackMessage({ name: "Sam", phone: "07911 123456", subject: "the Audi A4" });
    expect(message).toBe("Thanks, Sam. Your callback request for the Audi A4 is registered. A call to 07911 123456 should start within a minute.");
    expect(message).not.toMatch(/booked|placed|morning|afternoon|evening/i);
  });
});

describe("createCallbackLead", () => {
  it("stores the normalized phone and ignores client timestamps", async () => {
    const insert = db();
    const result = await createCallbackLead({ name: " Sam ", phone, time: "Morning", requested_at: "2000-01-01" }, insert);
    expect(result).toEqual({ ok: true });
    expect(insert.insert).toHaveBeenCalledWith({
      name: "Sam",
      phone_e164: "+447911123456",
      vehicle: null,
    });
  });

  it("resolves a stock callback to the catalogue vehicle", async () => {
    const insert = db();
    await createCallbackLead({ name: "Sam", phone, carId: "honda-civic" }, insert);
    expect(insert.insert).toHaveBeenCalledWith(expect.objectContaining({ vehicle: "2012 Honda Civic" }));
  });

  it("rejects an empty name or invalid phone before insert", async () => {
    const insert = db();
    expect(await createCallbackLead({ name: "  ", phone }, insert)).toEqual({ ok: false, error: "invalid_name" });
    expect(await createCallbackLead({ name: "Sam", phone: "123" }, insert)).toEqual({ ok: false, error: "invalid_phone" });
    expect(insert.insert).not.toHaveBeenCalled();
  });

  it("maps a unique violation to the same-day duplicate", async () => {
    const insert = db({ code: "23505" });
    expect(await createCallbackLead({ name: "Sam", phone }, insert)).toEqual({ ok: false, error: "already_requested" });
  });

  it("hides other database failures", async () => {
    const insert = db({ code: "42501" });
    expect(await createCallbackLead({ name: "Sam", phone }, insert)).toEqual({ ok: false, error: "unavailable" });
    const throwing = { insert: vi.fn(async () => { throw new Error("network"); }) };
    expect(await createCallbackLead({ name: "Sam", phone }, throwing)).toEqual({ ok: false, error: "unavailable" });
  });
});

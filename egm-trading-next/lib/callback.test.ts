import { describe, expect, it, vi } from "vitest";
import { callbackOutcome, callbackPayload, chatOpening, createCallbackLead, registeredCallbackMessage, resolveVehicle } from "./callback";
import { cars } from "./cars";

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
      website: "",
    });
    const payload = callbackPayload({ name: "Sam", phone: "07911 123456" });
    expect(payload).not.toHaveProperty("time");
    expect(payload).not.toHaveProperty("mode");
  });

  it("forwards the hidden honeypot value", () => {
    expect(callbackPayload({ name: "Sam", phone, website: "http://spam.example" })).toMatchObject({ website: "http://spam.example" });
  });
});

describe("chatOpening", () => {
  const car = cars.find((item) => item.id === "audi-a4")!;

  it("goes straight to the callback form from a car when free-text chat is off", () => {
    expect(chatOpening({ car }, false)).toEqual({
      texts: [`The 2019 Audi A4 at ${car.price} — good choice.`, "Leave your details and we'll register a callback.", "What's your first name?"],
      step: "name",
    });
  });

  it("never opens the question step when free-text chat is off", () => {
    expect(chatOpening({ car, ask: true }, false).step).toBe("name");
    expect(chatOpening({}, false)).toEqual({ texts: ["Leave your details and we'll register a callback.", "What's your first name?"], step: "name" });
  });

  it("keeps the assistant openers when free-text chat is on", () => {
    expect(chatOpening({ car, ask: true }, true).step).toBe("ask");
    expect(chatOpening({}, true).step).toBe("intent");
    expect(chatOpening({ mode: "sell" }, true).step).toBe("sellcar");
  });
});

describe("callbackOutcome", () => {
  const input = { name: "Sam", phone, subject: "the Audi A4" };

  it("ends the callback form after a save when free-text chat is off", () => {
    expect(callbackOutcome("", input, false)).toEqual({ texts: [registeredCallbackMessage(input)], step: "done", registered: true });
  });

  it("offers questions after a save only when free-text chat is on", () => {
    expect(callbackOutcome("", input, true)).toEqual({
      texts: [registeredCallbackMessage(input), "Anything you want to know in the meantime?"],
      step: "ask",
      registered: true,
    });
  });

  it("shows the duplicate message without asking for details again", () => {
    expect(callbackOutcome("already_requested", input, false)).toEqual({
      texts: ["We've already got a callback request for this number today."],
      step: "done",
      registered: true,
    });
  });

  it("sends validation errors back to the matching step", () => {
    expect(callbackOutcome("invalid_phone", input, false)).toMatchObject({ step: "phone", registered: false });
    expect(callbackOutcome("invalid_name", input, false)).toMatchObject({ step: "name", registered: false });
  });

  it("uses one generic retry message for failures, rejected requests, and rate limits", () => {
    for (const error of ["unavailable", "invalid_request", "rate_limited"]) {
      expect(callbackOutcome(error, input, false)).toEqual({
        texts: ["Sorry, that didn't go through. Please try again in a moment."],
        step: "retry",
        registered: false,
      });
    }
  });
});

describe("registeredCallbackMessage", () => {
  it("registers the request without saying a call has been placed", () => {
    const message = registeredCallbackMessage({ name: "Sam", phone: "07911 123456", subject: "the Audi A4" });
    expect(message).toBe("Thanks, Sam. Your callback request for the Audi A4 is registered. We'll use 07911 123456 for the callback.");
    expect(message).not.toMatch(/booked|placed|within a minute|morning|afternoon|evening/i);
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

  it("rejects a filled honeypot without inserting", async () => {
    const insert = db();
    expect(await createCallbackLead({ name: "Sam", phone, website: "http://spam.example" }, insert)).toEqual({
      ok: false,
      error: "invalid_request",
    });
    expect(await createCallbackLead({ name: "Sam", phone, website: 1 }, insert)).toEqual({ ok: false, error: "invalid_request" });
    expect(insert.insert).not.toHaveBeenCalled();
  });

  it("accepts an empty or missing honeypot", async () => {
    const insert = db();
    expect(await createCallbackLead({ name: "Sam", phone, website: "" }, insert)).toEqual({ ok: true });
    expect(await createCallbackLead({ name: "Sam", phone }, insert)).toEqual({ ok: true });
    expect(insert.insert).toHaveBeenCalledTimes(2);
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

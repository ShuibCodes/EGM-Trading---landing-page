import { beforeEach, describe, expect, it, vi } from "vitest";

const createAdminClient = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => createAdminClient(),
}));

import { POST } from "./route";

function post(body: unknown) {
  return POST(new Request("http://localhost/api/callback", { method: "POST", body: JSON.stringify(body) }));
}

describe("POST /api/callback", () => {
  beforeEach(() => {
    createAdminClient.mockReset();
  });

  it("returns 400 and does not insert an invalid phone", async () => {
    const insert = vi.fn();
    createAdminClient.mockReturnValue({ from: () => ({ insert }) });
    const response = await post({ name: "Sam", phone: "123" });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "invalid_phone" });
    expect(insert).not.toHaveBeenCalled();
  });

  it("returns 400 and does not insert when the honeypot is filled, so the insert webhook cannot run", async () => {
    const insert = vi.fn();
    createAdminClient.mockReturnValue({ from: () => ({ insert }) });
    const response = await post({ name: "Sam", phone: "020 7946 0123", website: "http://spam.example" });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "invalid_request" });
    expect(insert).not.toHaveBeenCalled();
  });

  it("returns 503 without detail for other database errors", async () => {
    const insert = vi.fn(async () => ({ error: { code: "42501", message: "permission denied for table callback_requests" } }));
    createAdminClient.mockReturnValue({ from: () => ({ insert }) });
    const response = await post({ name: "Sam", phone: "020 7946 0123" });
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ ok: false, error: "unavailable" });
  });

  it("returns 200 when the row is inserted", async () => {
    const insert = vi.fn(async () => ({ error: null }));
    createAdminClient.mockReturnValue({ from: () => ({ insert }) });
    const response = await post({ name: "Sam", phone: "020 7946 0123", carId: "audi-a4" });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(insert).toHaveBeenCalledWith({ name: "Sam", phone_e164: "+442079460123", vehicle: "2019 Audi A4" });
  });

  it("returns 409 when the phone was already stored today", async () => {
    const insert = vi.fn(async () => ({ error: { code: "23505" } }));
    createAdminClient.mockReturnValue({ from: () => ({ insert }) });
    const response = await post({ name: "Sam", phone: "+447911123456" });
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ ok: false, error: "already_requested" });
  });

  it("has no rate limiter: two valid posts both attempt an insert", async () => {
    const insert = vi.fn(async () => ({ error: null }));
    createAdminClient.mockReturnValue({ from: () => ({ insert }) });
    expect((await post({ name: "Sam", phone: "020 7946 0123" })).status).toBe(200);
    expect((await post({ name: "Sam", phone: "07400 123456" })).status).toBe(200);
    expect(insert).toHaveBeenCalledTimes(2);
  });

  it("returns 503 when storage is not configured", async () => {
    createAdminClient.mockReturnValue(null);
    const response = await post({ name: "Sam", phone: "+447911123456" });
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ ok: false, error: "unavailable" });
  });
});

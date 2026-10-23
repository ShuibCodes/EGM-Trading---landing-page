import { describe, expect, it } from "vitest";
import { normalizeUkPhone } from "./phone";

describe("normalizeUkPhone", () => {
  it("stores the agreed mobile example in E.164", () => {
    expect(normalizeUkPhone("+447911123456")).toBe("+447911123456");
  });

  it("removes the UK trunk prefix from national and international forms", () => {
    expect(normalizeUkPhone("07911 123456")).toBe("+447911123456");
    expect(normalizeUkPhone("07911-123-456")).toBe("+447911123456");
    expect(normalizeUkPhone("+44 (0) 7911 123456")).toBe("+447911123456");
    expect(normalizeUkPhone("+44 07911 123456")).toBe("+447911123456");
    expect(normalizeUkPhone("00447911123456")).toBe("+447911123456");
  });

  it("normalizes a London landline without keeping the trunk zero", () => {
    expect(normalizeUkPhone("020 7946 0123")).toBe("+442079460123");
    expect(normalizeUkPhone("+44 (0) 20 7946 0123")).toBe("+442079460123");
    expect(normalizeUkPhone("0044 20 7946 0123")).toBe("+442079460123");
  });

  it("accepts a GB mobile", () => {
    expect(normalizeUkPhone("07400 123456")).toBe("+447400123456");
  });

  it("rejects numbers that are not callable UK mobiles or landlines", () => {
    expect(normalizeUkPhone("0123456789")).toBeNull();
    expect(normalizeUkPhone("0791112345")).toBeNull();
    expect(normalizeUkPhone("+1 202 555 0123")).toBeNull();
    expect(normalizeUkPhone("123")).toBeNull();
    expect(normalizeUkPhone("not a phone")).toBeNull();
    expect(normalizeUkPhone("")).toBeNull();
    expect(normalizeUkPhone("   ")).toBeNull();
    expect(normalizeUkPhone("0800 111 1111")).toBeNull();
    expect(normalizeUkPhone("0900 123 4567")).toBeNull();
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  new URL("./20261009110400_create_callback_requests.sql", import.meta.url),
  "utf8",
);

describe("callback_requests migration", () => {
  it("does not replace, drop, truncate, or delete shared database objects", () => {
    expect(sql).not.toMatch(/\bcreate\s+or\s+replace\b/i);
    expect(sql).not.toMatch(/\bdrop\b/i);
    expect(sql).not.toMatch(/\btruncate\b/i);
    expect(sql).not.toMatch(/\bdelete\s+from\b/i);
    expect(sql).not.toMatch(/\bcreate\s+policy\b/i);
  });

  it("only alters and triggers the callback_requests table", () => {
    const alteredTables = [...sql.matchAll(/\balter\s+table\s+([^\s;]+)/gi)].map((match) => match[1]);
    const triggerTables = [...sql.matchAll(/\bon\s+([^\s;]+)\s+for\s+each\s+row/gi)].map((match) => match[1]);

    expect(alteredTables).toEqual(["public.callback_requests"]);
    expect(triggerTables).toEqual(["public.callback_requests"]);
  });

  it("contains the agreed contract and database-enforced UK-day deduplication", () => {
    for (const column of [
      "name",
      "phone_e164",
      "vehicle",
      "status",
      "requested_at",
      "requested_on",
      "call_placed_at",
      "last_attempt_at",
      "call_ended_at",
      "next_retry_at",
      "vapi_call_id",
      "ended_reason",
      "summary",
      "attempts",
      "outcome",
    ]) {
      expect(sql).toMatch(new RegExp(`\\b${column}\\b`, "i"));
    }

    expect(sql).toMatch(/at\s+time\s+zone\s+'Europe\/London'/i);
    expect(sql).toMatch(
      /create\s+unique\s+index\s+callback_requests_one_per_phone_per_uk_day[\s\S]*\(phone_e164,\s*requested_on\)/i,
    );
  });

  it("enables RLS and removes browser-role table privileges", () => {
    expect(sql).toMatch(/alter\s+table\s+public\.callback_requests\s+enable\s+row\s+level\s+security/i);
    expect(sql).toMatch(/revoke\s+all\s+on\s+table\s+public\.callback_requests\s+from\s+anon,\s*authenticated/i);
    expect(sql).not.toMatch(/\bcreate\s+policy\b/i);
  });

  it("revokes table privileges, then grants service_role only select, insert, and update", () => {
    const revokeBrowser = "revoke all on table public.callback_requests from anon, authenticated;";
    const revokeService = "revoke all on table public.callback_requests from service_role;";
    const grantService = "grant select, insert, update on table public.callback_requests to service_role;";
    const revokeFunction =
      "revoke all on function public.callback_requests_set_requested_on() from public, anon, authenticated;";
    const grantFunction =
      "grant execute on function public.callback_requests_set_requested_on() to service_role;";

    for (const statement of [revokeBrowser, revokeService, grantService, revokeFunction, grantFunction]) {
      expect(sql).toContain(statement);
    }

    expect(sql.indexOf(revokeService)).toBeLessThan(sql.indexOf(grantService));
    expect(sql).not.toMatch(/grant\s+[^;]*\b(delete|all)\b/i);
    expect(sql).not.toMatch(/grant\s+[^;]*\bto\s+(anon|authenticated|public)\b/i);
  });
});

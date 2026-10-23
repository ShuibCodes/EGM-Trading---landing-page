import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(new URL("./preflight_callback_requests.sql", import.meta.url), "utf8");

describe("callback_requests preflight", () => {
  it("is limited to catalog reads", () => {
    expect(sql).not.toMatch(/\b(create|alter|drop|truncate|insert|update|delete|grant|revoke)\b/i);
  });

  it("checks the table, function, index, and trigger names", () => {
    expect(sql).toContain("'callback_requests'");
    expect(sql).toContain("'callback_requests_set_requested_on'");
    expect(sql).toContain("'callback_requests_one_per_phone_per_uk_day'");
    expect(sql).toMatch(/pg_catalog\.pg_proc/);
    expect(sql).toMatch(/pg_catalog\.pg_trigger/);
    expect(sql).toMatch(/'trigger'/);
  });

  it("reports whether the callback table exists and lists its columns", () => {
    expect(sql).toMatch(/callback_requests_table_exists/);
    expect(sql).toMatch(/from\s+information_schema\.columns/i);
    expect(sql).toMatch(/column_name/);
    expect(sql).toMatch(/data_type/);
  });
});
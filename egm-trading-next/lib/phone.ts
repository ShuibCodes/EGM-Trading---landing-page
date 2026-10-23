import { parsePhoneNumberFromString, type NumberType } from "libphonenumber-js";

/** Stored shape: +44 plus a 10-digit national number, trunk 0 removed. */
const UK_E164 = /^\+44[1-9][0-9]{9}$/;

const CALLABLE: ReadonlySet<NumberType> = new Set(["MOBILE", "FIXED_LINE", "FIXED_LINE_OR_MOBILE"]);

/**
 * Normalize a UK phone number to E.164.
 * Returns null when the input is not a valid callable +44 mobile or landline.
 * `07911…`, `+44 (0) 7911…`, and `0044…` all collapse to the same value.
 * Region is not limited to GB: the numbering plan marks some +44 mobiles, including +447911123456, as GG.
 */
export function normalizeUkPhone(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const compact = trimmed.replace(/[\s().-]/g, "");
  const prepared = compact.startsWith("00") ? `+${compact.slice(2)}` : trimmed;

  const parsed = parsePhoneNumberFromString(prepared, "GB");
  if (!parsed?.isValid() || parsed.countryCallingCode !== "44") return null;
  const type = parsed.getType();
  if (!type || !CALLABLE.has(type)) return null;

  const e164 = parsed.number;
  return UK_E164.test(e164) ? e164 : null;
}

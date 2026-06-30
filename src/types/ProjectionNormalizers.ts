import { normalizeSkills } from "../merger/SkillNormalizer.js";

type NormalizeFn = (value: any) => any;

/**
 * Best-effort E.164 formatter.
 * Assumption (documented): bare 10-digit numbers are assumed Indian (+91).
 * Numbers already carrying a plausible country code length are passed through with a "+".
 * This is a deliberate simplification — true E.164 needs a real phone-number library
 * (e.g. libphonenumber) for production correctness; noted as a known limitation.
 */
function toE164(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length > 10) {
    return `+${digits}`;
  }

  return value; // can't confidently normalize, return as-is rather than invent data
}

function applyToValue(value: any, fn: (v: string) => string): any {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map((v) => (typeof v === "string" ? fn(v) : v));
  if (typeof value === "string") return fn(value);
  return value;
}

const NORMALIZERS: Record<string, NormalizeFn> = {
  E164: (value) => applyToValue(value, toE164),
  canonical: (value) => (Array.isArray(value) ? normalizeSkills(value) : value),
};

export function getNormalizer(name?: string): NormalizeFn | undefined {
  if (!name) return undefined;
  return NORMALIZERS[name];
}
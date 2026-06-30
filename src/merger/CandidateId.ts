import { createHash } from "crypto";
import { RawCandidate } from "../types/rawCandidate.js";

/**
 * Deterministic candidate ID derived from stable identity signals.
 * Same inputs -> same ID, satisfying the "deterministic & explainable" constraint.
 * Falls back through email -> phone -> name so a candidate missing one signal
 * still gets a stable ID across runs, as long as at least one signal exists.
 */
export function computeCandidateId(csv: RawCandidate, resume: RawCandidate): string {
  const seed =
    csv.emails?.[0] ??
    resume.emails?.[0] ??
    csv.phones?.[0] ??
    resume.phones?.[0] ??
    csv.fullName ??
    resume.fullName ??
    "unknown-candidate";

  const hash = createHash("sha256").update(seed.toLowerCase().trim()).digest("hex");

  // format as a UUID-v4-shaped string for compatibility with consumers expecting that shape
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    "4" + hash.slice(13, 16),
    "a" + hash.slice(17, 20),
    hash.slice(20, 32),
  ].join("-");
}
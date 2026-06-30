import { RawCandidate } from "../types/rawCandidate.js";

import {
  normalizeEmails,
  normalizePhones,
  normalizeName,
  normalizeWhitespace,
} from "./normalizationHelper.js";

export class LightweightNormalizer {
  /**
   * Performs lightweight normalization.
   * Only normalizes fields required for identity resolution.
   */
  normalize(candidate: RawCandidate): RawCandidate {
    return {
  ...candidate,

  fullName:
    candidate.fullName !== undefined
      ? normalizeName(candidate.fullName)
      : undefined,

  emails:
    candidate.emails !== undefined
      ? normalizeEmails(candidate.emails)
      : undefined,

  phones:
    candidate.phones !== undefined
      ? normalizePhones(candidate.phones)
      : undefined,

  headline:
    candidate.headline !== undefined
      ? normalizeWhitespace(candidate.headline)
      : undefined,
};
  }

  normalizeAll(candidates: RawCandidate[]): RawCandidate[] {
    return candidates.map((candidate) => this.normalize(candidate));
  }
}
import { RawCandidate } from "../types/rawCandidate.js";
import { IdentityMatch } from "../types/IdentityMatch.js";

const CONFIDENCE = {
  EMAIL: 40,
  PHONE: 30,
  NAME: 20,
  GITHUB: 5,
  LINKEDIN: 5,
} as const;

const MATCH_THRESHOLD = 60;

export class IdentityResolver {

  resolve(
    candidateA: RawCandidate,
    candidateB: RawCandidate
  ): IdentityMatch {

    let confidence = 0;

    const reasons: string[] = [];

    // Email

    if (this.emailMatch(candidateA, candidateB)) {

      confidence += CONFIDENCE.EMAIL;

      reasons.push("Exact email match");

    }

    // Phone

    if (this.phoneMatch(candidateA, candidateB)) {

      confidence += CONFIDENCE.PHONE;

      reasons.push("Exact phone match");

    }

    // Name

    if (this.nameMatch(candidateA, candidateB)) {

      confidence += CONFIDENCE.NAME;

      reasons.push("Exact name match");

    }

    // GitHub

    if (this.githubMatch(candidateA, candidateB)) {

      confidence += CONFIDENCE.GITHUB;

      reasons.push("GitHub profile match");

    }

    // LinkedIn

    if (this.linkedinMatch(candidateA, candidateB)) {

      confidence += CONFIDENCE.LINKEDIN;

      reasons.push("LinkedIn profile match");

    }

    return {

      isMatch: confidence >= MATCH_THRESHOLD,

      confidence,

      reasons

    };

  }

  // --------------------------------------------------

  private emailMatch(
    a: RawCandidate,
    b: RawCandidate
  ): boolean {

    if (!a.emails || !b.emails) {

      return false;

    }

    return a.emails.some(email =>
      b.emails!.includes(email)
    );

  }

  // --------------------------------------------------

  private phoneMatch(
    a: RawCandidate,
    b: RawCandidate
  ): boolean {

    if (!a.phones || !b.phones) {

      return false;

    }

    return a.phones.some(phone =>
      b.phones!.includes(phone)
    );

  }

  // --------------------------------------------------

  private nameMatch(
    a: RawCandidate,
    b: RawCandidate
  ): boolean {

    if (!a.fullName || !b.fullName) {

      return false;

    }

    return a.fullName === b.fullName;

  }

  // --------------------------------------------------

  private githubMatch(
    a: RawCandidate,
    b: RawCandidate
  ): boolean {

    if (
      !a.links?.github ||
      !b.links?.github
    ) {

      return false;

    }

    return a.links.github === b.links.github;

  }

  // --------------------------------------------------

  private linkedinMatch(
    a: RawCandidate,
    b: RawCandidate
  ): boolean {

    if (
      !a.links?.linkedin ||
      !b.links?.linkedin
    ) {

      return false;

    }

    return a.links.linkedin === b.links.linkedin;

  }

}
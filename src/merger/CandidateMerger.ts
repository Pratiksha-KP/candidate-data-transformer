import { randomUUID } from "crypto";

import { Candidate } from "../types/candidate.js";
import { IdentityMatch } from "../types/IdentityMatch.js";
import { RawCandidate } from "../types/rawCandidate.js";

import { normalizeSkills } from "./SkillNormalizer.js";

import {
  createField,
  mergeArrays,
  mergeScalar,
} from "./MergerUtils.js";

export class CandidateMerger {

  merge(
    csv: RawCandidate,
    resume: RawCandidate,
    identity: IdentityMatch
  ): Candidate {

    if (!identity.isMatch) {
      throw new Error("Candidates do not represent the same person.");
    }

    return {

      candidateId: randomUUID(),

      fullName: createField(

        mergeScalar(
          csv.fullName,
          resume.fullName
        ),

        identity.confidence,

        csv.fullName !== undefined,

        resume.fullName !== undefined,

        "Full Name"

      ),

      emails: createField(

        mergeArrays(
          csv.emails,
          resume.emails
        ),

        identity.confidence,

        csv.emails !== undefined,

        resume.emails !== undefined,

        "Emails"

      ),

      phones: createField(

        mergeArrays(
          csv.phones,
          resume.phones
        ),

        identity.confidence,

        csv.phones !== undefined,

        resume.phones !== undefined,

        "Phones"

      ),

      location: createField(

        mergeScalar(
          csv.location,
          resume.location
        ),

        identity.confidence,

        csv.location !== undefined,

        resume.location !== undefined,

        "Location"

      ),

      links: createField(

        mergeScalar(
          csv.links,
          resume.links
        ),

        identity.confidence,

        csv.links !== undefined,

        resume.links !== undefined,

        "Links"

      ),

      headline: createField(

        mergeScalar(
          csv.headline,
          resume.headline
        ),

        identity.confidence,

        csv.headline !== undefined,

        resume.headline !== undefined,

        "Headline"

      ),

      skills: createField(

        normalizeSkills(

          mergeArrays(
            csv.skills,
            resume.skills
          )

        ),

        identity.confidence,

        csv.skills !== undefined,

        resume.skills !== undefined,

        "Skills"

      ),

      experience: createField(

        mergeArrays(
          csv.experience,
          resume.experience
        ),

        identity.confidence,

        csv.experience !== undefined,

        resume.experience !== undefined,

        "Experience"

      ),

      education: createField(

        mergeArrays(
          csv.education,
          resume.education
        ),

        identity.confidence,

        csv.education !== undefined,

        resume.education !== undefined,

        "Education"

      ),

      overallConfidence: identity.confidence

    };

  }

}
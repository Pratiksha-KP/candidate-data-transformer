import { Candidate } from "../types/candidate.js";
import { IdentityMatch } from "../types/IdentityMatch.js";
import { RawCandidate } from "../types/rawCandidate.js";

import { normalizeSkillsWithSources } from "./SkillNormalizer.js";
import { computeYearsExperience } from "./ExperienceUtils.js";
import { computeCandidateId } from "./CandidateId.js";

import {
  createField,
  mergeArrays,
  mergeScalar,
  mergeLinks,
  mergeLocation,
} from "./MergerUtils.js";

export class CandidateMerger {
  merge(csv: RawCandidate, resume: RawCandidate, identity: IdentityMatch): Candidate {
    if (!identity.isMatch) {
      throw new Error("Candidates do not represent the same person.");
    }

    const mergedExperience = mergeArrays(csv.experience, resume.experience);
    const skillEntries = normalizeSkillsWithSources(
      csv.skills,
      csv.source,
      resume.skills,
      resume.source
    );

    return {
      candidateId: computeCandidateId(csv, resume),

      fullName: createField(
        mergeScalar(csv.fullName, resume.fullName),
        identity.confidence,
        csv.fullName !== undefined,
        resume.fullName !== undefined,
        "Full Name"
      ),

      emails: createField(
        mergeArrays(csv.emails, resume.emails),
        identity.confidence,
        csv.emails !== undefined,
        resume.emails !== undefined,
        "Emails"
      ),

      phones: createField(
        mergeArrays(csv.phones, resume.phones),
        identity.confidence,
        csv.phones !== undefined,
        resume.phones !== undefined,
        "Phones"
      ),

      location: createField(
        mergeLocation(csv.location, resume.location),
        identity.confidence,
        csv.location !== undefined,
        resume.location !== undefined,
        "Location"
      ),

      links: createField(
        mergeLinks(csv.links, resume.links),
        identity.confidence,
        csv.links !== undefined,
        resume.links !== undefined,
        "Links"
      ),

      headline: createField(
        mergeScalar(csv.headline, resume.headline),
        identity.confidence,
        csv.headline !== undefined,
        resume.headline !== undefined,
        "Headline"
      ),

      skills: createField(
        skillEntries.length > 0 ? skillEntries : null,
        identity.confidence,
        csv.skills !== undefined,
        resume.skills !== undefined,
        "Skills"
      ),

      experience: createField(
        mergedExperience,
        identity.confidence,
        csv.experience !== undefined,
        resume.experience !== undefined,
        "Experience"
      ),

      education: createField(
        mergeArrays(csv.education, resume.education),
        identity.confidence,
        csv.education !== undefined,
        resume.education !== undefined,
        "Education"
      ),

      yearsExperience: createField(
        computeYearsExperience(mergedExperience),
        identity.confidence,
        csv.experience !== undefined,
        resume.experience !== undefined,
        "Years Experience"
      ),

      overallConfidence: identity.confidence,
    };
  }
}
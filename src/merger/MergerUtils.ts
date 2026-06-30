import {
  AuditDecision,
  Confidence,
  Field,
  Provenance,
} from "../types/candidate.js";
import { Links, Location } from "../types/common.js";

export function mergeArrays<T>(csv?: T[], resume?: T[]): T[] {
  return [...new Set([...(csv ?? []), ...(resume ?? [])])];
}

export function mergeScalar<T>(csv?: T, resume?: T): T | null {
  return resume ?? csv ?? null;
}

/**
 * Merges links field-by-field instead of picking one source wholesale,
 * so a LinkedIn URL from the CSV isn't silently dropped just because
 * the resume happened to also have a links object.
 */
export function mergeLinks(csv?: Links, resume?: Links): Links | null {
  if (!csv && !resume) return null;

  const merged: Links = {
    linkedin: resume?.linkedin ?? csv?.linkedin,
    github: resume?.github ?? csv?.github,
    portfolio: resume?.portfolio ?? csv?.portfolio,
    other: [...new Set([...(csv?.other ?? []), ...(resume?.other ?? [])])],
  };

  if (merged.other?.length === 0) delete merged.other;

  return merged;
}

/** Same reasoning as mergeLinks: merge field-by-field, not source-by-source. */
export function mergeLocation(csv?: Location, resume?: Location): Location | null {
  if (!csv && !resume) return null;

  return {
    city: resume?.city ?? csv?.city ?? null,
    region: resume?.region ?? csv?.region ?? null,
    country: resume?.country ?? csv?.country ?? null,
  };
}

function createProvenance(csvExists: boolean, resumeExists: boolean): Provenance[] {
  const provenance: Provenance[] = [];
  if (csvExists) provenance.push({ source: "Recruiter CSV", extractionMethod: "Structured Parser" });
  if (resumeExists) provenance.push({ source: "Resume", extractionMethod: "Resume Parser" });
  return provenance;
}

function createAudit(fieldName: string, csvExists: boolean, resumeExists: boolean): AuditDecision {
  return {
    ruleApplied: "Resume preferred over CSV; structured fields merged per-property",
    reason: resumeExists ? `${fieldName} selected from Resume` : `${fieldName} selected from CSV`,
    candidatesConsidered: [
      ...(csvExists ? ["Recruiter CSV"] : []),
      ...(resumeExists ? ["Resume"] : []),
    ],
  };
}

function createConfidence(score: number): Confidence {
  return {
    score,
    breakdown: {
      sourceReliability: score,
      extractionConfidence: score,
      crossSourceAgreement: score,
      completeness: score,
      validation: score,
    },
  };
}

export function createField<T>(
  value: T,
  confidence: number,
  csvExists: boolean,
  resumeExists: boolean,
  fieldName: string
): Field<T> {
  return {
    value,
    confidence: createConfidence(confidence),
    provenance: createProvenance(csvExists, resumeExists),
    audit: createAudit(fieldName, csvExists, resumeExists),
  };
}
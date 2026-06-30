import {
  Education,
  Experience,
  Links,
  Location,
} from "./common";

/*
 * Metadata attached to every field
 */

export interface Provenance {
  source: string;
  extractionMethod: string;
}

export interface AuditDecision {
  ruleApplied: string;
  reason: string;
  candidatesConsidered: string[];
}

export interface ConfidenceBreakdown {
  sourceReliability: number;
  extractionConfidence: number;
  crossSourceAgreement: number;
  completeness: number;
  validation: number;
}

export interface Confidence {
  score: number;
  breakdown: ConfidenceBreakdown;
}

/*
 * Generic wrapper used for every canonical field
 */

export interface Field<T> {
  value: T;

  confidence?: Confidence;

  provenance: Provenance[];

  audit: AuditDecision;
}

/*
 * Canonical candidate profile
 */

export interface Candidate {

  candidateId: string;

  fullName: Field<string | null>;

  emails: Field<string[] | null>;

  phones: Field<string[]>;

  location: Field<Location | null>;

  links: Field<Links | null>;

  headline: Field<string | null>;

  skills: Field<string[] | null>;

  experience: Field<Experience[] | null>;

  education: Field<Education[] | null>;

  overallConfidence: number;
}
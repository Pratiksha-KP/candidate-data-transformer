import {
  Education,
  Experience,
  Links,
  Location,
} from "./common";

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

export interface Field<T> {
  value: T;
  confidence?: Confidence;
  provenance: Provenance[];
  audit: AuditDecision;
}

/** Per-skill structure required by the default output schema */
export interface SkillEntry {
  name: string;
  confidence: number;
  sources: string[];
}

export interface Candidate {
  candidateId: string;

  fullName: Field<string | null>;
  emails: Field<string[] | null>;
  phones: Field<string[]>;
  location: Field<Location | null>;
  links: Field<Links | null>;
  headline: Field<string | null>;

  skills: Field<SkillEntry[] | null>;

  experience: Field<Experience[] | null>;
  education: Field<Education[] | null>;

  /** Computed from experience; null when it can't be honestly derived (see ExperienceUtils) */
  yearsExperience: Field<number | null>;

  overallConfidence: number;
}
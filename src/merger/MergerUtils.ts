import {
  AuditDecision,
  Confidence,
  Field,
  Provenance,
} from "../types/candidate.js";

/**
 * Merge two arrays while removing duplicates.
 */
export function mergeArrays<T>(
  csv?: T[],
  resume?: T[]
): T[] {

  return [...new Set([
    ...(csv ?? []),
    ...(resume ?? [])
  ])];

}

/**
 * Merge two scalar values.
 * Resume is preferred over CSV.
 */
export function mergeScalar<T>(
  csv?: T,
  resume?: T
): T | null {

  return resume ?? csv ?? null;

}

/**
 * Create provenance metadata.
 */
function createProvenance(
  csvExists: boolean,
  resumeExists: boolean
): Provenance[] {

  const provenance: Provenance[] = [];

  if (csvExists) {

    provenance.push({

      source: "Recruiter CSV",

      extractionMethod: "Structured Parser"

    });

  }

  if (resumeExists) {

    provenance.push({

      source: "Resume",

      extractionMethod: "Resume Parser"

    });

  }

  return provenance;

}

/**
 * Create audit metadata.
 */
function createAudit(
  fieldName: string,
  csvExists: boolean,
  resumeExists: boolean
): AuditDecision {

  return {

    ruleApplied: "Resume preferred over CSV",

    reason:

      resumeExists
        ? `${fieldName} selected from Resume`
        : `${fieldName} selected from CSV`,

    candidatesConsidered: [

      ...(csvExists ? ["Recruiter CSV"] : []),

      ...(resumeExists ? ["Resume"] : [])

    ]

  };

}

/**
 * Create confidence metadata.
 *
 * Currently every field inherits the
 * identity confidence.
 */
function createConfidence(
  score: number
): Confidence {

  return {

    score,

    breakdown: {

      sourceReliability: score,

      extractionConfidence: score,

      crossSourceAgreement: score,

      completeness: score,

      validation: score

    }

  };

}

/**
 * Generic helper to create a canonical field.
 */
export function createField<T>(

  value: T,

  confidence: number,

  csvExists: boolean,

  resumeExists: boolean,

  fieldName: string

): Field<T> {

  return {

    value,

    confidence: createConfidence(
      confidence
    ),

    provenance: createProvenance(
      csvExists,
      resumeExists
    ),

    audit: createAudit(
      fieldName,
      csvExists,
      resumeExists
    )

  };

}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeArrays = mergeArrays;
exports.mergeScalar = mergeScalar;
exports.createField = createField;
/**
 * Merge two arrays while removing duplicates.
 */
function mergeArrays(csv, resume) {
    return [...new Set([
            ...(csv ?? []),
            ...(resume ?? [])
        ])];
}
/**
 * Merge two scalar values.
 * Resume is preferred over CSV.
 */
function mergeScalar(csv, resume) {
    return resume ?? csv ?? null;
}
/**
 * Create provenance metadata.
 */
function createProvenance(csvExists, resumeExists) {
    const provenance = [];
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
function createAudit(fieldName, csvExists, resumeExists) {
    return {
        ruleApplied: "Resume preferred over CSV",
        reason: resumeExists
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
function createConfidence(score) {
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
function createField(value, confidence, csvExists, resumeExists, fieldName) {
    return {
        value,
        confidence: createConfidence(confidence),
        provenance: createProvenance(csvExists, resumeExists),
        audit: createAudit(fieldName, csvExists, resumeExists)
    };
}

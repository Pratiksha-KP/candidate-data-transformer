"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CandidateMerger_js_1 = require("./merger/CandidateMerger.js");
const csvParser_js_1 = require("./parsers/csvParser.js");
const ResumeParser_js_1 = require("./parsers/ResumeParser.js");
const LightweightNormalizer_js_1 = require("./normalizers/LightweightNormalizer.js");
const IdentityResolver_js_1 = require("./identity/IdentityResolver.js");
const CandidateProjection_js_1 = require("./projection/CandidateProjection.js");
const CandidateValidator_js_1 = require("./validation/CandidateValidator.js");
async function main() {
    // -----------------------------
    // Parse Input Sources
    // -----------------------------
    const csvParser = new csvParser_js_1.CSVParser();
    const resumeParser = new ResumeParser_js_1.ResumeParser();
    const csvCandidates = await csvParser.parse("./sample_inputs/recruiter.csv");
    const resumeCandidates = await resumeParser.parse("./sample_inputs/resume.pdf");
    console.log("========== RAW CSV ==========\n");
    console.dir(csvCandidates, { depth: null });
    console.log("\n========== RAW RESUME ==========\n");
    console.dir(resumeCandidates, { depth: null });
    // -----------------------------
    // Lightweight Normalization
    // -----------------------------
    const normalizer = new LightweightNormalizer_js_1.LightweightNormalizer();
    const normalizedCsv = normalizer.normalizeAll(csvCandidates);
    const normalizedResume = normalizer.normalizeAll(resumeCandidates);
    console.log("\n========== NORMALIZED CSV ==========\n");
    console.dir(normalizedCsv, { depth: null });
    console.log("\n========== NORMALIZED RESUME ==========\n");
    console.dir(normalizedResume, { depth: null });
    // -----------------------------
    // Identity Resolution
    // -----------------------------
    const resolver = new IdentityResolver_js_1.IdentityResolver();
    const identityMatch = resolver.resolve(normalizedCsv[0], normalizedResume[0]);
    console.log("\n========== IDENTITY MATCH ==========\n");
    console.dir(identityMatch, { depth: null });
    // -----------------------------
    // Canonicalization
    // -----------------------------
    const merger = new CandidateMerger_js_1.CandidateMerger();
    const canonicalCandidate = merger.merge(normalizedCsv[0], normalizedResume[0], identityMatch);
    console.log("\n========== CANONICAL CANDIDATE ==========\n");
    console.dir(canonicalCandidate, { depth: null });
    // -----------------------------
    // PROJECTIONS
    // -----------------------------
    const projection = new CandidateProjection_js_1.CandidateProjection();
    const projected = projection.project(canonicalCandidate);
    console.log("\n========== PROJECTED CANDIDATE ==========\n");
    console.dir(projected, { depth: null });
    // -----------------------------
    // VALIDATION
    // -----------------------------
    const validator = new CandidateValidator_js_1.CandidateValidator();
    const result = validator.validate(projected);
    console.log("\n========== VALIDATION RESULT ==========\n");
    console.dir(result, { depth: null });
} // <-- main() ends here
main().catch(console.error);

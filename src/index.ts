import { CandidateMerger } from "./merger/CandidateMerger.js";
import { CSVParser } from "./parsers/csvParser.js";
import { ResumeParser } from "./parsers/ResumeParser.js";

import { LightweightNormalizer } from "./normalizers/LightweightNormalizer.js";
import { IdentityResolver } from "./identity/IdentityResolver.js";
import { CandidateProjection } from "./projection/CandidateProjection.js";
import { CandidateValidator } from "./validation/CandidateValidator.js";

async function main() {

    // -----------------------------
    // Parse Input Sources
    // -----------------------------

    const csvParser = new CSVParser();
    const resumeParser = new ResumeParser();

    const csvCandidates = await csvParser.parse(
        "./sample_inputs/recruiter.csv"
    );

    const resumeCandidates = await resumeParser.parse(
        "./sample_inputs/resume.pdf"
    );

    console.log("========== RAW CSV ==========\n");
    console.dir(csvCandidates, { depth: null });

    console.log("\n========== RAW RESUME ==========\n");
    console.dir(resumeCandidates, { depth: null });

    // -----------------------------
    // Lightweight Normalization
    // -----------------------------

    const normalizer = new LightweightNormalizer();

    const normalizedCsv = normalizer.normalizeAll(csvCandidates);
    const normalizedResume = normalizer.normalizeAll(resumeCandidates);

    console.log("\n========== NORMALIZED CSV ==========\n");
    console.dir(normalizedCsv, { depth: null });

    console.log("\n========== NORMALIZED RESUME ==========\n");
    console.dir(normalizedResume, { depth: null });

    // -----------------------------
    // Identity Resolution
    // -----------------------------

    const resolver = new IdentityResolver();

    const identityMatch = resolver.resolve(
        normalizedCsv[0],
        normalizedResume[0]
    );

    console.log("\n========== IDENTITY MATCH ==========\n");
    console.dir(identityMatch, { depth: null });

    // -----------------------------
    // Canonicalization
    // -----------------------------

    const merger = new CandidateMerger();

    const canonicalCandidate = merger.merge(
        normalizedCsv[0],
        normalizedResume[0],
        identityMatch
    );

    console.log("\n========== CANONICAL CANDIDATE ==========\n");
    console.dir(canonicalCandidate, { depth: null });
    
    // -----------------------------
    // PROJECTIONS
    // -----------------------------

    const projection = new CandidateProjection();
    const projected = projection.project( canonicalCandidate);

    console.log("\n========== PROJECTED CANDIDATE ==========\n");
    console.dir(projected, { depth: null });

    // -----------------------------
    // VALIDATION
    // -----------------------------

    const validator = new CandidateValidator();
    const result = validator.validate(projected);
    
    console.log("\n========== VALIDATION RESULT ==========\n");
    console.dir(result, { depth: null });
} // <-- main() ends here

main().catch(console.error);
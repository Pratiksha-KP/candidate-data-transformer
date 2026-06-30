import { CandidateMerger } from "./merger/CandidateMerger.js";
import { CSVParser } from "./parsers/csvParser.js";
import { ResumeParser } from "./parsers/ResumeParser.js";

import { LightweightNormalizer } from "./normalizers/LightweightNormalizer.js";
import { IdentityResolver } from "./identity/IdentityResolver.js";
import { CandidateProjection } from "./projection/CandidateProjection.js";
import { CandidateValidator } from "./validation/CandidateValidator.js";
import { ProjectionConfig } from "./types/projectionConfig.js";
import { RawCandidate } from "./types/rawCandidate.js";

/**
 * Parses a single source, returning an empty result instead of crashing
 * the whole pipeline if the source is missing or malformed.
 * Satisfies the "robust — a missing or garbage source must not crash the run" constraint.
 */
async function safeParse(
  label: string,
  fn: () => Promise<RawCandidate[]>
): Promise<RawCandidate[]> {
  try {
    return await fn();
  } catch (err) {
    console.warn(`[WARN] Failed to parse ${label}: ${(err as Error).message}`);
    return [];
  }
}

async function main() {
  // -----------------------------
  // Parse Input Sources
  // -----------------------------

  const csvParser = new CSVParser();
  const resumeParser = new ResumeParser();

  const csvCandidates = await safeParse("Recruiter CSV", () =>
    csvParser.parse("./sample_inputs/recruiter.csv")
  );

  const resumeCandidates = await safeParse("Resume", () =>
    resumeParser.parse("./sample_inputs/resume.pdf")
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

  if (normalizedCsv.length === 0 && normalizedResume.length === 0) {
    console.error("[FATAL] No usable candidates from any source. Exiting.");
    return;
  }

  // Fall back to an empty RawCandidate if one source is entirely missing,
  // so identity resolution / merge can still run on the source that did parse.
  const csvRecord: RawCandidate = normalizedCsv[0] ?? { source: "Recruiter CSV" };
  const resumeRecord: RawCandidate = normalizedResume[0] ?? { source: "Resume" };

  // -----------------------------
  // Identity Resolution
  // -----------------------------

  const resolver = new IdentityResolver();
  const identityMatch = resolver.resolve(csvRecord, resumeRecord);

  console.log("\n========== IDENTITY MATCH ==========\n");
  console.dir(identityMatch, { depth: null });

  // -----------------------------
  // Canonicalization
  // -----------------------------

  const merger = new CandidateMerger();

  let canonicalCandidate;
  try {
    canonicalCandidate = merger.merge(csvRecord, resumeRecord, identityMatch);
  } catch (err) {
    console.error(`[ERROR] Merge failed: ${(err as Error).message}`);
    console.error("Treating sources as distinct candidates is out of scope for this run; exiting.");
    return;
  }

  console.log("\n========== CANONICAL CANDIDATE ==========\n");
  console.dir(canonicalCandidate, { depth: null });

  // -----------------------------
  // PROJECTIONS — default schema
  // -----------------------------

  const projection = new CandidateProjection();
  const projected = projection.project(canonicalCandidate);

  console.log("\n========== PROJECTED CANDIDATE (default schema) ==========\n");
  console.dir(projected, { depth: null });

  // -----------------------------
  // VALIDATION — default schema
  // -----------------------------

  const validator = new CandidateValidator();
  const result = validator.validate(projected);

  console.log("\n========== VALIDATION RESULT (default schema) ==========\n");
  console.dir(result, { depth: null });

  // -----------------------------
  // PROJECTIONS — custom runtime config
  // (exercises the "required twist": field subset, renaming, normalization,
  //  confidence toggle, on_missing policy)
  // -----------------------------

  const customConfig: ProjectionConfig = {
    fields: [
      { path: "full_name", from: "fullName", type: "string", required: true },
      { path: "primary_email", from: "emails[0]", type: "string", required: true },
      { path: "phone", from: "phones[0]", type: "string", normalize: "E164" },
      { path: "skills", from: "skills[].name", type: "string[]", normalize: "canonical" },
    ],
    include_confidence: true,
    include_provenance: false,
    on_missing: "null",
  };

  const projectedCustom = projection.project(canonicalCandidate, customConfig);

  console.log("\n========== PROJECTED CANDIDATE (custom config) ==========\n");
  console.dir(projectedCustom, { depth: null });
}

main().catch((err) => {
  console.error("[FATAL] Unhandled pipeline error:", err);
});
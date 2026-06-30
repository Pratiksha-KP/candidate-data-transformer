# Candidate Data Transformer

A modular TypeScript pipeline that ingests candidate information from multiple sources (structured and unstructured), resolves duplicate identities, merges conflicting information into a canonical candidate profile, validates the output, and projects it into configurable schemas.

> Built for the Eightfold Engineering Intern (Jul-Dec 2026) take-home assignment.

---

## Assignment Objectives

This project implements a simplified version of a candidate data ingestion pipeline similar to those used in modern Applicant Tracking Systems (ATS).

Implemented capabilities include:

- Structured data parsing (Recruiter CSV)
- Unstructured resume parsing (PDF/DOCX)
- Data normalization
- Identity resolution
- Candidate profile merging
- Field-level confidence scoring
- Provenance tracking
- Runtime-configurable output projection
- Schema validation using Zod

---

# Architecture

```
                Recruiter CSV
                      │
                      ▼
               CSV Parser
                      │
                      │
 Resume (PDF/DOCX) ─────► Resume Parser
                      │
                      ▼
              Raw Candidate Objects
                      │
                      ▼
                Normalization
                      │
                      ▼
            Identity Resolution
                      │
                      ▼
             Candidate Merger
                      │
                      ▼
           Canonical Candidate Model
                      │
             ┌────────┴────────┐
             ▼                 ▼
      Schema Validation    Projection Engine
             │                 │
             └────────┬────────┘
                      ▼
                Final JSON Output
```

---

# Project Structure

```
src/
│
├── parsers/
│   ├── CsvParser.ts
│   ├── ResumeParser.ts
│   ├── documentExtractor.ts
│   ├── sectionExtractor.ts
│   └── IParser.ts
│
├── normalizers/
│   ├── LightweightNormalizer.ts
│   └── normalizationHelper.ts
│
├── identity/
│   └── IdentityResolver.ts
│
├── merger/
│   ├── CandidateMerger.ts
│   ├── MergerUtils.ts
│   ├── ExperienceUtils.ts
│   ├── SkillNormalizer.ts
│   └── CandidateId.ts
│
├── projection/
│   └── CandidateProjection.ts
│
├── validation/
│   └── CandidateValidator.ts
│
├── types/
│   ├── rawCandidate.ts
│   ├── candidate.ts
│   ├── common.ts
│   ├── IdentityMatch.ts
│   ├── projectionConfig.ts
│   └── ProjectionNormalizers.ts
│
└── index.ts
```


---

# Pipeline

## 1. Parse

Two independent parsers convert different input formats into a common RawCandidate representation.

### Structured Source

- Recruiter CSV

### Unstructured Source

- Resume (PDF/DOCX)

---

## 2. Normalize

Normalization standardizes extracted data before matching.

Implemented normalization includes:

- Name cleanup
- Email normalization
- E.164 phone normalization
- Skill canonicalization
- Whitespace cleanup

Examples

```
ReactJS
↓
React

NodeJS
↓
Node.js

98765 43210
↓
+919876543210
```

---

## 3. Identity Resolution

Duplicate candidates are detected using weighted identity matching.

Current scoring:

| Signal | Weight |
|---------|--------|
| Email | 40 |
| Phone | 30 |
| Name | 20 |
| GitHub | 5 |
| LinkedIn | 5 |

A configurable threshold (currently 60) determines whether two profiles represent the same candidate. Matching is exact-string based today — no fuzzy similarity — which is a deliberate scope decision (see *Known Limitations*).

---

## 4. Candidate Merge

When identities match, fields are merged into a canonical candidate profile.

### Conflict Resolution Policy

- **Scalar fields** (name, headline): Resume value wins over CSV when both exist, since resumes are typically more detailed and self-reported. CSV is used only as a fallback.
- **Array fields** (emails, phones, education): Union of both sources with duplicates removed — nothing is dropped.
- **Links & location**: Merged *field-by-field*, not source-by-source. A LinkedIn URL from the CSV is preserved even if the resume has its own (different) links object — picking one source wholesale would silently drop data.
- **Skills**: Canonicalized first, then tracked per-skill across sources; a skill confirmed by both CSV and resume gets higher confidence than one seen in only one source.
- Every decision is recorded in an `audit` block on the field (rule applied, reason, sources considered) — nothing is merged silently.

---

## 5. Confidence

Every field contains explainable confidence information.

Confidence is calculated using factors such as:

- Source reliability
- Extraction confidence
- Cross-source agreement
- Completeness
- Validation

---

## 6. Provenance

Each merged field stores where it originated.

Example:

```json
{
  "field": "skills",
  "source": "Resume",
  "method": "Resume Parser"
}
```

---

## 7. Projection

The canonical model can be projected into different schemas at runtime, without touching merge logic.

### Default output

```bash
npm run dev
```

```json
{
  "candidateId": "3f2a9c1e-7b4d-4a8f-9c2e-1d6b8a0f5e3c",
  "fullName": "Aditi Sharma",
  "emails": ["aditi.sharma@example.com"],
  "phones": ["+919876543210"],
  "headline": "Backend Engineer",
  "years_experience": 3.5,
  "skills": [
    { "name": "Node.js", "confidence": 100, "sources": ["Recruiter CSV", "Resume"] }
  ],
  "location": { "city": "Bengaluru", "region": "Karnataka", "country": null },
  "links": { "linkedin": "https://linkedin.com/in/aditisharma" },
  "experience": [ { "company": "Acme Corp", "title": "SDE-1", "startDate": "2022-01", "endDate": null } ],
  "education": [ { "institution": "VIT", "degree": "B.Tech", "field": "CSE", "endYear": 2021 } ],
  "overallConfidence": 90,
  "provenance": [
    { "field": "fullName", "source": "Resume", "method": "Resume Parser" }
  ]
}
```

### Custom configuration

```bash
npm run dev -- --config ./configs/recruiter-view.json
```

```json
{
  "fields": [
    { "path": "full_name", "from": "fullName", "type": "string", "required": true },
    { "path": "primary_email", "from": "emails[0]", "type": "string", "required": true },
    { "path": "phone", "from": "phones[0]", "type": "string", "normalize": "E164" },
    { "path": "skills", "from": "skills[].name", "type": "string[]", "normalize": "canonical" }
  ],
  "include_confidence": true,
  "on_missing": "null"
}
```

```json
{
  "full_name": "Aditi Sharma",
  "full_name_confidence": 90,
  "primary_email": "aditi.sharma@example.com",
  "primary_email_confidence": 90,
  "phone": "+919876543210",
  "skills": ["Node.js"]
}
```

Same engine, same merged candidate — only the projection config changes.

---

## 8. Validation

Final projected output is validated using Zod before emission. This guarantees schema correctness and catches malformed outputs early. Validation runs against the canonical `Candidate` shape; custom projections are checked structurally (required fields, types) rather than against the full Zod schema, since a custom config can legitimately omit or rename fields.

---

# Edge Cases & Graceful Degradation

| Edge case | Behavior |
|---|---|
| Candidate has no email or phone | `computeCandidateId` falls back through email → phone → full name → a fixed `"unknown-candidate"` seed, so an ID is always produced deterministically rather than crashing. |
| Malformed/short phone number | `normalizePhone` returns `null` and the number is dropped, not guessed at — never invents a digit. |
| Resume has no parseable experience dates | `computeYearsExperience` returns `null` instead of fabricating a number ("wrong-but-confident is worse than honestly-empty"). |
| Same skill named differently across sources (`ReactJS` vs `React`) | `SkillNormalizer` canonicalizes both to one entry and records both sources, bumping confidence to 100. |
| One full source (CSV or resume) is missing entirely | All merge/normalize functions accept `undefined` and fall back to the other source; `mergeArrays`/`mergeLinks`/`mergeLocation` never throw on a missing side. |
| A field required by a custom projection config is missing | Controlled by `on_missing`: `"null"` (default), `"omit"`, or `"error"` (throws `MissingRequiredFieldError`) — caller decides, not the engine. |

---

# Assumptions & Descoped Items

The assignment listed several optional source types beyond the required minimum (one structured + one unstructured). This implementation covers:

- ✅ Recruiter CSV (structured)
- ✅ Resume PDF/DOCX (unstructured)

Descoped due to time constraints, not implemented:

- ATS JSON blob
- GitHub profile API
- LinkedIn profile fields
- Recruiter notes (.txt)

The `IdentityResolver` already scores GitHub/LinkedIn signals (5 points each) so adding those sources later only requires a new parser feeding the same `RawCandidate` shape — no resolver/merger changes needed.

Other assumptions:
- Bare 10-digit phone numbers are assumed Indian (`+91`); true E.164 normalization for arbitrary countries would need a library like `libphonenumber`.
- Identity matching is exact-string (case/whitespace normalized), not fuzzy — two genuinely different spellings of the same name won't be linked.
- `country` in `location` is not currently coerced to ISO-3166 alpha-2; it's passed through as extracted.

---

# Testing

No automated tests are included in this submission — descoped to prioritize the core pipeline (parsing, normalization, identity resolution, merge, projection, validation) under time constraints. The engine was validated manually against the sample inputs for both the default schema and a custom projection config.

If extended, the highest-value first tests would be: `IdentityResolver` scoring against known match/non-match pairs, `MergerUtils` conflict resolution (resume-wins-on-scalar, field-by-field link/location merge), and a gold-profile comparison on one resume with missing experience dates (the `null` years-experience edge case).

---

# Design Decisions

## Modular Architecture

Each stage performs a single responsibility.

```
Parser → Normalizer → Resolver → Merger → Projection → Validation
```

This separation makes each component independently testable and replaceable.

---

## Deterministic Processing

The pipeline produces deterministic outputs for identical inputs, enabling reproducible candidate records. Candidate IDs are content-derived (SHA-256 of the best available identity signal), not randomly generated, so the same candidate always resolves to the same ID across runs.

---

## Explainability

Instead of only producing merged data, the pipeline preserves:

- confidence
- provenance
- audit decisions

making every merged value explainable — including *why* it was null, not just why it had a value.

---

# Technologies

- TypeScript
- Node.js
- Zod
- PDF parsing
- DOCX parsing

---

# Running

Install dependencies

```bash
npm install
```

Run with default projection

```bash
npm run dev
```

Run with a custom projection config

```bash
npm run dev -- --config ./path/to/config.json
```

---

# Sample Output

Pipeline stages printed by the demo:

```
Raw CSV
↓
Raw Resume
↓
Normalized Data
↓
Identity Match
↓
Canonical Candidate
↓
Projected Candidate
↓
Validation Result
```

---

# Assignment Requirement Mapping

| Requirement | Implementation |
|-------------|----------------|
| Structured Parsing | ✅ CsvParser |
| Unstructured Parsing | ✅ ResumeParser |
| Graceful Failure | ✅ Safe parsing, all merge/normalize helpers tolerate missing sources |
| Normalization | ✅ LightweightNormalizer |
| Identity Resolution | ✅ IdentityResolver (weighted, deterministic) |
| Candidate Merge | ✅ CandidateMerger |
| Skill Canonicalization | ✅ SkillNormalizer |
| Provenance | ✅ CandidateMerger / MergerUtils |
| Confidence | ✅ Field metadata (MergerUtils) |
| Runtime-configurable Projection | ✅ CandidateProjection + ProjectionConfig |
| Validation | ✅ CandidateValidator (Zod) |

---

# Known Limitations

- Resume parsing is regex-based and optimized for common resume layouts.
- Complex resume formatting may require additional parsing strategies.
- Identity resolution currently uses deterministic weighted matching rather than fuzzy string similarity (Jaro-Winkler/Levenshtein).
- `ExperienceUtils.computeYearsExperience` returns `null` whenever the resume parser hasn't populated `startDate`/`endDate` — by design, rather than guessing.
- Phone E.164 normalization is a simplified India-first heuristic, not a full international library.

---

# Future Improvements

- Fuzzy name matching (Jaro-Winkler / Levenshtein)
- OCR support for scanned resumes
- LLM-assisted resume parsing
- Configurable confidence models
- Multi-language resume support
- Additional structured/unstructured sources (ATS JSON, GitHub, LinkedIn, recruiter notes)

---

# Author

Pratiksha K.P.
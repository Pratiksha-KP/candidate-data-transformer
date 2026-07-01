# Candidate Data Transformer

A modular TypeScript pipeline that ingests candidate information from multiple sources
(structured and unstructured), resolves duplicate identities, merges conflicting
information into a canonical profile, and projects it into configurable schemas.

> Built for the Eightfold Engineering Intern (Jul–Dec 2026) take-home assignment.

---

## How to Run

```bash
npm install
npm run dev
```

Run with a custom projection config loaded from a file:

```bash
npm run dev -- --config ./path/to/config.json
```

Sample inputs are in `./sample_inputs/`:
- `recruiter.csv` — structured source
- `resume.pdf` — unstructured source

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
│   ├── csvParser.ts
│   ├── ResumeParser.ts
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
│   └── config.ts
│   └── document.ts
│   └── section.ts
│   └── ProjectionNormalizers.ts
│
│── utils/
│   └── documentExtractor.ts
│    └── regex.ts
│   └── sectionExtractor.ts
└── index.ts
```


---

---

## Pipeline

### 1. Parse

Two independent parsers convert different input formats into a common `RawCandidate`.

| Source | Type | Parser |
|---|---|---|
| Recruiter CSV | Structured | `CSVParser` |
| Resume PDF/DOCX | Unstructured | `ResumeParser` |

Each parser is wrapped in `safeParse()` in `index.ts` — a missing or malformed
source logs a warning and returns an empty result rather than crashing the pipeline.

---

### 2. Normalize

Normalization standardizes extracted data before identity matching.

| Field | Normalization applied |
|---|---|
| Name | Whitespace collapse and trim |
| Emails | Lowercase, dedup |
| Phones | E.164 format (`+91XXXXXXXXXX` for 10-digit Indian numbers) |
| Skills | Canonical name mapping (see table below) |
| Headline | Whitespace collapse |

Skill canonicalization examples:

ReactJS   →  React

react.js  →  React

NodeJS    →  Node.js

expressjs →  Express

postgres  →  PostgreSQL

---

### 3. Identity Resolution

Two `RawCandidate` records are compared using weighted signal scoring.

| Signal | Weight |
|---|---|
| Email match | 40 |
| Phone match | 30 |
| Name match | 20 |
| GitHub match | 5 |
| LinkedIn match | 5 |

A configurable threshold (currently **60**) determines whether records represent
the same person. Matching is exact-string after normalization — no fuzzy similarity.
This is a deliberate scope decision (see *Known Limitations*).

---

### 4. Merge

When identities match, fields are merged into a canonical `Candidate` with a
`Field<T>` wrapper on every value containing `confidence`, `provenance`, and `audit`.

**Conflict resolution policy:**

| Field type | Policy |
|---|---|
| Scalar (name, headline) | Resume wins; CSV is fallback |
| Arrays (emails, phones, education) | Union with deduplication — nothing dropped |
| Links | Merged property-by-property — a LinkedIn from CSV is kept even if resume has a different links object |
| Location | Merged property-by-property (city, region, country independently) |
| Skills | Canonicalized, then tracked per-skill across sources; cross-source agreement → confidence 100 vs single-source → confidence 60 |

Every merge decision is recorded in an `audit` block: rule applied, reason, and
sources considered. Nothing is merged silently.


---


### 5. Confidence

Every `Field<T>` carries a `confidence` object:

```json
{
  "score": 90,
  "breakdown": {
    "sourceReliability": 90,
    "extractionConfidence": 90,
    "crossSourceAgreement": 90,
    "completeness": 90,
    "validation": 90
  }
}
```

Field-level confidence inherits from the identity match score. Per-skill confidence
is independently computed based on cross-source agreement.

---

### 6. Projection — Required Twist

The canonical model is projected into an output shape at runtime via a
`ProjectionConfig` — no code changes needed to reshape output.

**Config capabilities:**
- Select a subset of fields to include
- Rename a field via the `from` key (e.g. `emails[0]` → `primary_email`)
- Apply per-field normalization (`E164`, `canonical`)
- Toggle `include_confidence` and `include_provenance`
- Control missing-value behavior: `"null"` | `"omit"` | `"error"`

**Example custom config:**

```json
{
  "fields": [
    { "path": "full_name", "from": "fullName", "type": "string", "required": true },
    { "path": "primary_email", "from": "emails[0]", "type": "string", "required": true },
    { "path": "phone", "from": "phones[0]", "type": "string", "normalize": "E164" },
    { "path": "skills", "from": "skills[].name", "type": "string[]", "normalize": "canonical" }
  ],
  "include_confidence": true,
  "include_provenance": false,
  "on_missing": "null"
}
```

Same merged candidate, different output shape — same engine, no code changes.

---

### Provided output of existing inputs

Raw csv and resume extraction:
<img width="709" height="720" alt="Screenshot 2026-07-01 at 8 17 15 AM" src="https://github.com/user-attachments/assets/be1ab95f-03bb-4440-8d84-e8afff903618" />

Normalized csv and resume:
<img width="1414" height="1434" alt="image" src="https://github.com/user-attachments/assets/3fb3813c-d9dc-404c-ad97-439dc0d98f43" />

Identity Match with confidence breakdowns:
<img width="1354" height="1434" alt="image" src="https://github.com/user-attachments/assets/f08f3a52-1ee0-463b-8ea2-994c4d80c415" />
<img width="1070" height="1412" alt="image" src="https://github.com/user-attachments/assets/678d58d1-d55a-4b68-85b3-465ab0d8eed9" />

Projected candidate with default schema:
<img width="988" height="1432" alt="image" src="https://github.com/user-attachments/assets/c6da7411-1c87-44f0-a136-ccb2c3229105" />

Validated result:
<img width="986" height="1434" alt="image" src="https://github.com/user-attachments/assets/b5d1a1cd-5d1f-4892-8edf-2401a44253ee" />

Projected candidate with custom config:
<img width="426" height="346" alt="Screenshot 2026-07-01 at 8 24 34 AM" src="https://github.com/user-attachments/assets/ac07275f-75d0-499d-b460-0dddff66c222" />


---

### 7. Validation

Final projected output is validated with Zod before emission.
`safeParse` returns `{ success: true, data }` or `{ success: false, error }` —
the pipeline never silently emits an invalid profile.

---

## Sample Output on Provided Inputs

### Identity Match

```json
{
  "isMatch": true,
  "confidence": 90,
  "reasons": ["Exact email match", "Exact phone match", "Exact name match"]
}
```

### Default Schema Projection (truncated for brevity)

```json
{
  "candidateId": "5a8da508-caa5-4aa1-ad61-20aa981fa3a6",
  "fullName": "Pratiksha K.P",
  "fullName_confidence": 90,
  "emails": ["pratikshakpmane@gmail.com"],
  "phones": ["+919108830425"],
  "headline": "Software Engineer | Full-Stack Development & Machine Learning",
  "years_experience": 0.5,
  "skills": [
    { "name": "Node.js", "confidence": 100, "sources": ["Recruiter CSV", "Resume"] },
    { "name": "Express", "confidence": 100, "sources": ["Recruiter CSV", "Resume"] },
    { "name": "PostgreSQL", "confidence": 100, "sources": ["Recruiter CSV", "Resume"] },
    { "name": "React", "confidence": 100, "sources": ["Recruiter CSV", "Resume"] },
    { "name": "JavaScript", "confidence": 60, "sources": ["Resume"] }
  ],
  "location": null,
  "experience": [
    {
      "title": "Research Intern — IoT & Indoor Localization",
      "company": "Samsung R&D Institute, Bengaluru",
      "startDate": "2026-01",
      "endDate": null
    }
  ],
  "overallConfidence": 90
}
```

### Validation Result

```json
{ "success": true }
```

### Custom Config Projection

```json
{
  "full_name": "Pratiksha K.P",
  "full_name_confidence": 90,
  "primary_email": "pratikshakpmane@gmail.com",
  "primary_email_confidence": 90,
  "phone": "+919108830425",
  "skills": ["Node.js", "Express", "PostgreSQL", "React", "JavaScript", "..."]
}
```

---

## Edge Cases Handled

| Edge case | Behavior |
|---|---|
| Missing source (CSV or resume absent) | `safeParse` catches the error, logs a warning, pipeline continues on the remaining source |
| Malformed / short phone number | `normalizePhone` returns `null`; number is dropped rather than guessed |
| Skill named differently across sources (`ReactJS` vs `React.js`) | Canonicalized to one entry; both sources recorded; confidence bumped to 100 |
| Same skill in only one source | Confidence 60; source recorded honestly |
| Links object present in only one source | `mergeLinks` merges property-by-property; no data silently dropped |
| No experience dates parseable | `computeYearsExperience` returns `null` — never fabricates a number |
| Required field missing in custom config with `on_missing: "error"` | Throws `MissingRequiredFieldError` — caller decides policy, not the engine |
| `on_missing: "omit"` | Key is entirely absent from output rather than null |
| No identity signals at all | `computeCandidateId` falls back: email → phone → name → `"unknown-candidate"` seed; always produces a stable deterministic ID |

---

## Known Limitations & Honest Descoping

**Education parsing is structurally fragile.** `ResumeParser.extractEducation`
reads pairs of lines, which breaks when a resume has date ranges or CGPA on
the same line as the institution name. In the sample output, `degree` and
`institution` are sometimes swapped as a result. Fix requires a more robust
section parser — descoped under time constraints.

**`portfolio` extraction is too greedy.** The regex
`/(?:https?:\/\/)?(?:www\.)?\S+\.\S+/` in `ResumeParser.extractLinks` matches
any `X.Y` token, so it picks up `K.P` (part of the candidate's name) instead
of a real URL. Should be constrained to known TLDs or explicit URL patterns.

**`linkedin: undefined` in merged links.** When the resume has no LinkedIn URL,
`mergeLinks` sets `linkedin: undefined` rather than omitting the key. Zod's
`.optional()` accepts this, but it's cleaner to strip `undefined` keys before
output.

**Location is always null.** Neither parser currently extracts a `location`
field from the sample inputs. The merge and projection layers handle it
correctly when a parser populates it — descoped for this submission.

**Phone E.164 is India-first.** Bare 10-digit numbers are assumed `+91`.
Production correctness requires a library like `libphonenumber-js`.

**Identity matching is exact-string only.** No fuzzy similarity
(Jaro-Winkler / Levenshtein). Two spellings of the same name won't link
unless they normalize identically.

**No automated tests.** Validated manually against sample inputs for both
default and custom projection. Highest-value first tests would be:
`IdentityResolver` scoring on known match/non-match pairs, `MergerUtils`
conflict resolution, and a gold-profile comparison on the sample resume.

---

## Descoped Source Types

| Source | Status |
|---|---|
| Recruiter CSV | ✅ Implemented |
| Resume PDF/DOCX | ✅ Implemented |
| ATS JSON blob | ❌ Descoped |
| GitHub profile API | ❌ Descoped |
| LinkedIn profile fields | ❌ Descoped |
| Recruiter notes (.txt) | ❌ Descoped |

The `IdentityResolver` already scores GitHub and LinkedIn signals (5 pts each).
Adding those sources only requires a new parser returning `RawCandidate` —
no resolver, merger, or projection changes needed.

---

## Requirement Mapping

| Requirement | Implementation |
|---|---|
| Structured source | ✅ `CSVParser` |
| Unstructured source | ✅ `ResumeParser` (PDF + DOCX) |
| Graceful failure on bad source | ✅ `safeParse` wrapper in `index.ts` |
| Phone normalization | ✅ E.164 in `normalizationHelper.ts` + `ProjectionNormalizers.ts` |
| Skill canonicalization | ✅ `SkillNormalizer.ts` |
| Identity resolution | ✅ `IdentityResolver` (weighted, deterministic) |
| Merge with provenance + confidence | ✅ `CandidateMerger` + `MergerUtils` |
| Runtime-configurable projection | ✅ `CandidateProjection` + `ProjectionConfig` |
| Default schema output | ✅ Default config in `CandidateProjection` |
| Custom config output | ✅ Demonstrated in `index.ts` and via `--config` flag |
| Validation before emit | ✅ `CandidateValidator` (Zod) |
| Deterministic candidate ID | ✅ `CandidateId.ts` (SHA-256 of best identity signal) |

---

## Design Decisions

**Deterministic IDs over random UUIDs.** `candidateId` is a SHA-256 hash of
the best available identity signal (email preferred, then phone, then name).
Same candidate always resolves to the same ID across runs.

**`Field<T>` wrapper on every canonical value.** Rather than a flat merged
object, every field carries `confidence`, `provenance`, and `audit` inline.
This makes every value explainable — including *why* it's null.

**Projection is a separate layer from merge.** The canonical `Candidate` is
never mutated to produce output. Projection reads it and applies a config
to produce any shape the caller wants. This means the same merged record
can power multiple views (recruiter view, ATS export, internal analytics)
without touching the merge logic.

**Resume wins on scalars, union on arrays.** Resumes are self-reported and
typically more detailed than recruiter CSV exports. Arrays are unioned because
dropping either source's emails/phones would be a silent data loss — always
worse than having duplicates that dedup cleanly.

---

## Technologies

- TypeScript / Node.js
- `pdf-parse` — PDF text extraction
- `mammoth` — DOCX text extraction
- `csv-parser` — streaming CSV parsing
- `zod` — runtime schema validation
- Node.js `crypto` — deterministic ID generation

---

## Author

Pratiksha K.P

# Candidate Data Transformer

A modular TypeScript pipeline that ingests candidate information from multiple sources (structured and unstructured), resolves duplicate identities, merges conflicting information into a canonical candidate profile, validates the output, and projects it into configurable schemas.

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
│   ├── SkillNormalizer.ts
│   └── normalizationHelper.ts
│
├── identity/
│   ├── IdentityResolver.ts
│   └── CandidateId.ts
│
├── merger/
│   ├── CandidateMerger.ts
│   ├── MergerUtils.ts
│   └── ExperienceUtils.ts
│
├── projection/
│   └── CandidateProjection.ts
│
├── validation/
│   └── CandidateValidator.ts
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

A configurable threshold determines whether two profiles represent the same candidate.

---

## 4. Candidate Merge

When identities match, fields are merged into a canonical candidate profile.

Merge strategy includes:

- Structured field merging
- Array union with duplicate removal
- Provenance preservation
- Field-level confidence
- Audit decisions

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

The canonical model can be projected into different schemas at runtime.

Example:

Default output

```json
{
  "fullName": "...",
  "emails": [...]
}
```

Custom configuration

```json
{
  "full_name": "...",
  "primary_email": "...",
  "skills": [...]
}
```

No merge logic changes are required.

---

## 8. Validation

Final projected output is validated using Zod before emission.

This guarantees schema correctness and catches malformed outputs early.

---

# Design Decisions

## Modular Architecture

Each stage performs a single responsibility.

```
Parser

↓

Normalizer

↓

Resolver

↓

Merger

↓

Projection

↓

Validation
```

This separation makes each component independently testable and replaceable.

---

## Deterministic Processing

The pipeline produces deterministic outputs for identical inputs, enabling reproducible candidate records.

---

## Explainability

Instead of only producing merged data, the pipeline preserves:

- confidence
- provenance
- audit decisions

making every merged value explainable.

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

Run

```bash
npm run dev
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
| Graceful Failure | ✅ Safe parsing |
| Normalization | ✅ LightweightNormalizer |
| Identity Resolution | ✅ IdentityResolver |
| Candidate Merge | ✅ CandidateMerger |
| Skill Canonicalization | ✅ SkillNormalizer |
| Provenance | ✅ CandidateMerger |
| Confidence | ✅ Field metadata |
| Projection | ✅ CandidateProjection |
| Validation | ✅ CandidateValidator |

---

# Known Limitations

- Resume parsing is regex-based and optimized for common resume layouts.
- Complex resume formatting may require additional parsing strategies.
- Identity resolution currently uses deterministic weighted matching rather than fuzzy string similarity.

---

# Future Improvements

- Fuzzy name matching (Jaro-Winkler / Levenshtein)
- OCR support for scanned resumes
- LLM-assisted resume parsing
- Configurable confidence models
- Multi-language resume support
- Additional structured sources (ATS JSON, LinkedIn APIs)

---

# Author

Pratiksha K.P.
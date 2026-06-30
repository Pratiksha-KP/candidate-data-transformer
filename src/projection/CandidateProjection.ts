import { Candidate, Field } from "../types/candidate.js";
import {
  ProjectionConfig,
  MissingRequiredFieldError,
} from "../types/projectionConfig.js";
import { getNormalizer } from "../types/ProjectionNormalizers.js";

const DEFAULT_CONFIG: ProjectionConfig = {
  include_confidence: true,
  include_provenance: true,
  on_missing: "null",
  fields: [
    { path: "candidateId", from: "candidateId" },
    { path: "fullName", from: "fullName" },
    { path: "emails", from: "emails", type: "string[]" },
    { path: "phones", from: "phones", type: "string[]", normalize: "E164" },
    { path: "headline", from: "headline" },
    { path: "years_experience", from: "yearsExperience", type: "number" },
    { path: "skills", from: "skills" }, // already { name, confidence, sources }[]
    { path: "location", from: "location", type: "object" },
    { path: "links", from: "links", type: "object" },
    { path: "experience", from: "experience" },
    { path: "education", from: "education" },
    { path: "overallConfidence", from: "overallConfidence" },
  ],
};

interface ResolvedValue {
  value: unknown;
  field: Field<unknown> | undefined;
}

export class CandidateProjection {
  project(candidate: Candidate, config?: ProjectionConfig): Record<string, unknown> {
    const cfg = config ?? DEFAULT_CONFIG;
    const onMissing = cfg.on_missing ?? "null";

    const output: Record<string, unknown> = {};
    const provenanceCollected: Array<{ field: string; source: string; method: string }> = [];

    for (const fieldConfig of cfg.fields) {
      const fromPath = fieldConfig.from ?? fieldConfig.path;
      const resolved = this.resolveFrom(candidate, fromPath);

      let value = resolved.value;

      if (value === undefined && (fromPath === "candidateId" || fromPath === "overallConfidence")) {
        value = (candidate as any)[fromPath];
      }

      const normalizer = getNormalizer(fieldConfig.normalize);
      if (normalizer && value !== undefined && value !== null) {
        value = normalizer(value);
      }

      const isMissing = value === undefined || value === null;

      if (isMissing) {
        if (fieldConfig.required && onMissing === "error") {
          throw new MissingRequiredFieldError(fieldConfig.path);
        }
        if (onMissing === "omit") {
          continue;
        }
        value = null;
      }

      this.setNested(output, fieldConfig.path, value);

      if (cfg.include_confidence !== false && resolved.field?.confidence) {
        this.setNested(output, `${fieldConfig.path}_confidence`, resolved.field.confidence.score);
      }

      if (cfg.include_provenance !== false && resolved.field?.provenance) {
        for (const p of resolved.field.provenance) {
          provenanceCollected.push({
            field: fieldConfig.path,
            source: p.source,
            method: p.extractionMethod,
          });
        }
      }
    }

    if (cfg.include_provenance !== false && provenanceCollected.length > 0) {
      output.provenance = provenanceCollected;
    }

    return output;
  }

  private resolveFrom(candidate: Candidate, fromPath: string): ResolvedValue {
    const baseMatch = fromPath.match(/^[A-Za-z0-9_]+/);
    if (!baseMatch) return { value: undefined, field: undefined };

    const baseKey = baseMatch[0];
    const field = (candidate as any)[baseKey] as Field<unknown> | undefined;

    if (!field || typeof field !== "object" || !("value" in field)) {
      return { value: undefined, field: undefined };
    }

    let value: any = field.value;
    const rest = fromPath.slice(baseKey.length);

    if (!rest) {
      return { value, field };
    }

    const tokenRegex = /\[(\d*)\]|\.([A-Za-z0-9_]+)/g;
    let match: RegExpExecArray | null;
    let mapped = false;

    while ((match = tokenRegex.exec(rest)) !== null) {
      const [, idx, prop] = match;

      if (idx !== undefined) {
        if (idx === "") {
          mapped = true;
        } else {
          const i = Number(idx);
          value = mapped ? value?.map((v: any) => v?.[i]) : value?.[i];
        }
      } else if (prop !== undefined) {
        value = mapped
          ? value?.map((v: any) => (v !== null && typeof v === "object" ? v[prop] : v))
          : value?.[prop];
      }
    }

    return { value, field };
  }

  private setNested(obj: Record<string, unknown>, path: string, value: unknown): void {
    const parts = path.split(".");
    let cursor: Record<string, unknown> = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      if (typeof cursor[key] !== "object" || cursor[key] === null) {
        cursor[key] = {};
      }
      cursor = cursor[key] as Record<string, unknown>;
    }

    cursor[parts[parts.length - 1]] = value;
  }
}
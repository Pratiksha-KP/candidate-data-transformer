export interface ProjectionFieldConfig {
  /** Output key (dot notation supported for simple nesting, e.g. "contact.email") */
  path: string;

  /** Canonical source path. Defaults to `path` if omitted.
   *  Supports: "emails", "emails[0]", "links.github", "skills[].name" */
  from?: string;

  /** Informational/validation hint */
  type?: "string" | "string[]" | "number" | "number[]" | "boolean" | "object";

  required?: boolean;

  /** Name of a registered normalizer, e.g. "E164", "canonical" */
  normalize?: string;
}

export interface ProjectionConfig {
  fields: ProjectionFieldConfig[];
  include_confidence?: boolean;
  include_provenance?: boolean;
  on_missing?: "null" | "omit" | "error";
}

export class MissingRequiredFieldError extends Error {
  constructor(path: string) {
    super(`Required field "${path}" was missing or null and on_missing="error"`);
    this.name = "MissingRequiredFieldError";
  }
}
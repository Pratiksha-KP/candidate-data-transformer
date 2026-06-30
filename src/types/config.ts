/*
 * Runtime projection configuration
 */

export interface ProjectionField {

  path: string;

  from: string;

  type?: string;

  normalize?: string;

  required?: boolean;
}

export interface ProjectionConfig {

  fields: ProjectionField[];

  include_confidence: boolean;

  include_provenance: boolean;

  on_missing: "null" | "omit" | "error";
}
import {
  Experience,
  Education,
  Links,
  Location,
  Project
} from "./common";

/*
 * Output of every parser.
 * Represents exactly what was extracted from one source.
 */

export interface RawCandidate {
  source: string;

  fullName?: string;

  emails?: string[];

  phones?: string[];

  location?: Location;

  links?: Links;

  headline?: string;

  skills?: string[];

  experience?: Experience[];

  education?: Education[];

  projects?: Project[];
}
import { RawCandidate } from "../types/rawCandidate";

export interface IParser {
  parse(filePath: string): Promise<RawCandidate[]>;
}
export interface IdentityMatch {
  isMatch: boolean;

  confidence: number;

  reasons: string[];
}
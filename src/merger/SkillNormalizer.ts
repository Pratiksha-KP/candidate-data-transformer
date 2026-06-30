const SKILL_MAP: Record<string, string> = {
  "nodejs": "Node.js",
  "node.js": "Node.js",
  "reactjs": "React",
  "react.js": "React",
  "expressjs": "Express",
  "express.js": "Express",
  "javascript": "JavaScript",
  "typescript": "TypeScript",
  "postgres": "PostgreSQL",
  "postgresql": "PostgreSQL",
  "cpp": "C++",
  "c plus plus": "C++",
};

function canonicalName(skill: string): string {
  const key = skill.trim().toLowerCase();
  return SKILL_MAP[key] ?? skill.trim();
}

/** Flat-array version, kept for the config-driven "canonical" normalizer in projection. */
export function normalizeSkills(skills: string[] = []): string[] {
  const normalized = skills.map(canonicalName);
  return [...new Set(normalized)];
}

/**
 * Builds the schema-required { name, confidence, sources[] } shape.
 * confidence here reflects cross-source agreement for that specific skill:
 * present in both sources -> higher confidence than present in only one.
 */
export function normalizeSkillsWithSources(
  csvSkills: string[] = [],
  csvSourceName: string,
  resumeSkills: string[] = [],
  resumeSourceName: string
): { name: string; confidence: number; sources: string[] }[] {
  const bySkill = new Map<string, Set<string>>();

  for (const raw of csvSkills) {
    const name = canonicalName(raw);
    if (!name) continue;
    if (!bySkill.has(name)) bySkill.set(name, new Set());
    bySkill.get(name)!.add(csvSourceName);
  }

  for (const raw of resumeSkills) {
    const name = canonicalName(raw);
    if (!name) continue;
    if (!bySkill.has(name)) bySkill.set(name, new Set());
    bySkill.get(name)!.add(resumeSourceName);
  }

  return [...bySkill.entries()].map(([name, sources]) => ({
    name,
    confidence: sources.size > 1 ? 100 : 60,
    sources: [...sources],
  }));
}
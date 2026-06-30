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

  "c plus plus": "C++"

};

export function normalizeSkills(
  skills: string[] = []
): string[] {

  const normalized = skills.map(skill => {

    const key = skill
      .trim()
      .toLowerCase();

    return SKILL_MAP[key] ?? skill.trim();

  });

  return [...new Set(normalized)];

}
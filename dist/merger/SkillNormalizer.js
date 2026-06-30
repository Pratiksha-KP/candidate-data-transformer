"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeSkills = normalizeSkills;
const SKILL_MAP = {
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
function normalizeSkills(skills = []) {
    const normalized = skills.map(skill => {
        const key = skill
            .trim()
            .toLowerCase();
        return SKILL_MAP[key] ?? skill.trim();
    });
    return [...new Set(normalized)];
}

import { ResumeSections } from "../types/sections";

export class SectionExtractor {

  extract(text: string): ResumeSections {

    const sections: ResumeSections = {
      header: "",
      education: "",
      experience: "",
      projects: "",
      skills: "",
      certifications: "",
      leadership: ""
    };

    const lines = text.split("\n");

    let current: keyof ResumeSections = "header";

    for (const line of lines) {

      const trimmed = line.trim();

      const lower = trimmed.toLowerCase();

      if (lower === "education") {
        current = "education";
        continue;
      }

      if (
        lower === "experience" ||
        lower === "work experience" ||
        lower === "professional experience"
      ) {
        current = "experience";
        continue;
      }

      if (
        lower === "projects" ||
        lower === "project"
      ) {
        current = "projects";
        continue;
      }

      if (
        lower === "technical skills" ||
        lower === "skills"
      ) {
        current = "skills";
        continue;
      }

      if (
        lower === "certifications" ||
        lower === "certification"
      ) {
        current = "certifications";
        continue;
      }

      if (
        lower === "leadership" ||
        lower === "leadership & activities" ||
        lower === "activities"
      ) {
        current = "leadership";
        continue;
      }

      sections[current] += trimmed + "\n";

    }

    return sections;

  }

}
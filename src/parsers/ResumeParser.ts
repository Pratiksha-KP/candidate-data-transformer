import { IParser } from "./IParser";
import { RawCandidate } from "../types/rawCandidate";
import { DocumentExtractor } from "../utils/documentExtractor";
import { SectionExtractor } from "../utils/sectionExtractor";
import { EMAIL_REGEX, PHONE_REGEX } from "../utils/regex";

import {
  Education,
  Experience,
  Links,
  Project
} from "../types/common";

const SOURCE_NAME = "Resume";

export class ResumeParser implements IParser {

  private documentExtractor = new DocumentExtractor();

  private sectionExtractor = new SectionExtractor();

  async parse(filePath: string): Promise<RawCandidate[]> {

    const document = await this.documentExtractor.extract(filePath);

    const sections = this.sectionExtractor.extract(document.text);

    const candidate: RawCandidate = {

      source: SOURCE_NAME,

      fullName: this.extractName(sections.header),

      headline: this.extractHeadline(sections.header),

      emails: this.extractEmails(document.text),

      phones: this.extractPhones(document.text),

      links: this.extractLinks(document.text),

      skills: this.extractSkills(sections.skills),

      experience: this.extractExperience(sections.experience),

      education: this.extractEducation(sections.education),

      projects: this.extractProjects(
        sections.projects ?? ""
      )

    };

    return [candidate];

  }

  // ----------------------------------------------------

  private extractName(header: string): string {

    return header
      .split("\n")
      .map(line => line.trim())
      .find(Boolean) ?? "";

  }

  // ----------------------------------------------------

  private extractHeadline(header: string): string {

    const lines = header
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean);

    return lines.length > 1
      ? lines[1]
      : "";

  }

  // ----------------------------------------------------

  private extractEmails(text: string): string[] {

    return text.match(EMAIL_REGEX) ?? [];

  }

  // ----------------------------------------------------

  private extractPhones(text: string): string[] {

    return text.match(PHONE_REGEX) ?? [];

  }

  // ----------------------------------------------------

  private extractLinks(text: string): Links {

  return {

    github:
      text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/\S+/i)?.[0],

    linkedin:
      text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/\S+/i)?.[0],

    portfolio:
      text.match(/(?:https?:\/\/)?(?:www\.)?\S+\.\S+/)?.[0]

  };


  }

  // ----------------------------------------------------

  private extractSkills(section: string): string[] {

    return section

      .replace(/Languages:/gi, "")

      .replace(/Backend\s*\/\s*DB:/gi, "")

      .replace(/Frontend:/gi, "")

      .replace(/Tools\s*&\s*Platforms:/gi, "")

      .replace(/Coursework:/gi, "")

      .split(/,|\n|·/)

      .map(skill => skill.trim())

      .filter(Boolean);

  }

  // ----------------------------------------------------

  private extractDateRange(line: string) {
    const months: Record<string,string> = {
        jan:"01", feb:"02", mar:"03", apr:"04",
        may:"05", jun:"06", jul:"07", aug:"08",
        sep:"09", oct:"10", nov:"11", dec:"12"
    };

    const regex =
/([A-Za-z]{3})\s+(\d{4})\s*[-–]\s*(Present|([A-Za-z]{3})\s+(\d{4}))/i;

    const match = line.match(regex);

    if(!match) return null;

    const start =
`${match[2]}-${months[match[1].toLowerCase()]}`;

    let end = null;

    if(match[3].toLowerCase() !== "present"){
        end =
`${match[5]}-${months[match[4].toLowerCase()]}`;
    }

    return {start,end};
}

    // ----------------------------------------------------

  private extractExperience(section: string): Experience[] {

    const lines = section

      .split("\n")

      .map(line => line.trim())

      .filter(Boolean);

    const experiences: Experience[] = [];

    let current: Experience | null = null;

    for (const line of lines) {

      if (/^\d{4}|present|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i.test(line)) {

        if (current) {

          const dates = this.extractDateRange(line);

        if(current && dates){
            current.startDate = dates.start;
            current.endDate = dates.end;
}

        }

        continue;

      }

      if (line.startsWith("•")) {

        if (current) {

          current.summary +=

            (current.summary ? " " : "") +

            line.replace(/^•\s*/, "");

        }

        continue;

      }

      if (!current) {

        current = {

          title: line,

          company: "",

          startDate: null,

          endDate: null,

          summary: ""

        };

        continue;

      }

      current.company = line;

      experiences.push(current);

      current = null;

    }

    return experiences;

  }

  // ----------------------------------------------------

  private extractEducation(section: string): Education[] {

    const lines = section

      .split("\n")

      .map(line => line.trim())

      .filter(Boolean);

    const education: Education[] = [];

    for (let i = 0; i < lines.length; i += 2) {

      education.push({

        degree: lines[i] ?? "",

        institution: lines[i + 1] ?? "",

        field: "",

        endYear: this.extractYear(lines[i + 1] ?? "")

      });

    }

    return education;

  }

  // ----------------------------------------------------

  private extractProjects(section: string): Project[] {

    if (!section) {

      return [];

    }

    const blocks = section

      .split(/\n\s*\n/)

      .filter(Boolean);

    return blocks.map(block => {

      const lines = block

        .split("\n")

        .map(line => line.trim())

        .filter(Boolean);

      return {

        name: lines[0] ?? "",

        technologies: [],

        description: lines.slice(1).join(" ")

      };

    });

  }

  // ----------------------------------------------------

  private extractYear(text: string): number | null {

    const match = text.match(/\b(19|20)\d{2}\b/);

    return match
      ? Number(match[0])
      : null;

  }

}
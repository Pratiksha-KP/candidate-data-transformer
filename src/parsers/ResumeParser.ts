import { IParser } from "./IParser";
import { RawCandidate } from "../types/rawCandidate";
import { DocumentExtractor } from "../utils/documentExtractor";
import { SectionExtractor } from "../utils/sectionExtractor";
import { EMAIL_REGEX, PHONE_REGEX } from "../utils/regex";
import {
  Education,
  Experience,
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

      skills: this.extractSkills(sections.skills),

      experience: this.extractExperience(sections.experience),

      education: this.extractEducation(sections.education)

    };

    return [candidate];

  }

  private extractName(header: string): string {

    return header
      .split("\n")
      .map(line => line.trim())
      .find(line => line.length > 0) ?? "";

  }

  private extractHeadline(header: string): string {

    const lines = header
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean);

    return lines.length >= 2 ? lines[1] : "";

  }

  private extractEmails(text: string): string[] {

    return text.match(EMAIL_REGEX) ?? [];

  }

  private extractPhones(text: string): string[] {

    return text.match(PHONE_REGEX) ?? [];

  }

  private extractSkills(skillsSection: string): string[] {

    return skillsSection
      .replace(/Languages:/gi, "")
      .replace(/Backend\s*\/\s*DB:/gi, "")
      .replace(/Frontend:/gi, "")
      .replace(/Tools\s*&\s*Platforms:/gi, "")
      .replace(/Coursework:/gi, "")
      .split(/,|\n|·/)
      .map(skill => skill.trim())
      .filter(Boolean);

  }

  private extractExperience(section: string): Experience[] {

    const blocks = section
      .split(/\n\s*\n/)
      .filter(Boolean);

    return blocks.map(block => {

      const lines = block
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);

      return {

        company: lines[1] ?? "",

        title: lines[0] ?? "",

        startDate: null,

        endDate: null,

        summary: lines.slice(2).join(" ")

      };

    });

  }

  private extractEducation(section: string): Education[] {

    const blocks = section
      .split(/\n\s*\n/)
      .filter(Boolean);

    return blocks.map(block => {

      const lines = block
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);

      return {

        institution: lines[1] ?? "",

        degree: lines[0] ?? "",

        field: "",

        endYear: null

      };

    });

  }

}
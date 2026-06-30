"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeParser = void 0;
const documentExtractor_1 = require("../utils/documentExtractor");
const sectionExtractor_1 = require("../utils/sectionExtractor");
const regex_1 = require("../utils/regex");
const SOURCE_NAME = "Resume";
class ResumeParser {
    documentExtractor = new documentExtractor_1.DocumentExtractor();
    sectionExtractor = new sectionExtractor_1.SectionExtractor();
    async parse(filePath) {
        const document = await this.documentExtractor.extract(filePath);
        const sections = this.sectionExtractor.extract(document.text);
        const candidate = {
            source: SOURCE_NAME,
            fullName: this.extractName(sections.header),
            headline: this.extractHeadline(sections.header),
            emails: this.extractEmails(document.text),
            phones: this.extractPhones(document.text),
            links: this.extractLinks(document.text),
            skills: this.extractSkills(sections.skills),
            experience: this.extractExperience(sections.experience),
            education: this.extractEducation(sections.education),
            projects: this.extractProjects(sections.projects ?? "")
        };
        return [candidate];
    }
    // ----------------------------------------------------
    extractName(header) {
        return header
            .split("\n")
            .map(line => line.trim())
            .find(Boolean) ?? "";
    }
    // ----------------------------------------------------
    extractHeadline(header) {
        const lines = header
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);
        return lines.length > 1
            ? lines[1]
            : "";
    }
    // ----------------------------------------------------
    extractEmails(text) {
        return text.match(regex_1.EMAIL_REGEX) ?? [];
    }
    // ----------------------------------------------------
    extractPhones(text) {
        return text.match(regex_1.PHONE_REGEX) ?? [];
    }
    // ----------------------------------------------------
    extractLinks(text) {
        return {
            github: text.match(/https?:\/\/(?:www\.)?github\.com\/\S+/i)?.[0],
            linkedin: text.match(/https?:\/\/(?:www\.)?linkedin\.com\/\S+/i)?.[0],
            portfolio: text.match(/https?:\/\/\S+/)?.[0]
        };
    }
    // ----------------------------------------------------
    extractSkills(section) {
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
    extractExperience(section) {
        const lines = section
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);
        const experiences = [];
        let current = null;
        for (const line of lines) {
            if (/^\d{4}|present|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i.test(line)) {
                if (current) {
                    current.startDate = null;
                    current.endDate = null;
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
    extractEducation(section) {
        const lines = section
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);
        const education = [];
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
    extractProjects(section) {
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
    extractYear(text) {
        const match = text.match(/\b(19|20)\d{2}\b/);
        return match
            ? Number(match[0])
            : null;
    }
}
exports.ResumeParser = ResumeParser;

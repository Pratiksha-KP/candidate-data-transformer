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
            skills: this.extractSkills(sections.skills),
            experience: this.extractExperience(sections.experience),
            education: this.extractEducation(sections.education)
        };
        return [candidate];
    }
    extractName(header) {
        return header
            .split("\n")
            .map(line => line.trim())
            .find(line => line.length > 0) ?? "";
    }
    extractHeadline(header) {
        const lines = header
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);
        return lines.length >= 2 ? lines[1] : "";
    }
    extractEmails(text) {
        return text.match(regex_1.EMAIL_REGEX) ?? [];
    }
    extractPhones(text) {
        return text.match(regex_1.PHONE_REGEX) ?? [];
    }
    extractSkills(skillsSection) {
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
    extractExperience(section) {
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
    extractEducation(section) {
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
exports.ResumeParser = ResumeParser;

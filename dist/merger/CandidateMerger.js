"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidateMerger = void 0;
const crypto_1 = require("crypto");
const SkillNormalizer_js_1 = require("./SkillNormalizer.js");
const MergerUtils_js_1 = require("./MergerUtils.js");
class CandidateMerger {
    merge(csv, resume, identity) {
        if (!identity.isMatch) {
            throw new Error("Candidates do not represent the same person.");
        }
        return {
            candidateId: (0, crypto_1.randomUUID)(),
            fullName: (0, MergerUtils_js_1.createField)((0, MergerUtils_js_1.mergeScalar)(csv.fullName, resume.fullName), identity.confidence, csv.fullName !== undefined, resume.fullName !== undefined, "Full Name"),
            emails: (0, MergerUtils_js_1.createField)((0, MergerUtils_js_1.mergeArrays)(csv.emails, resume.emails), identity.confidence, csv.emails !== undefined, resume.emails !== undefined, "Emails"),
            phones: (0, MergerUtils_js_1.createField)((0, MergerUtils_js_1.mergeArrays)(csv.phones, resume.phones), identity.confidence, csv.phones !== undefined, resume.phones !== undefined, "Phones"),
            location: (0, MergerUtils_js_1.createField)((0, MergerUtils_js_1.mergeScalar)(csv.location, resume.location), identity.confidence, csv.location !== undefined, resume.location !== undefined, "Location"),
            links: (0, MergerUtils_js_1.createField)((0, MergerUtils_js_1.mergeScalar)(csv.links, resume.links), identity.confidence, csv.links !== undefined, resume.links !== undefined, "Links"),
            headline: (0, MergerUtils_js_1.createField)((0, MergerUtils_js_1.mergeScalar)(csv.headline, resume.headline), identity.confidence, csv.headline !== undefined, resume.headline !== undefined, "Headline"),
            skills: (0, MergerUtils_js_1.createField)((0, SkillNormalizer_js_1.normalizeSkills)((0, MergerUtils_js_1.mergeArrays)(csv.skills, resume.skills)), identity.confidence, csv.skills !== undefined, resume.skills !== undefined, "Skills"),
            experience: (0, MergerUtils_js_1.createField)((0, MergerUtils_js_1.mergeArrays)(csv.experience, resume.experience), identity.confidence, csv.experience !== undefined, resume.experience !== undefined, "Experience"),
            education: (0, MergerUtils_js_1.createField)((0, MergerUtils_js_1.mergeArrays)(csv.education, resume.education), identity.confidence, csv.education !== undefined, resume.education !== undefined, "Education"),
            overallConfidence: identity.confidence
        };
    }
}
exports.CandidateMerger = CandidateMerger;

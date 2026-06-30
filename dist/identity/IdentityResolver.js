"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityResolver = void 0;
const CONFIDENCE = {
    EMAIL: 40,
    PHONE: 30,
    NAME: 20,
    GITHUB: 5,
    LINKEDIN: 5,
};
const MATCH_THRESHOLD = 60;
class IdentityResolver {
    resolve(candidateA, candidateB) {
        let confidence = 0;
        const reasons = [];
        // Email
        if (this.emailMatch(candidateA, candidateB)) {
            confidence += CONFIDENCE.EMAIL;
            reasons.push("Exact email match");
        }
        // Phone
        if (this.phoneMatch(candidateA, candidateB)) {
            confidence += CONFIDENCE.PHONE;
            reasons.push("Exact phone match");
        }
        // Name
        if (this.nameMatch(candidateA, candidateB)) {
            confidence += CONFIDENCE.NAME;
            reasons.push("Exact name match");
        }
        // GitHub
        if (this.githubMatch(candidateA, candidateB)) {
            confidence += CONFIDENCE.GITHUB;
            reasons.push("GitHub profile match");
        }
        // LinkedIn
        if (this.linkedinMatch(candidateA, candidateB)) {
            confidence += CONFIDENCE.LINKEDIN;
            reasons.push("LinkedIn profile match");
        }
        return {
            isMatch: confidence >= MATCH_THRESHOLD,
            confidence,
            reasons
        };
    }
    // --------------------------------------------------
    emailMatch(a, b) {
        if (!a.emails || !b.emails) {
            return false;
        }
        return a.emails.some(email => b.emails.includes(email));
    }
    // --------------------------------------------------
    phoneMatch(a, b) {
        if (!a.phones || !b.phones) {
            return false;
        }
        return a.phones.some(phone => b.phones.includes(phone));
    }
    // --------------------------------------------------
    nameMatch(a, b) {
        if (!a.fullName || !b.fullName) {
            return false;
        }
        return a.fullName === b.fullName;
    }
    // --------------------------------------------------
    githubMatch(a, b) {
        if (!a.links?.github ||
            !b.links?.github) {
            return false;
        }
        return a.links.github === b.links.github;
    }
    // --------------------------------------------------
    linkedinMatch(a, b) {
        if (!a.links?.linkedin ||
            !b.links?.linkedin) {
            return false;
        }
        return a.links.linkedin === b.links.linkedin;
    }
}
exports.IdentityResolver = IdentityResolver;

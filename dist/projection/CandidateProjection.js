"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidateProjection = void 0;
class CandidateProjection {
    project(candidate) {
        return {
            candidateId: candidate.candidateId,
            fullName: candidate.fullName.value,
            emails: candidate.emails.value,
            phones: candidate.phones.value,
            headline: candidate.headline.value,
            skills: candidate.skills.value,
            location: candidate.location.value,
            links: candidate.links.value,
            experience: candidate.experience.value,
            education: candidate.education.value,
            overallConfidence: candidate.overallConfidence
        };
    }
}
exports.CandidateProjection = CandidateProjection;

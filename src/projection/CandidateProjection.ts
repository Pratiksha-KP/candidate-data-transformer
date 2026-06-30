import { Candidate } from "../types/candidate.js";
export class CandidateProjection {

    project(candidate: Candidate){

        return{

            candidateId:
                candidate.candidateId,

            fullName:
                candidate.fullName.value,

            emails:
                candidate.emails.value,

            phones:
                candidate.phones.value,

            headline:
                candidate.headline.value,

            skills:
                candidate.skills.value,

            location:
                candidate.location.value,

            links:
                candidate.links.value,

            experience:
                candidate.experience.value,

            education:
                candidate.education.value,

            overallConfidence:
                candidate.overallConfidence

        };

    }

}
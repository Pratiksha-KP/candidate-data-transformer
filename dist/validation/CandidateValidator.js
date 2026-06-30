"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidateValidator = void 0;
const zod_1 = require("zod");
const CandidateSchema = zod_1.z.object({
    candidateId: zod_1.z.string(),
    fullName: zod_1.z.string().nullable(),
    emails: zod_1.z.array(zod_1.z.string()),
    phones: zod_1.z.array(zod_1.z.string()),
    headline: zod_1.z.string().nullable(),
    skills: zod_1.z.array(zod_1.z.string()),
    overallConfidence: zod_1.z.number().min(0).max(100)
});
class CandidateValidator {
    validate(candidate) {
        return CandidateSchema.safeParse(candidate);
    }
}
exports.CandidateValidator = CandidateValidator;

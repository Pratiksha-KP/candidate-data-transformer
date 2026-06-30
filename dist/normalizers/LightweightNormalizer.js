"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LightweightNormalizer = void 0;
const normalizationHelper_js_1 = require("./normalizationHelper.js");
class LightweightNormalizer {
    /**
     * Performs lightweight normalization.
     * Only normalizes fields required for identity resolution.
     */
    normalize(candidate) {
        return {
            ...candidate,
            fullName: candidate.fullName !== undefined
                ? (0, normalizationHelper_js_1.normalizeName)(candidate.fullName)
                : undefined,
            emails: candidate.emails !== undefined
                ? (0, normalizationHelper_js_1.normalizeEmails)(candidate.emails)
                : undefined,
            phones: candidate.phones !== undefined
                ? (0, normalizationHelper_js_1.normalizePhones)(candidate.phones)
                : undefined,
            headline: candidate.headline !== undefined
                ? (0, normalizationHelper_js_1.normalizeWhitespace)(candidate.headline)
                : undefined,
        };
    }
    normalizeAll(candidates) {
        return candidates.map((candidate) => this.normalize(candidate));
    }
}
exports.LightweightNormalizer = LightweightNormalizer;

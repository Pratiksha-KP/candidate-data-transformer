"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeWhitespace = normalizeWhitespace;
exports.normalizeName = normalizeName;
exports.normalizeEmail = normalizeEmail;
exports.normalizeEmails = normalizeEmails;
exports.normalizePhone = normalizePhone;
exports.normalizePhones = normalizePhones;
/**
 * Normalizes whitespace by trimming the string
 * and collapsing multiple spaces into one.
 */
function normalizeWhitespace(value) {
    return value.trim().replace(/\s+/g, " ");
}
/**
 * Lightweight normalization for names.
 * Only removes unnecessary whitespace.
 */
function normalizeName(name) {
    return normalizeWhitespace(name);
}
/**
 * Normalizes a single email.
 */
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
/**
 * Normalizes a list of emails.
 */
function normalizeEmails(emails) {
    return [...new Set(emails.map(normalizeEmail).filter(Boolean))];
}
/**
 * Normalizes a single phone number.
 */
function normalizePhone(phone) {
    return phone
        .replace(/\D/g, "") // Keep only digits
        .replace(/^91/, ""); // Remove India country code
}
/**
 * Normalizes a list of phone numbers.
 */
function normalizePhones(phones) {
    return [...new Set(phones.map(normalizePhone).filter(Boolean))];
}

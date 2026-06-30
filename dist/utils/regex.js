"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PHONE_REGEX = exports.EMAIL_REGEX = void 0;
exports.EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
exports.PHONE_REGEX = /(\+?\d[\d\s\-]{8,}\d)/g;

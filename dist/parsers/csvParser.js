"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSVParser = void 0;
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const CSV_HEADERS = {
    fullName: "Full Name",
    email: "Email",
    phone: "Phone",
    headline: "Headline",
    skills: "Skills",
};
class CSVParser {
    async parse(filePath) {
        if (!fs_1.default.existsSync(filePath)) {
            throw new Error(`CSV file not found: ${filePath}`);
        }
        return new Promise((resolve, reject) => {
            const candidates = [];
            fs_1.default.createReadStream(filePath)
                .pipe((0, csv_parser_1.default)())
                .on("data", (row) => {
                const candidate = {
                    source: "Recruiter CSV",
                    fullName: row[CSV_HEADERS.fullName]?.trim(),
                    emails: row[CSV_HEADERS.email]
                        ? [row[CSV_HEADERS.email].trim()]
                        : [],
                    phones: row[CSV_HEADERS.phone]
                        ? [row[CSV_HEADERS.phone].trim()]
                        : [],
                    headline: row[CSV_HEADERS.headline]?.trim(),
                    skills: row[CSV_HEADERS.skills]
                        ? row[CSV_HEADERS.skills]
                            .split(",")
                            .map((skill) => skill.trim())
                        : [],
                };
                candidates.push(candidate);
            })
                .on("end", () => {
                resolve(candidates);
            })
                .on("error", (err) => {
                reject(err);
            });
        });
    }
}
exports.CSVParser = CSVParser;

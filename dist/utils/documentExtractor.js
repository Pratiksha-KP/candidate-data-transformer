"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentExtractor = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const mammoth_1 = __importDefault(require("mammoth"));
class DocumentExtractor {
    async extract(filePath) {
        const extension = path_1.default.extname(filePath).toLowerCase();
        if (extension === ".pdf") {
            const buffer = await promises_1.default.readFile(filePath);
            const result = await (0, pdf_parse_1.default)(buffer);
            return {
                text: result.text,
                fileType: "pdf"
            };
        }
        if (extension === ".docx") {
            const result = await mammoth_1.default.extractRawText({
                path: filePath
            });
            return {
                text: result.value,
                fileType: "docx"
            };
        }
        throw new Error(`Unsupported file type: ${extension}`);
    }
}
exports.DocumentExtractor = DocumentExtractor;

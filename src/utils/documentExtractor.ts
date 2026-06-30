import fs from "fs/promises";
import path from "path";

import pdf from "pdf-parse";
import mammoth from "mammoth";

import { DocumentContent } from "../types/document";

export class DocumentExtractor {

  async extract(filePath: string): Promise<DocumentContent> {

    const extension = path.extname(filePath).toLowerCase();

    if (extension === ".pdf") {

      const buffer = await fs.readFile(filePath);

      const result = await pdf(buffer);

      return {

        text: result.text,

        fileType: "pdf"

      };

    }

    if (extension === ".docx") {

      const result = await mammoth.extractRawText({

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
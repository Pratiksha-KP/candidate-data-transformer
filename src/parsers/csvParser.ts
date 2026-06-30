import fs from "fs";
import csv from "csv-parser";

import { RawCandidate } from "../types/rawCandidate";
import { IParser } from "./IParser";

const CSV_HEADERS = {
  fullName: "Full Name",
  email: "Email",
  phone: "Phone",
  headline: "Headline",
  skills: "Skills",
} as const;

export class CSVParser implements IParser {
  async parse(filePath: string): Promise<RawCandidate[]> {

    if (!fs.existsSync(filePath)) {
      throw new Error(`CSV file not found: ${filePath}`);
    }

    return new Promise((resolve, reject) => {

      const candidates: RawCandidate[] = [];

      fs.createReadStream(filePath)
        .pipe(csv())

        .on("data", (row) => {

          const candidate: RawCandidate = {

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
                  .map((skill: string) => skill.trim())
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
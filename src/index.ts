import { CSVParser } from "./parsers/csvParser";
import { ResumeParser } from "./parsers/ResumeParser";

async function main() {

    const csvParser = new CSVParser();

    const resumeParser = new ResumeParser();

    console.log("========== CSV ==========\n");

    const csvCandidates = await csvParser.parse(
        "./sample_inputs/recruiter.csv"
    );

    console.dir(csvCandidates, { depth: null });

    console.log("\n========== RESUME ==========\n");

    const resumeCandidates = await resumeParser.parse(
        "./sample_inputs/resume.pdf"
    );

    console.dir(resumeCandidates, { depth: null });

}

main().catch(console.error);
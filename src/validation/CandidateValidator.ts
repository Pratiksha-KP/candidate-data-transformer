import { z } from "zod";

const SkillSchema = z.object({

name:z.string(),

confidence:z.number().min(0).max(100),

sources:z.array(z.string())

});

const ProvenanceSchema=z.object({

field:z.string(),

source:z.string(),

method:z.string()

});

const LocationSchema = z.object({
  city: z.string().nullable(),
  region: z.string().nullable(),
  country: z.string().nullable()
});

const LinksSchema = z.object({
  github: z.string().optional(),
  linkedin: z.string().optional(),
  portfolio: z.string().optional(),
  other: z.array(z.string()).optional()
});

const ExperienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  summary: z.string().optional()
});

const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  endYear: z.number().nullable()
});

const CandidateSchema = z.object({

  candidateId: z.string(),

  fullName: z.string().nullable(),

  emails: z.array(z.string()).nullable(),

  phones: z.array(z.string()).nullable(),

  location: LocationSchema.nullable(),

  links: LinksSchema.nullable(),

  headline: z.string().nullable(),

  skills: z.array(SkillSchema).nullable(),

  experience: z.array(ExperienceSchema).nullable(),

  education: z.array(EducationSchema).nullable(),

  overallConfidence: z.number().min(0).max(100)

});

export class CandidateValidator {

  validate(candidate: unknown) {

    return CandidateSchema.safeParse(candidate);

  }

}
// Common reusable interfaces used throughout the project

export interface Location {
  city: string | null;
  region: string | null;
  country: string | null;
}

export interface Links {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  other?: string[];
}

export interface Experience {
  company: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
  summary?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  endYear: number | null;
}

export interface Project {
  name: string;
  technologies: string[];
  description: string;
  github?: string;
}
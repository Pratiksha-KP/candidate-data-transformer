import { Experience } from "../types/common.js";

/**
 * Computes total years of experience from parsed date ranges.
 * Known limitation: ResumeParser currently does not populate startDate/endDate
 * (dates are discarded during section parsing — see ResumeParser.extractExperience).
 * Until that's fixed, this will honestly return null rather than inventing a number.
 * Once dates are populated as YYYY-MM strings, this will compute real totals.
 */
export function computeYearsExperience(experience: Experience[] = []): number | null {
  const ranges = experience.filter((e) => e.startDate);

  if (ranges.length === 0) {
    return null;
  }

  let totalMonths = 0;

  for (const exp of ranges) {
    const start = parseYearMonth(exp.startDate);
    const end = exp.endDate ? parseYearMonth(exp.endDate) : currentYearMonth();

    if (!start || !end) continue;

    const months = (end.year - start.year) * 12 + (end.month - start.month);
    if (months > 0) totalMonths += months;
  }

  if (totalMonths === 0) return null;

  return Math.round((totalMonths / 12) * 10) / 10; // one decimal place
}

function parseYearMonth(value: string | null): { year: number; month: number } | null {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) };
}

function currentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}
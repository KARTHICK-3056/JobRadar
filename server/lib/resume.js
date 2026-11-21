// Resume parsing: PDF / DOCX / TXT -> text -> skills, years of experience, seniority. Files are never stored.
import { createRequire } from "node:module";
import mammoth from "mammoth";
import { extractSkills } from "./skills.js";

const require = createRequire(import.meta.url);
// Import the library entry directly: pdf-parse's index.js runs a debug harness when required without a parent.
const pdfParse = require("pdf-parse/lib/pdf-parse.js");

export class ResumeError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

export async function resumeToText(buffer, filename = "", mimetype = "") {
  const name = filename.toLowerCase();
  const isPdf = name.endsWith(".pdf") || mimetype === "application/pdf" || buffer.subarray(0, 5).toString() === "%PDF-";
  const isDocx = name.endsWith(".docx") || mimetype.includes("officedocument.wordprocessingml");
  const isTxt = name.endsWith(".txt") || mimetype.startsWith("text/");
  if (isPdf) {
    let data;
    try {
      data = await pdfParse(buffer);
    } catch (err) {
      throw new ResumeError("We couldn't read that PDF. It may be corrupted or password-protected. Try exporting it again, or upload a DOCX/TXT.", "PDF_UNREADABLE");
    }
    const text = (data.text ?? "").trim();
    if (text.replace(/\s/g, "").length < 40) {
      throw new ResumeError("This PDF has no selectable text. It looks like a scanned image. Please upload a text-based PDF, DOCX or TXT.", "PDF_NO_TEXT");
    }
    return text;
  }
  if (isDocx) {
    try {
      const { value } = await mammoth.extractRawText({ buffer });
      if (!value.trim()) throw new Error("empty");
      return value;
    } catch {
      throw new ResumeError("We couldn't read that Word document. Save it as .docx (not .doc) and try again.", "DOCX_UNREADABLE");
    }
  }
  if (isTxt) return buffer.toString("utf8");
  throw new ResumeError("Unsupported file type. Upload a PDF, DOCX or TXT (max 5 MB).", "UNSUPPORTED_TYPE");
}

export function analyzeResume(text) {
  const skills = extractSkills(text, { loose: true });
  // Years of experience: take the largest explicit "N years/yrs" claim (bounded to avoid dates).
  let years = null;
  for (const m of text.matchAll(/(\d{1,2}(?:\.\d)?)\s*\+?\s*(?:years?|yrs?)\b(?:\s+of)?(?:\s+\w+){0,3}\s+experience/gi)) {
    const n = Number(m[1]);
    if (n > 0 && n < 45) years = Math.max(years ?? 0, n);
  }
  const student = /\b(b\.?\s?tech|b\.?e\.?|bachelor|m\.?\s?tech|undergraduate|student|pursuing|expected graduation|class of 20\d\d|cgpa|gpa|semester|intern(ship)?)\b/i.test(text);
  let seniority = null;
  if (years != null) seniority = years < 2 ? "Junior" : years < 5 ? "Mid" : years < 9 ? "Senior" : "Lead";
  else if (student) seniority = "Junior";
  return { skills, years_experience: years, seniority, wants_internship: student && (years == null || years < 1) };
}

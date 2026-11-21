// Shared types + small display helpers. All job/company data comes from the JobRadar API (see ./api.ts).
export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";
export type Level = "Junior" | "Mid" | "Senior" | "Lead";
export type Tone = 1 | 2 | 3 | 4 | 5 | 6;

export interface Company {
  id: string;
  name: string;
  tone: Tone;
  industry: string | null;
  hq: string | null;
  website: string | null;
  description: string | null;
  description_source: string | null;
  source: string | null;
  source_url: string | null;
  open_roles: number | null;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  company_id: string;
  company_logo_initials: string;
  location: string;
  location_city: string | null;
  location_country: string | null;
  is_remote: boolean;
  job_type: JobType;
  seniority: Level;
  category: string;
  skills: string[];
  salary_display: string | null;
  salary_usd_max: number | null;
  posted_at: string | null;
  posted_days_ago: number;
  first_seen: string;
  last_seen: string;
  source: string;
  source_url: string | null;
  apply_url: string | null;
  status: "open" | "closed";
  match_score?: number;
  matched_skills?: string[];
}

export interface JobDetail extends Job {
  description: string;
  description_blocks: { t: "h" | "p" | "li"; x: string }[];
  department: string | null;
  closed_at: string | null;
  version: number;
  versions: { version: number; changed_at: string; change_type: string; changes: Record<string, { from: unknown; to: unknown }> }[];
  company_info: Company | null;
}

export const categories = [
  { name: "Engineering", icon: "code" },
  { name: "Design", icon: "pen" },
  { name: "Product", icon: "compass" },
  { name: "Data", icon: "chart" },
  { name: "Marketing", icon: "megaphone" },
  { name: "Customer", icon: "heart" },
  { name: "People", icon: "users" },
] as const;

export const jobTypes: JobType[] = ["Full-time", "Part-time", "Contract", "Internship"];
export const levels: Level[] = ["Junior", "Mid", "Senior", "Lead"];

export const SOURCE_LABELS: Record<string, string> = {
  greenhouse: "Greenhouse",
  lever: "Lever",
  ashby: "Ashby",
  "zoho-careers": "Zoho Careers",
  "zoho-rss": "Zoho Careers",
  "careers-jsonld": "Company careers page",
  remoteok: "Remote OK",
  weworkremotely: "We Work Remotely",
  himalayas: "Himalayas",
  jobicy: "Jobicy",
  hackernews: "Hacker News",
  arbeitnow: "Arbeitnow",
};
export const sourceLabel = (s: string | null | undefined) => (s ? (SOURCE_LABELS[s] ?? s) : "");

/** Same tone hash as the server, so a company keeps its colour everywhere. */
export function toneFor(id: string): Tone {
  let sum = 0;
  for (const ch of id) sum += ch.charCodeAt(0);
  return ((sum % 6) + 1) as Tone;
}

export function formatSalary(job: Pick<Job, "salary_display">) {
  return job.salary_display ?? "Salary not disclosed";
}

export function formatPosted(days: number) {
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

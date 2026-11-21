// Thin client for the JobRadar API (served under /api on the same origin; Vite proxies it to the Node server).
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { Company, Job, JobDetail } from "./jobs";

// During SSR there is no browser origin, so talk to the API process directly.
const API_ORIGIN =
  typeof window === "undefined" ? `http://127.0.0.1:${(globalThis as { process?: { env?: Record<string, string> } }).process?.env?.["API_PORT"] ?? "8787"}` : "";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_ORIGIN}${path}`, init);
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const msg = (body as { error?: string } | null)?.error ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, msg, body);
  }
  return body as T;
}

const qs = (params: Record<string, string | number | boolean | string[] | undefined | null>) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "" || v === false) continue;
    if (Array.isArray(v)) {
      if (v.length) sp.set(k, v.join(","));
    } else sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
};

export interface RegionInfo {
  id: string;
  label: string;
  kind: string;
  india: boolean;
}
export interface Profile {
  skills: string[];
  seniority?: string | null;
  wants_internship?: boolean;
}
const profileParams = (p?: Profile | null) =>
  p?.skills.length ? { skills: p.skills, seniority: p.seniority ?? undefined, intern: p.wants_internship ? "1" : undefined } : {};

export interface JobsResponse {
  region: RegionInfo;
  total: number;
  page: number;
  page_size: number;
  pages: number;
  sort: "newest" | "salary" | "match";
  fallback: { from: string; to: string; exact_count: number; added: number } | null;
  jobs: Job[];
}

export interface JobsQuery {
  q?: string | undefined;
  location?: string | undefined;
  category?: string | undefined;
  remote?: boolean | undefined;
  types?: string[] | undefined;
  levels?: string[] | undefined;
  minSalary?: number | undefined;
  sort?: string | undefined;
  pageSize?: number | undefined;
  ids?: string[] | undefined;
}

const jobsPath = (f: JobsQuery, page: number, profile?: Profile | null) =>
  `/api/jobs${qs({ q: f.q, location: f.location, category: f.category, remote: f.remote, type: f.types, level: f.levels, minSalary: f.minSalary, sort: f.sort, page, pageSize: f.pageSize, ids: f.ids, ...profileParams(profile) })}`;

export function useJobs(f: JobsQuery, profile?: Profile | null, enabled = true) {
  return useQuery({
    queryKey: ["jobs", f, profile?.skills ?? null, profile?.seniority ?? null],
    queryFn: () => api<JobsResponse>(jobsPath(f, 1, profile)),
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useInfiniteJobs(f: JobsQuery, profile?: Profile | null) {
  return useInfiniteQuery({
    queryKey: ["jobs-infinite", f, profile?.skills ?? null, profile?.seniority ?? null],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => api<JobsResponse>(jobsPath(f, pageParam, profile)),
    getNextPageParam: (last) => (last.page < last.pages ? last.page + 1 : undefined),
    placeholderData: (prev) => prev,
  });
}

export const jobDetailPath = (id: string, location?: string, profile?: Profile | null) =>
  `/api/jobs/${encodeURIComponent(id)}${qs({ location, ...profileParams(profile) })}`;

export function useJob(id: string, location?: string, profile?: Profile | null) {
  return useQuery({
    queryKey: ["job", id, location, profile?.skills ?? null],
    queryFn: () => api<JobDetail>(jobDetailPath(id, location, profile)),
    retry: (n, err) => !(err instanceof ApiError && err.status === 404) && n < 2,
  });
}

export interface StatsResponse {
  region: RegionInfo;
  total: number;
  total_all_regions: number;
  categories: Record<string, number>;
  hub_counts: Record<string, number>;
  with_salary: number;
  remote: number;
  internships: number;
  last_scraped_at: string | null;
}
export const useStats = (location: string) =>
  useQuery({ queryKey: ["stats", location], queryFn: () => api<StatsResponse>(`/api/stats${qs({ location })}`), placeholderData: (p) => p });

export interface CompaniesResponse {
  region: RegionInfo;
  total: number;
  companies: Company[];
}
export const useCompanies = (location: string, limit?: number) =>
  useQuery({
    queryKey: ["companies", location, limit],
    queryFn: () => api<CompaniesResponse>(`/api/companies${qs({ location, limit })}`),
    placeholderData: (p) => p,
  });

export interface SourceRow {
  id: string;
  name: string;
  type: string;
  homepage: string;
  regions: string[];
  notes: string;
  status: "pending" | "healthy" | "degraded" | "failing" | "blocked";
  last_run_at: string | null;
  last_success_at: string | null;
  last_error: string | null;
  boards_ok: number;
  boards_failed: number;
  jobs_indexed: number;
  india_jobs: number;
  companies: number;
}
export interface SourcesResponse {
  sources: SourceRow[];
  not_scraped: { name: string; reason: string }[];
  last_run: ScrapeRun | null;
}
export const useSources = () => useQuery({ queryKey: ["sources"], queryFn: () => api<SourcesResponse>("/api/sources"), refetchInterval: 30000 });

export interface RegionOption {
  id: string;
  label: string;
  group: string;
  kind: string;
}
export const useRegions = () =>
  useQuery({
    queryKey: ["regions"],
    queryFn: () => api<{ default: string; regions: RegionOption[] }>("/api/regions"),
    staleTime: Infinity,
  });

export interface ScrapeRun {
  id: string;
  region: string;
  trigger: string;
  status: "running" | "done" | "failed";
  started_at: string;
  finished_at: string | null;
  progress: { at: string; msg: string }[];
  stats: { inserted?: number; updated?: number; closed?: number; reopened?: number };
}
export const startScrape = (region: string) => api<{ id: string; status: string; already_running: boolean }>(`/api/scrape${qs({ region })}`, { method: "POST" });
export const scrapeStatus = (id: string) => api<ScrapeRun>(`/api/scrape/status${qs({ id })}`);

export interface ResumeResult {
  skills: string[];
  years_experience: number | null;
  seniority: string | null;
  wants_internship: boolean;
}
export async function uploadResume(file: File): Promise<ResumeResult> {
  const fd = new FormData();
  fd.append("file", file);
  return api<ResumeResult>("/api/resume", { method: "POST", body: fd });
}

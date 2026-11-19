export type JobStatus = 'active' | 'removed' | 'unknown';
export type ChangeCategory = 'added' | 'edited' | 'removed' | 'parser_failure' | 'source_down' | 'restored' | 'unchanged';
export type ReviewStatus = 'pending' | 'verified' | 'dismissed';
export type SourceStatus = 'healthy' | 'active' | 'degraded' | 'stale' | 'blocked' | 'rate_limited' | 'failing';
export type TrackerStage = 'saved' | 'applied' | 'online_test' | 'interview' | 'offer' | 'rejected';

export interface Listing {
  entity_id: string;
  title: string;
  company: string;
  location: string | null;
  job_type: 'internship' | 'full_time' | 'other' | string | null;
  deadline: string | null;
  canonical_url: string;
  source_url: string;
  source_id: string;
  source_name?: string;
  detected_at: string;
  source_updated_at: string | null;
  first_seen: string;
  last_seen: string;
  content_hash: string;
  status: JobStatus;
  last_change_category: ChangeCategory | null;
}

export interface Version {
  version_no: number;
  run_id: string;
  detected_at: string;
  content_hash: string;
  fields: Record<string, string | null>;
}

export interface ListingDetail extends Listing {
  versions: Version[];
}

export interface ChangeEvent {
  id: number;
  entity_id: string;
  listing_title: string;
  company: string;
  change_category: ChangeCategory;
  field: string | null;
  before_value: string | null;
  after_value: string | null;
  run_id: string;
  detected_at: string;
  review_status: ReviewStatus;
  source_url: string | null;
}

export interface Source {
  id: string;
  name: string;
  type: 'api' | 'html' | 'greenhouse' | 'lever' | string;
  base_url: string;
  status: SourceStatus;
  last_attempted_at: string | null;
  last_successful_at: string | null;
  last_http_status: number | null;
  parsed_count: number;
  failed_count: number;
  duplicate_count: number;
  warnings: string[];
  next_run_at: string | null;
  refresh_interval_minutes: number;
}

export interface RunError {
  type: string;
  message: string;
  url?: string;
}

export interface Run {
  run_id: string;
  source_id: string;
  started_at: string;
  finished_at: string | null;
  status: 'success' | 'partial' | 'failed' | 'blocked' | 'rate_limited' | 'parser_failure' | string;
  source_url?: string;
  http_status?: number | null;
  parsed?: number;
  failed?: number;
  new?: number;
  updated?: number;
  removed?: number;
  duplicates?: number;
  parsed_count?: number;
  failed_count?: number;
  new_count?: number;
  updated_count?: number;
  removed_count?: number;
  duplicate_count?: number;
  warnings?: string[];
  error_message?: string | null;
  errors: RunError[];
}

export interface ActivityPoint {
  date: string;
  added: number;
  edited: number;
  removed: number;
}

export interface Summary {
  active_listings: number;
  new_today: number;
  edited_today: number;
  removed_confirmed: number;
  open_reviews: number;
  sources_healthy: number;
  sources_total: number;
  last_attempted_at: string | null;
  last_successful_at: string | null;
  is_stale: boolean;
  stale_threshold_minutes: number;
  activity: ActivityPoint[];
}

export interface TrackerItem {
  entity_id: string;
  status: TrackerStage;
  notes: string | null;
  updated_at: string;
}

export interface TestCaseResult {
  id: string;
  name: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export interface MetricsData {
  cases: TestCaseResult[];
  false_alert_rate: number;
  total_cases: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

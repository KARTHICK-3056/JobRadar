"""Mapper bridging JobRadar SQLite models to frontend_new (hireline) models."""
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Tuple
from sqlalchemy.orm import Session

from jobradar.db.models import ListingModel, SourceModel, utc_now

COMPANY_METADATA: Dict[str, Dict[str, Any]] = {
    "figma": {
        "id": "figma",
        "name": "Figma",
        "tone": 6,
        "industry": "Design tools",
        "size": "1,200 people",
        "location": "San Francisco, CA",
        "about": "Figma connects everyone in the design process so teams can build better products, faster.",
    },
    "spotify": {
        "id": "spotify",
        "name": "Spotify",
        "tone": 1,
        "industry": "Music & Audio",
        "size": "9,000 people",
        "location": "New York, NY",
        "about": "Spotify revolutionized music listening forever when it launched in 2008. Discover, manage, and share over 100 million tracks.",
    },
    "acme-robotics": {
        "id": "acme-robotics",
        "name": "Acme Robotics",
        "tone": 3,
        "industry": "Hardware & Robotics",
        "size": "250 people",
        "location": "Austin, TX",
        "about": "Acme Robotics builds autonomous warehouse robots and motion control platforms that work safely alongside people.",
    },
    "biotech-labs": {
        "id": "biotech-labs",
        "name": "BioTech Labs",
        "tone": 2,
        "industry": "Healthcare & Biotech",
        "size": "180 people",
        "location": "Boston, MA",
        "about": "BioTech Labs creates computational biology tools and laboratory data pipelines to accelerate genomic discoveries.",
    },
    "meesho": {
        "id": "meesho",
        "name": "Meesho",
        "tone": 4,
        "industry": "E-Commerce & Social Commerce",
        "size": "2,000+ people",
        "location": "Bengaluru, Karnataka, India",
        "about": "Meesho is India's premier social commerce and e-commerce marketplace platform, democratizing internet commerce for small businesses across Bharat.",
    },
    "groww": {
        "id": "groww",
        "name": "Groww",
        "tone": 5,
        "industry": "Fintech & Investing",
        "size": "1,500+ people",
        "location": "Bengaluru, Karnataka, India",
        "about": "Groww is India's leading fintech platform empowering millions of investors with transparent, effortless investing in stocks, mutual funds, and digital gold.",
    },
}

COMMON_BENEFITS = [
    "Flexible hours and async-friendly culture",
    "Learning budget for books, courses and conferences",
    "Private health, dental and vision cover",
    "Paid leave plus local holidays",
]


def slugify(text: str) -> str:
    """Generate a clean URL-friendly slug."""
    text = re.sub(r"[^\w\s-]", "", text.lower()).strip()
    return re.sub(r"[-\s]+", "-", text)


def infer_company_id(company_name: str) -> str:
    """Infer or normalize company id from company name."""
    c_lower = company_name.lower()
    if "figma" in c_lower:
        return "figma"
    if "spotify" in c_lower:
        return "spotify"
    if "meesho" in c_lower:
        return "meesho"
    if "groww" in c_lower:
        return "groww"
    if "acme" in c_lower or "robot" in c_lower:
        return "acme-robotics"
    if "bio" in c_lower:
        return "biotech-labs"
    return slugify(company_name) or "partner-company"


def infer_job_type(title: str, job_type: str | None) -> str:
    """Map to JobType: Full-time | Part-time | Contract | Internship."""
    combined = f"{title} {job_type or ''}".lower()
    if "intern" in combined:
        return "Internship"
    if "contract" in combined or "temp" in combined:
        return "Contract"
    if "part" in combined:
        return "Part-time"
    return "Full-time"


def infer_level(title: str) -> str:
    """Map to Level: Junior | Mid | Senior | Lead."""
    t_lower = title.lower()
    if "lead" in t_lower or "staff" in t_lower or "principal" in t_lower or "director" in t_lower:
        return "Lead"
    if "senior" in t_lower or "sr" in t_lower:
        return "Senior"
    if "junior" in t_lower or "jr" in t_lower or "intern" in t_lower or "entry" in t_lower or "associate" in t_lower or "early" in t_lower:
        return "Junior"
    return "Mid"


def infer_category(title: str) -> str:
    """Map to category: Engineering | Design | Product | Data | Marketing | Customer | People."""
    t_lower = title.lower()
    if "design" in t_lower or "ux" in t_lower or "ui" in t_lower or "art" in t_lower:
        return "Design"
    if "data" in t_lower or "learning" in t_lower or "analytics" in t_lower or "science" in t_lower or "ai" in t_lower:
        return "Data"
    if "product" in t_lower:
        return "Product"
    if "market" in t_lower or "growth" in t_lower or "social" in t_lower or "content" in t_lower:
        return "Marketing"
    if "customer" in t_lower or "support" in t_lower or "success" in t_lower:
        return "Customer"
    if "people" in t_lower or "recruiting" in t_lower or "talent" in t_lower or "hr" in t_lower:
        return "People"
    return "Engineering"


def infer_salary(level: str, job_type: str) -> Tuple[int, int]:
    """Estimate salary range in thousands."""
    if job_type == "Internship":
        return 45, 65
    if level == "Junior":
        return 65, 85
    if level == "Mid":
        return 95, 130
    if level == "Senior":
        return 140, 185
    if level == "Lead":
        return 180, 230
    return 80, 110


def infer_tags(title: str, company: str, category: str) -> List[str]:
    """Extract 3 relevant tags."""
    t_lower = title.lower()
    tags = []
    if "python" in t_lower:
        tags.append("Python")
    if "react" in t_lower or "frontend" in t_lower:
        tags.append("React")
    if "backend" in t_lower:
        tags.append("API")
    if "security" in t_lower:
        tags.append("Security")
    if "learning" in t_lower or "ml" in t_lower:
        tags.append("Machine Learning")
    if "design" in t_lower:
        tags.append("Figma")
    if "data" in t_lower:
        tags.append("Analytics")

    # Fallbacks
    if category == "Engineering" and len(tags) < 2:
        tags.extend(["Distributed systems", "TypeScript", "Python"])
    elif category == "Design" and len(tags) < 2:
        tags.extend(["Design systems", "Prototyping", "Figma"])
    elif category == "Data" and len(tags) < 2:
        tags.extend(["SQL", "Python", "Data pipelines"])

    if len(tags) < 3:
        tags.extend([company, "Cloud", "Agile"])

    # Unique and take first 3
    seen = set()
    result = []
    for t in tags:
        if t not in seen:
            seen.add(t)
            result.append(t)
        if len(result) == 3:
            break
    return result


def map_listing_to_job(listing: ListingModel) -> Dict[str, Any]:
    """Convert a single database ListingModel to frontend_new Job structure."""
    company_id = infer_company_id(listing.company)
    job_type = infer_job_type(listing.title, listing.job_type)
    level = infer_level(listing.title)
    category = infer_category(listing.title)
    salary_min, salary_max = infer_salary(level, job_type)
    tags = infer_tags(listing.title, listing.company, category)

    location = listing.location or "Remote"
    remote = bool("remote" in location.lower() or "remote" in listing.title.lower())

    now = utc_now()
    first_seen = listing.first_seen if listing.first_seen.tzinfo else listing.first_seen.replace(tzinfo=timezone.utc)
    posted_days = max(0, (now - first_seen).days)

    # Clean URL slug for ID
    job_id = slugify(f"{listing.title}-{listing.company}")
    if not job_id:
        job_id = slugify(listing.entity_id)

    return {
        "id": job_id,
        "title": listing.title,
        "companyId": company_id,
        "location": location,
        "remote": remote,
        "type": job_type,
        "level": level,
        "salaryMin": salary_min,
        "salaryMax": salary_max,
        "category": category,
        "postedDaysAgo": posted_days,
        "tags": tags,
        "summary": f"Join {listing.company} as a {listing.title}. Verified active opportunity tracked via JobRadar change telemetry.",
        "responsibilities": [
            f"Contribute directly to production features and projects at {listing.company}",
            "Collaborate cross-functionally with senior engineers and product partners",
            "Participate in design discussions, code reviews, and architectural planning",
        ],
        "requirements": [
            "Demonstrated experience or coursework relevant to the role",
            "Strong communication and collaborative problem-solving skills",
            "Enthusiasm for shipping reliable, maintainable code",
        ],
        "benefits": COMMON_BENEFITS,
    }


def get_mapped_companies_and_jobs(db: Session) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Retrieve all active/known listings from database and map to Company and Job lists."""
    listings = db.query(ListingModel).filter(ListingModel.status != "removed").all()
    if not listings:
        # Fallback to all if status not populated
        listings = db.query(ListingModel).all()

    companies_dict: Dict[str, Dict[str, Any]] = dict(COMPANY_METADATA)
    jobs_list: List[Dict[str, Any]] = []

    for l in listings:
        job = map_listing_to_job(l)
        c_id = job["companyId"]

        # Ensure company is in dictionary
        if c_id not in companies_dict:
            companies_dict[c_id] = {
                "id": c_id,
                "name": l.company,
                "tone": (hash(l.company) % 6) + 1,
                "industry": "Technology",
                "size": "500+ people",
                "location": l.location or "San Francisco, CA",
                "about": f"{l.company} is a verified organization monitored through JobRadar change-detection pipelines.",
            }

        jobs_list.append(job)

    # Sort jobs by posted days
    jobs_list.sort(key=lambda j: j["postedDaysAgo"])
    return list(companies_dict.values()), jobs_list


def generate_jobs_ts_content(companies: List[Dict[str, Any]], jobs: List[Dict[str, Any]]) -> str:
    """Generate the complete typescript content for frontend_new/src/lib/jobs.ts."""
    companies_json = json.dumps(companies, indent=2)
    jobs_json = json.dumps(jobs, indent=2)

    return f"""// Automatically mapped and generated from JobRadar backend database
export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";
export type Level = "Junior" | "Mid" | "Senior" | "Lead";
export type Tone = 1 | 2 | 3 | 4 | 5 | 6;

export interface Company {{
  id: string;
  name: string;
  tone: Tone;
  industry: string;
  size: string;
  location: string;
  about: string;
}}

export interface Job {{
  id: string;
  title: string;
  companyId: string;
  location: string;
  remote: boolean;
  type: JobType;
  level: Level;
  salaryMin: number;
  salaryMax: number;
  category: string;
  postedDaysAgo: number;
  tags: string[];
  summary: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
}}

export const companies: Company[] = {companies_json};

export const jobs: Job[] = {jobs_json};

export const categories = [
  {{ name: "Engineering", icon: "code" }},
  {{ name: "Design", icon: "pen" }},
  {{ name: "Product", icon: "compass" }},
  {{ name: "Data", icon: "chart" }},
  {{ name: "Marketing", icon: "megaphone" }},
  {{ name: "Customer", icon: "heart" }},
  {{ name: "People", icon: "users" }},
] as const;

export const jobTypes: JobType[] = ["Full-time", "Part-time", "Contract", "Internship"];
export const levels: Level[] = ["Junior", "Mid", "Senior", "Lead"];

export function getCompany(id: string): Company {{
  const c = companies.find((c) => c.id === id);
  if (!c) throw new Error(`Unknown company ${{id}}`);
  return c;
}}

export function getJob(id: string): Job | undefined {{
  return jobs.find((j) => j.id === id);
}}

export function formatSalary(job: Pick<Job, "salaryMin" | "salaryMax">) {{
  return `$${{job.salaryMin}}k – $${{job.salaryMax}}k`;
}}

export function formatPosted(days: number) {{
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${{days}} days ago`;
}}

export interface JobFilters {{
  q?: string | undefined;
  location?: string | undefined;
  category?: string | undefined;
  types?: JobType[] | undefined;
  levels?: Level[] | undefined;
  remoteOnly?: boolean | undefined;
  minSalary?: number | undefined;
}}

export function filterJobs(list: Job[], f: JobFilters): Job[] {{
  const q = f.q?.trim().toLowerCase();
  const loc = f.location?.trim().toLowerCase();
  return list.filter((job) => {{
    const company = getCompany(job.companyId);
    if (q) {{
      const hay = [job.title, company.name, job.category, ...job.tags].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }}
    if (loc) {{
      const isIndiaQuery = loc === "india" || loc.includes("india");
      const indiaKeywords = ["bengaluru", "bangalore", "karnataka", "hyderabad", "pune", "mumbai", "delhi", "gurgaon", "gurugram", "noida", "chennai", "india"];
      const jobLoc = job.location.toLowerCase();
      let matchesLoc = jobLoc.includes(loc) || (job.remote && "remote".includes(loc));
      if (isIndiaQuery && indiaKeywords.some((k) => jobLoc.includes(k))) {{
        matchesLoc = true;
      }}
      if ((loc.includes("bangalore") || loc.includes("bengaluru")) && (jobLoc.includes("bangalore") || jobLoc.includes("bengaluru"))) {{
        matchesLoc = true;
      }}
      if (!matchesLoc) return false;
    }}
    if (f.category && job.category !== f.category) return false;
    if (f.types?.length && !f.types.includes(job.type)) return false;
    if (f.levels?.length && !f.levels.includes(job.level)) return false;
    if (f.remoteOnly && !job.remote) return false;
    if (f.minSalary && job.salaryMax < f.minSalary) return false;
    return true;
  }});
}}
"""


def sync_to_frontend(db: Session, target_path: str | None = None) -> None:
    """Sync mapped database models into frontend jobs.ts files."""
    companies, jobs = get_mapped_companies_and_jobs(db)
    content = generate_jobs_ts_content(companies, jobs)

    candidates = [
        Path(target_path) if target_path else None,
        Path("frontend/src/lib/jobs.ts"),
        Path("frontend_new/src/lib/jobs.ts"),
    ]
    synced = set()
    for p in candidates:
        if p and p.parent.exists():
            resolved = p.resolve()
            if resolved not in synced:
                p.write_text(content, encoding="utf-8")
                synced.add(resolved)



def get_frontend_jobs(db: Session) -> List[Dict[str, Any]]:
    """Retrieve mapped jobs list for frontend API."""
    _, jobs = get_mapped_companies_and_jobs(db)
    return jobs


def get_frontend_companies(db: Session) -> List[Dict[str, Any]]:
    """Retrieve mapped companies list for frontend API."""
    companies, _ = get_mapped_companies_and_jobs(db)
    return companies


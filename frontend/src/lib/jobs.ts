// Automatically mapped and generated from JobRadar backend database
export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";
export type Level = "Junior" | "Mid" | "Senior" | "Lead";
export type Tone = 1 | 2 | 3 | 4 | 5 | 6;

export interface Company {
  id: string;
  name: string;
  tone: Tone;
  industry: string;
  size: string;
  location: string;
  about: string;
}

export interface Job {
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
}

export const companies: Company[] = [
  {
    "id": "figma",
    "name": "Figma",
    "tone": 6,
    "industry": "Design tools",
    "size": "1,200 people",
    "location": "San Francisco, CA",
    "about": "Figma connects everyone in the design process so teams can build better products, faster."
  },
  {
    "id": "spotify",
    "name": "Spotify",
    "tone": 1,
    "industry": "Music & Audio",
    "size": "9,000 people",
    "location": "New York, NY",
    "about": "Spotify revolutionized music listening forever when it launched in 2008. Discover, manage, and share over 100 million tracks."
  },
  {
    "id": "acme-robotics",
    "name": "Acme Robotics",
    "tone": 3,
    "industry": "Hardware & Robotics",
    "size": "250 people",
    "location": "Austin, TX",
    "about": "Acme Robotics builds autonomous warehouse robots and motion control platforms that work safely alongside people."
  },
  {
    "id": "biotech-labs",
    "name": "BioTech Labs",
    "tone": 2,
    "industry": "Healthcare & Biotech",
    "size": "180 people",
    "location": "Boston, MA",
    "about": "BioTech Labs creates computational biology tools and laboratory data pipelines to accelerate genomic discoveries."
  },
  {
    "id": "meesho",
    "name": "Meesho",
    "tone": 4,
    "industry": "E-Commerce & Social Commerce",
    "size": "2,000+ people",
    "location": "Bengaluru, Karnataka, India",
    "about": "Meesho is India's premier social commerce and e-commerce marketplace platform, democratizing internet commerce for small businesses across Bharat."
  },
  {
    "id": "groww",
    "name": "Groww",
    "tone": 5,
    "industry": "Fintech & Investing",
    "size": "1,500+ people",
    "location": "Bengaluru, Karnataka, India",
    "about": "Groww is India's leading fintech platform empowering millions of investors with transparent, effortless investing in stocks, mutual funds, and digital gold."
  },
  {
    "id": "paytm",
    "name": "Paytm",
    "tone": 2,
    "industry": "Fintech & Digital Payments",
    "size": "10,000+ people",
    "location": "Pan-India (Chennai, Bengaluru, Pune, Mumbai, Delhi)",
    "about": "Paytm is India's pioneer in mobile payments and financial technology, serving millions of merchants and consumers across India."
  },
  {
    "id": "fourkites",
    "name": "FourKites",
    "tone": 3,
    "industry": "Enterprise SaaS & Supply Chain",
    "size": "600+ people",
    "location": "Chennai, Tamil Nadu, India",
    "about": "FourKites operates the world's largest real-time supply chain tracking platform, with its premier global engineering hub in Chennai."
  },
  {
    "id": "zuora",
    "name": "Zuora",
    "tone": 4,
    "industry": "Enterprise SaaS & Subscriptions",
    "size": "1,500+ people",
    "location": "Chennai, Tamil Nadu & Bengaluru",
    "about": "Zuora is the leading subscription management platform, powering billing and revenue operations for global innovators from its tech centers in Chennai and Bengaluru."
  },
  {
    "id": "cred",
    "name": "CRED",
    "tone": 1,
    "industry": "Fintech & Rewards",
    "size": "800+ people",
    "location": "Bengaluru & Pan-India",
    "about": "CRED is India's premium reward-based credit card payments and financial services platform."
  },
  {
    "id": "inmobi",
    "name": "InMobi",
    "tone": 3,
    "industry": "AdTech & Mobile Platforms",
    "size": "2,500+ people",
    "location": "Bengaluru, Karnataka, India",
    "about": "InMobi is India's first tech unicorn, transforming mobile marketing and content monetization globally."
  },
  {
    "id": "druva",
    "name": "Druva",
    "tone": 5,
    "industry": "Cloud Data Protection & Resiliency",
    "size": "1,000+ people",
    "location": "Pune, Maharashtra, India",
    "about": "Druva is a 100% SaaS cloud data security platform with core product engineering located in Pune."
  },
  {
    "id": "highradius",
    "name": "HighRadius",
    "tone": 6,
    "industry": "Fintech SaaS & Autonomous Finance",
    "size": "3,000+ people",
    "location": "Hyderabad, Telangana, India",
    "about": "HighRadius delivers AI-powered autonomous finance software with major R&D hubs in Hyderabad."
  },
  {
    "id": "pycorp",
    "name": "PyCorp",
    "tone": 3,
    "industry": "Technology",
    "size": "500+ people",
    "location": "Austin, TX",
    "about": "PyCorp is a verified organization monitored through JobRadar change-detection pipelines."
  },
  {
    "id": "techcorp",
    "name": "TechCorp",
    "tone": 3,
    "industry": "Technology",
    "size": "500+ people",
    "location": "Seattle, WA",
    "about": "TechCorp is a verified organization monitored through JobRadar change-detection pipelines."
  }
];

export const jobs: Job[] = [
  {
    "id": "senior-software-engineering-intern-figma",
    "title": "Senior Software Engineering Intern",
    "companyId": "figma",
    "location": "San Francisco, CA",
    "remote": false,
    "type": "Internship",
    "level": "Senior",
    "salaryMin": 4,
    "salaryMax": 8,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Distributed systems",
      "TypeScript",
      "Python"
    ],
    "summary": "Join Figma as a Senior Software Engineering Intern. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Figma",
      "Collaborate cross-functionally with senior engineers and product partners",
      "Participate in design discussions, code reviews, and architectural planning"
    ],
    "requirements": [
      "Demonstrated experience or coursework relevant to the role",
      "Strong communication and collaborative problem-solving skills",
      "Enthusiasm for shipping reliable, maintainable code"
    ],
    "benefits": [
      "Flexible hours and async-friendly culture",
      "Learning budget for books, courses and conferences",
      "Private health, dental and vision cover",
      "Paid leave plus local holidays"
    ]
  },
  {
    "id": "product-design-intern-figma",
    "title": "Product Design Intern",
    "companyId": "figma",
    "location": "Remote, US",
    "remote": true,
    "type": "Internship",
    "level": "Junior",
    "salaryMin": 4,
    "salaryMax": 8,
    "category": "Design",
    "postedDaysAgo": 0,
    "tags": [
      "Figma",
      "Design systems",
      "Prototyping"
    ],
    "summary": "Join Figma as a Product Design Intern. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Figma",
      "Collaborate cross-functionally with senior engineers and product partners",
      "Participate in design discussions, code reviews, and architectural planning"
    ],
    "requirements": [
      "Demonstrated experience or coursework relevant to the role",
      "Strong communication and collaborative problem-solving skills",
      "Enthusiasm for shipping reliable, maintainable code"
    ],
    "benefits": [
      "Flexible hours and async-friendly culture",
      "Learning budget for books, courses and conferences",
      "Private health, dental and vision cover",
      "Paid leave plus local holidays"
    ]
  },
  {
    "id": "data-science-intern-figma",
    "title": "Data Science Intern",
    "companyId": "figma",
    "location": "San Francisco, CA",
    "remote": false,
    "type": "Internship",
    "level": "Junior",
    "salaryMin": 4,
    "salaryMax": 8,
    "category": "Data",
    "postedDaysAgo": 0,
    "tags": [
      "Analytics",
      "SQL",
      "Python"
    ],
    "summary": "Join Figma as a Data Science Intern. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Figma",
      "Collaborate cross-functionally with senior engineers and product partners",
      "Participate in design discussions, code reviews, and architectural planning"
    ],
    "requirements": [
      "Demonstrated experience or coursework relevant to the role",
      "Strong communication and collaborative problem-solving skills",
      "Enthusiasm for shipping reliable, maintainable code"
    ],
    "benefits": [
      "Flexible hours and async-friendly culture",
      "Learning budget for books, courses and conferences",
      "Private health, dental and vision cover",
      "Paid leave plus local holidays"
    ]
  },
  {
    "id": "security-engineering-intern-figma",
    "title": "Security Engineering Intern",
    "companyId": "figma",
    "location": "San Francisco, CA",
    "remote": false,
    "type": "Internship",
    "level": "Junior",
    "salaryMin": 4,
    "salaryMax": 8,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Security",
      "Distributed systems",
      "TypeScript"
    ],
    "summary": "Join Figma as a Security Engineering Intern. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Figma",
      "Collaborate cross-functionally with senior engineers and product partners",
      "Participate in design discussions, code reviews, and architectural planning"
    ],
    "requirements": [
      "Demonstrated experience or coursework relevant to the role",
      "Strong communication and collaborative problem-solving skills",
      "Enthusiasm for shipping reliable, maintainable code"
    ],
    "benefits": [
      "Flexible hours and async-friendly culture",
      "Learning budget for books, courses and conferences",
      "Private health, dental and vision cover",
      "Paid leave plus local holidays"
    ]
  },
  {
    "id": "python-dev-pycorp",
    "title": "Python Dev",
    "companyId": "pycorp",
    "location": "Austin, TX",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 14,
    "salaryMax": 25,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Python",
      "Distributed systems",
      "TypeScript"
    ],
    "summary": "Join PyCorp as a Python Dev. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at PyCorp",
      "Collaborate cross-functionally with senior engineers and product partners",
      "Participate in design discussions, code reviews, and architectural planning"
    ],
    "requirements": [
      "Demonstrated experience or coursework relevant to the role",
      "Strong communication and collaborative problem-solving skills",
      "Enthusiasm for shipping reliable, maintainable code"
    ],
    "benefits": [
      "Flexible hours and async-friendly culture",
      "Learning budget for books, courses and conferences",
      "Private health, dental and vision cover",
      "Paid leave plus local holidays"
    ]
  },
  {
    "id": "software-engineer-intern-techcorp",
    "title": "Software Engineer Intern",
    "companyId": "techcorp",
    "location": "Seattle, WA",
    "remote": false,
    "type": "Internship",
    "level": "Junior",
    "salaryMin": 4,
    "salaryMax": 8,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Distributed systems",
      "TypeScript",
      "Python"
    ],
    "summary": "Join TechCorp as a Software Engineer Intern. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at TechCorp",
      "Collaborate cross-functionally with senior engineers and product partners",
      "Participate in design discussions, code reviews, and architectural planning"
    ],
    "requirements": [
      "Demonstrated experience or coursework relevant to the role",
      "Strong communication and collaborative problem-solving skills",
      "Enthusiasm for shipping reliable, maintainable code"
    ],
    "benefits": [
      "Flexible hours and async-friendly culture",
      "Learning budget for books, courses and conferences",
      "Private health, dental and vision cover",
      "Paid leave plus local holidays"
    ]
  },
  {
    "id": "junior-python-developer-acme-robotics",
    "title": "Junior Python Developer",
    "companyId": "acme-robotics",
    "location": "Austin, TX",
    "remote": false,
    "type": "Full-time",
    "level": "Junior",
    "salaryMin": 6,
    "salaryMax": 12,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Python",
      "Distributed systems",
      "TypeScript"
    ],
    "summary": "Join Acme Robotics as a Junior Python Developer. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Acme Robotics",
      "Collaborate cross-functionally with senior engineers and product partners",
      "Participate in design discussions, code reviews, and architectural planning"
    ],
    "requirements": [
      "Demonstrated experience or coursework relevant to the role",
      "Strong communication and collaborative problem-solving skills",
      "Enthusiasm for shipping reliable, maintainable code"
    ],
    "benefits": [
      "Flexible hours and async-friendly culture",
      "Learning budget for books, courses and conferences",
      "Private health, dental and vision cover",
      "Paid leave plus local holidays"
    ]
  },
  {
    "id": "python-data-intern-biotech-labs",
    "title": "Python Data Intern",
    "companyId": "biotech-labs",
    "location": "Remote",
    "remote": true,
    "type": "Internship",
    "level": "Junior",
    "salaryMin": 4,
    "salaryMax": 8,
    "category": "Data",
    "postedDaysAgo": 0,
    "tags": [
      "Python",
      "Analytics",
      "BioTech Labs"
    ],
    "summary": "Join BioTech Labs as a Python Data Intern. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at BioTech Labs",
      "Collaborate cross-functionally with senior engineers and product partners",
      "Participate in design discussions, code reviews, and architectural planning"
    ],
    "requirements": [
      "Demonstrated experience or coursework relevant to the role",
      "Strong communication and collaborative problem-solving skills",
      "Enthusiasm for shipping reliable, maintainable code"
    ],
    "benefits": [
      "Flexible hours and async-friendly culture",
      "Learning budget for books, courses and conferences",
      "Private health, dental and vision cover",
      "Paid leave plus local holidays"
    ]
  }
];

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

export function getCompany(id: string): Company {
  const c = companies.find((c) => c.id === id);
  if (!c) throw new Error(`Unknown company ${id}`);
  return c;
}

export function getJob(id: string): Job | undefined {
  return jobs.find((j) => j.id === id);
}

export function formatSalary(job: Pick<Job, "salaryMin" | "salaryMax">) {
  return `₹${job.salaryMin} – ₹${job.salaryMax} LPA`;
}

export function formatPosted(days: number) {
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export interface JobFilters {
  q?: string | undefined;
  location?: string | undefined;
  category?: string | undefined;
  types?: JobType[] | undefined;
  levels?: Level[] | undefined;
  remoteOnly?: boolean | undefined;
  minSalary?: number | undefined;
}

export function filterJobs(list: Job[], f: JobFilters): Job[] {
  const q = f.q?.trim().toLowerCase();
  const loc = f.location?.trim().toLowerCase();
  return list.filter((job) => {
    const company = getCompany(job.companyId);
    if (q) {
      const hay = [job.title, company.name, job.category, ...job.tags].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (loc) {
      const isIndiaQuery = loc === "india" || loc.includes("india");
      const isChennaiQuery = loc.includes("chennai") || loc.includes("madras") || loc.includes("tamil");
      const isBangaloreQuery = loc.includes("bangalore") || loc.includes("bengaluru") || loc.includes("karnataka");
      const isHyderabadQuery = loc.includes("hyderabad") || loc.includes("telangana");
      const isPuneQuery = loc.includes("pune");
      const isMumbaiQuery = loc.includes("mumbai") || loc.includes("bombay");
      const isDelhiQuery = loc.includes("delhi") || loc.includes("noida") || loc.includes("gurgaon") || loc.includes("gurugram");

      const indiaKeywords = [
        "bengaluru", "bangalore", "karnataka", "hyderabad", "telangana",
        "pune", "mumbai", "maharashtra", "delhi", "gurgaon", "gurugram",
        "noida", "chennai", "tamil nadu", "tamil", "coimbatore", "vellore", "india"
      ];
      const jobLoc = job.location.toLowerCase();
      let matchesLoc = jobLoc.includes(loc) || (job.remote && "remote".includes(loc));
      if (isIndiaQuery && indiaKeywords.some((k) => jobLoc.includes(k))) {
        matchesLoc = true;
      }
      if (isChennaiQuery && (jobLoc.includes("chennai") || jobLoc.includes("tamil") || jobLoc.includes("coimbatore") || jobLoc.includes("vellore"))) {
        matchesLoc = true;
      }
      if (isBangaloreQuery && (jobLoc.includes("bangalore") || jobLoc.includes("bengaluru") || jobLoc.includes("karnataka"))) {
        matchesLoc = true;
      }
      if (isHyderabadQuery && (jobLoc.includes("hyderabad") || jobLoc.includes("telangana"))) {
        matchesLoc = true;
      }
      if (isPuneQuery && (jobLoc.includes("pune") || jobLoc.includes("maharashtra"))) {
        matchesLoc = true;
      }
      if (isMumbaiQuery && (jobLoc.includes("mumbai") || jobLoc.includes("bombay") || jobLoc.includes("maharashtra"))) {
        matchesLoc = true;
      }
      if (isDelhiQuery && (jobLoc.includes("delhi") || jobLoc.includes("noida") || jobLoc.includes("gurgaon") || jobLoc.includes("gurugram"))) {
        matchesLoc = true;
      }
      if (!matchesLoc) return false;
    }
    if (f.category && job.category !== f.category) return false;
    if (f.types?.length && !f.types.includes(job.type)) return false;
    if (f.levels?.length && !f.levels.includes(job.level)) return false;
    if (f.remoteOnly && !job.remote) return false;
    if (f.minSalary && job.salaryMax < f.minSalary) return false;
    return true;
  });
}

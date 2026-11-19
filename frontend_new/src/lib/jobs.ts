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
    "salaryMin": 45,
    "salaryMax": 65,
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
    "salaryMin": 45,
    "salaryMax": 65,
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
    "salaryMin": 45,
    "salaryMax": 65,
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
    "salaryMin": 45,
    "salaryMax": 65,
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
    "id": "machine-learning-intern-spotify",
    "title": "Machine Learning Intern",
    "companyId": "spotify",
    "location": "Boston, MA",
    "remote": false,
    "type": "Internship",
    "level": "Junior",
    "salaryMin": 45,
    "salaryMax": 65,
    "category": "Data",
    "postedDaysAgo": 0,
    "tags": [
      "Machine Learning",
      "SQL",
      "Python"
    ],
    "summary": "Join Spotify as a Machine Learning Intern. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Spotify",
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
    "id": "backend-engineer-early-career-spotify",
    "title": "Backend Engineer (Early Career)",
    "companyId": "spotify",
    "location": "New York, NY",
    "remote": false,
    "type": "Full-time",
    "level": "Junior",
    "salaryMin": 65,
    "salaryMax": 85,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "API",
      "Distributed systems",
      "TypeScript"
    ],
    "summary": "Join Spotify as a Backend Engineer (Early Career). Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Spotify",
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
    "salaryMin": 65,
    "salaryMax": 85,
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
    "salaryMin": 45,
    "salaryMax": 65,
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
  },
  {
    "id": "am-manager-risk-decision-science-meesho",
    "title": "AM/ Manager - Risk & Decision Science",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Data",
    "postedDaysAgo": 0,
    "tags": [
      "SQL",
      "Python",
      "Data pipelines"
    ],
    "summary": "Join Meesho as a AM/ Manager - Risk & Decision Science. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "amm-risk-analytics-user-lending-meesho",
    "title": "AM/M - Risk Analytics - User Lending",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Data",
    "postedDaysAgo": 0,
    "tags": [
      "SQL",
      "Python",
      "Data pipelines"
    ],
    "summary": "Join Meesho as a AM/M - Risk Analytics - User Lending. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "assistant-manager-business-finance-ca-pass-out-2026-meesho",
    "title": "Assistant Manager - Business Finance | CA pass -out 2026",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Distributed systems",
      "TypeScript",
      "Python"
    ],
    "summary": "Join Meesho as a Assistant Manager - Business Finance | CA pass -out 2026. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "assistant-manager-hr-hrbp-meesho",
    "title": "Assistant Manager HR : HRBP",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "People",
    "postedDaysAgo": 0,
    "tags": [
      "Meesho",
      "Cloud",
      "Agile"
    ],
    "summary": "Join Meesho as a Assistant Manager HR : HRBP. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "associate-director-business-finance-meesho",
    "title": "Associate Director - Business Finance",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Lead",
    "salaryMin": 180,
    "salaryMax": 230,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Distributed systems",
      "TypeScript",
      "Python"
    ],
    "summary": "Join Meesho as a Associate Director - Business Finance. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "cluster-head-security-investigation-meesho",
    "title": "Cluster Head ( Security & Investigation)",
    "companyId": "meesho",
    "location": "Surat, Gujarat",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Security",
      "Distributed systems",
      "TypeScript"
    ],
    "summary": "Join Meesho as a Cluster Head ( Security & Investigation). Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "cluster-head-security-investigation-meesho",
    "title": "Cluster Head - Security & Investigation",
    "companyId": "meesho",
    "location": "Hyderabad, Telangana",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Security",
      "Distributed systems",
      "TypeScript"
    ],
    "summary": "Join Meesho as a Cluster Head - Security & Investigation. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "cluster-head-last-mile-meesho",
    "title": "Cluster Head- Last Mile",
    "companyId": "meesho",
    "location": "Delhi, Delhi",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Distributed systems",
      "TypeScript",
      "Python"
    ],
    "summary": "Join Meesho as a Cluster Head- Last Mile. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "data-scientist-iii-meesho",
    "title": "Data Scientist III",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Data",
    "postedDaysAgo": 0,
    "tags": [
      "Analytics",
      "SQL",
      "Python"
    ],
    "summary": "Join Meesho as a Data Scientist III. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "data-scientist-iii-team-valmo-meesho",
    "title": "Data Scientist III (Team- Valmo)",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Data",
    "postedDaysAgo": 0,
    "tags": [
      "Analytics",
      "SQL",
      "Python"
    ],
    "summary": "Join Meesho as a Data Scientist III (Team- Valmo). Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "deputy-manager-business-finance-meesho",
    "title": "Deputy Manager - Business Finance",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Distributed systems",
      "TypeScript",
      "Python"
    ],
    "summary": "Join Meesho as a Deputy Manager - Business Finance. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "deputy-manager-fpa-meesho",
    "title": "Deputy Manager- FP&A",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Distributed systems",
      "TypeScript",
      "Python"
    ],
    "summary": "Join Meesho as a Deputy Manager- FP&A. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "director-product-meesho",
    "title": "Director - Product",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Lead",
    "salaryMin": 180,
    "salaryMax": 230,
    "category": "Product",
    "postedDaysAgo": 0,
    "tags": [
      "Meesho",
      "Cloud",
      "Agile"
    ],
    "summary": "Join Meesho as a Director - Product. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "director-data-science-meesho",
    "title": "Director Data Science",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Lead",
    "salaryMin": 180,
    "salaryMax": 230,
    "category": "Data",
    "postedDaysAgo": 0,
    "tags": [
      "Analytics",
      "SQL",
      "Python"
    ],
    "summary": "Join Meesho as a Director Data Science. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "director-business-finance-meesho",
    "title": "Director- Business Finance",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Lead",
    "salaryMin": 180,
    "salaryMax": 230,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Distributed systems",
      "TypeScript",
      "Python"
    ],
    "summary": "Join Meesho as a Director- Business Finance. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "engineering-manager-backend-meesho",
    "title": "Engineering Manager -Backend",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "API",
      "Distributed systems",
      "TypeScript"
    ],
    "summary": "Join Meesho as a Engineering Manager -Backend. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "engineering-manager-platform-meesho",
    "title": "Engineering Manager- Platform",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Distributed systems",
      "TypeScript",
      "Python"
    ],
    "summary": "Join Meesho as a Engineering Manager- Platform. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "graphic-designer-meesho",
    "title": "Graphic Designer",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Design",
    "postedDaysAgo": 0,
    "tags": [
      "Figma",
      "Design systems",
      "Prototyping"
    ],
    "summary": "Join Meesho as a Graphic Designer. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "group-product-manager-meesho",
    "title": "Group Product Manager",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Product",
    "postedDaysAgo": 0,
    "tags": [
      "Meesho",
      "Cloud",
      "Agile"
    ],
    "summary": "Join Meesho as a Group Product Manager. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "head-senior-manager-industrial-relations-meesho",
    "title": "Head (Senior Manager) - Industrial Relations",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Senior",
    "salaryMin": 140,
    "salaryMax": 185,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Distributed systems",
      "TypeScript",
      "Python"
    ],
    "summary": "Join Meesho as a Head (Senior Manager) - Industrial Relations. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "instructional-designer-valmo-training-meesho",
    "title": "Instructional Designer- ValMo Training",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Design",
    "postedDaysAgo": 0,
    "tags": [
      "Figma",
      "Design systems",
      "Prototyping"
    ],
    "summary": "Join Meesho as a Instructional Designer- ValMo Training. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "lead-copy-meesho",
    "title": "Lead Copy",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Lead",
    "salaryMin": 180,
    "salaryMax": 230,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Distributed systems",
      "TypeScript",
      "Python"
    ],
    "summary": "Join Meesho as a Lead Copy. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "manager-branding-meesho",
    "title": "Manager - Branding",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Distributed systems",
      "TypeScript",
      "Python"
    ],
    "summary": "Join Meesho as a Manager - Branding. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "manager-business-finance-meesho",
    "title": "Manager - Business Finance",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Distributed systems",
      "TypeScript",
      "Python"
    ],
    "summary": "Join Meesho as a Manager - Business Finance. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "manager-hr-coe-meesho",
    "title": "Manager - HR COE",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "People",
    "postedDaysAgo": 0,
    "tags": [
      "Meesho",
      "Cloud",
      "Agile"
    ],
    "summary": "Join Meesho as a Manager - HR COE. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "manager-gtm-sales-strategy-meesho-ai-services-mas-meesho",
    "title": "Manager \u2013 GTM & Sales Strategy, Meesho AI Services (MAS)",
    "companyId": "meesho",
    "location": "Mumbai, Maharashtra",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Data",
    "postedDaysAgo": 0,
    "tags": [
      "SQL",
      "Python",
      "Data pipelines"
    ],
    "summary": "Join Meesho as a Manager \u2013 GTM & Sales Strategy, Meesho AI Services (MAS). Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "manager-hrbp-er-meesho",
    "title": "Manager \u2013 HRBP & ER",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "People",
    "postedDaysAgo": 0,
    "tags": [
      "Meesho",
      "Cloud",
      "Agile"
    ],
    "summary": "Join Meesho as a Manager \u2013 HRBP & ER. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "manager-hr-coe-meesho",
    "title": "Manager : HR COE",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "People",
    "postedDaysAgo": 0,
    "tags": [
      "Meesho",
      "Cloud",
      "Agile"
    ],
    "summary": "Join Meesho as a Manager : HR COE. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "manager-hr-coe-meesho",
    "title": "Manager HR - COE",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "People",
    "postedDaysAgo": 0,
    "tags": [
      "Meesho",
      "Cloud",
      "Agile"
    ],
    "summary": "Join Meesho as a Manager HR - COE. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "manager-partnership-meesho",
    "title": "Manager Partnership",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Part-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Design",
    "postedDaysAgo": 0,
    "tags": [
      "Design systems",
      "Prototyping",
      "Figma"
    ],
    "summary": "Join Meesho as a Manager Partnership. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "manager-fulfilment-experience-meesho",
    "title": "Manager- Fulfilment & Experience",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Distributed systems",
      "TypeScript",
      "Python"
    ],
    "summary": "Join Meesho as a Manager- Fulfilment & Experience. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "manager-legal-meesho",
    "title": "Manager- Legal",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Distributed systems",
      "TypeScript",
      "Python"
    ],
    "summary": "Join Meesho as a Manager- Legal. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "principal-data-scientist-meesho",
    "title": "Principal Data Scientist",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Lead",
    "salaryMin": 180,
    "salaryMax": 230,
    "category": "Data",
    "postedDaysAgo": 0,
    "tags": [
      "Analytics",
      "SQL",
      "Python"
    ],
    "summary": "Join Meesho as a Principal Data Scientist. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "product-manager-i-meesho",
    "title": "Product Manager I",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Product",
    "postedDaysAgo": 0,
    "tags": [
      "Meesho",
      "Cloud",
      "Agile"
    ],
    "summary": "Join Meesho as a Product Manager I. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "product-manager-ii-meesho",
    "title": "Product Manager II",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Product",
    "postedDaysAgo": 0,
    "tags": [
      "Meesho",
      "Cloud",
      "Agile"
    ],
    "summary": "Join Meesho as a Product Manager II. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "product-manager-ii-dau-labs-meesho",
    "title": "Product Manager II - DAU Labs",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Product",
    "postedDaysAgo": 0,
    "tags": [
      "Meesho",
      "Cloud",
      "Agile"
    ],
    "summary": "Join Meesho as a Product Manager II - DAU Labs. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "security-architect-ai-powered-security-engineering-meesho",
    "title": "Security Architect - AI-Powered Security Engineering",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Data",
    "postedDaysAgo": 0,
    "tags": [
      "Security",
      "SQL",
      "Python"
    ],
    "summary": "Join Meesho as a Security Architect - AI-Powered Security Engineering. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "security-engineer-iii-infra-security-meesho",
    "title": "Security Engineer III - Infra Security",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Security",
      "Distributed systems",
      "TypeScript"
    ],
    "summary": "Join Meesho as a Security Engineer III - Infra Security. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "security-engineer-iv-meesho",
    "title": "Security Engineer IV",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Security",
      "Distributed systems",
      "TypeScript"
    ],
    "summary": "Join Meesho as a Security Engineer IV. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "senior-associate-performance-marketing-meesho",
    "title": "Senior Associate - Performance Marketing",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Senior",
    "salaryMin": 140,
    "salaryMax": 185,
    "category": "Marketing",
    "postedDaysAgo": 0,
    "tags": [
      "Meesho",
      "Cloud",
      "Agile"
    ],
    "summary": "Join Meesho as a Senior Associate - Performance Marketing. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "senior-associate-assistant-manager-program-ops-fulfilment-experience-meesho",
    "title": "Senior Associate / Assistant Manager - Program Ops (Fulfilment & Experience)",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Senior",
    "salaryMin": 140,
    "salaryMax": 185,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Distributed systems",
      "TypeScript",
      "Python"
    ],
    "summary": "Join Meesho as a Senior Associate / Assistant Manager - Program Ops (Fulfilment & Experience). Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "senior-business-development-manager-sbdm-meesho",
    "title": "Senior Business Development Manager (SBDM)",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Senior",
    "salaryMin": 140,
    "salaryMax": 185,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Distributed systems",
      "TypeScript",
      "Python"
    ],
    "summary": "Join Meesho as a Senior Business Development Manager (SBDM). Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "senior-copywriter-meesho",
    "title": "Senior Copywriter",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Senior",
    "salaryMin": 140,
    "salaryMax": 185,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Distributed systems",
      "TypeScript",
      "Python"
    ],
    "summary": "Join Meesho as a Senior Copywriter. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "senior-manager-production-meesho",
    "title": "Senior Manager - Production",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Senior",
    "salaryMin": 140,
    "salaryMax": 185,
    "category": "Product",
    "postedDaysAgo": 0,
    "tags": [
      "Meesho",
      "Cloud",
      "Agile"
    ],
    "summary": "Join Meesho as a Senior Manager - Production. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "senior-manager-ceos-office-meesho",
    "title": "Senior Manager, CEO's Office",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Senior",
    "salaryMin": 140,
    "salaryMax": 185,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Distributed systems",
      "TypeScript",
      "Python"
    ],
    "summary": "Join Meesho as a Senior Manager, CEO's Office. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "senior-product-manager-meesho",
    "title": "Senior Product Manager",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Senior",
    "salaryMin": 140,
    "salaryMax": 185,
    "category": "Product",
    "postedDaysAgo": 0,
    "tags": [
      "Meesho",
      "Cloud",
      "Agile"
    ],
    "summary": "Join Meesho as a Senior Product Manager. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "senior-product-manager-data-analytics-platform-meesho",
    "title": "Senior Product Manager - Data & Analytics Platform",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Full-time",
    "level": "Senior",
    "salaryMin": 140,
    "salaryMax": 185,
    "category": "Data",
    "postedDaysAgo": 0,
    "tags": [
      "Analytics",
      "SQL",
      "Python"
    ],
    "summary": "Join Meesho as a Senior Product Manager - Data & Analytics Platform. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "senior-talent-partner-non-tech-hiring-meesho",
    "title": "Senior Talent Partner ( Non-Tech Hiring)",
    "companyId": "meesho",
    "location": "Bangalore, Karnataka",
    "remote": false,
    "type": "Part-time",
    "level": "Senior",
    "salaryMin": 140,
    "salaryMax": 185,
    "category": "Design",
    "postedDaysAgo": 0,
    "tags": [
      "Design systems",
      "Prototyping",
      "Figma"
    ],
    "summary": "Join Meesho as a Senior Talent Partner ( Non-Tech Hiring). Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Meesho",
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
    "id": "assistant-manager-internal-audit-groww",
    "title": "Assistant Manager - Internal Audit",
    "companyId": "groww",
    "location": "Bengaluru-VTP, India",
    "remote": false,
    "type": "Internship",
    "level": "Junior",
    "salaryMin": 45,
    "salaryMax": 65,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Distributed systems",
      "TypeScript",
      "Python"
    ],
    "summary": "Join Groww as a Assistant Manager - Internal Audit. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Groww",
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
    "id": "associate-content-digest-groww",
    "title": "Associate - Content (Digest)",
    "companyId": "groww",
    "location": "Bengaluru-VTP, India",
    "remote": false,
    "type": "Full-time",
    "level": "Junior",
    "salaryMin": 65,
    "salaryMax": 85,
    "category": "Marketing",
    "postedDaysAgo": 0,
    "tags": [
      "Groww",
      "Cloud",
      "Agile"
    ],
    "summary": "Join Groww as a Associate - Content (Digest). Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Groww",
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
    "id": "creative-illustrator-groww",
    "title": "Creative Illustrator",
    "companyId": "groww",
    "location": "Bengaluru-VTP, India",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Distributed systems",
      "TypeScript",
      "Python"
    ],
    "summary": "Join Groww as a Creative Illustrator. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Groww",
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
    "id": "finance-content-creator-groww",
    "title": "Finance Content Creator",
    "companyId": "groww",
    "location": "Bengaluru, India",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Marketing",
    "postedDaysAgo": 0,
    "tags": [
      "Groww",
      "Cloud",
      "Agile"
    ],
    "summary": "Join Groww as a Finance Content Creator. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Groww",
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
    "id": "manager-compliance-pms-groww",
    "title": "Manager - Compliance (PMS)",
    "companyId": "groww",
    "location": "Bengaluru-VTP, India",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Distributed systems",
      "TypeScript",
      "Python"
    ],
    "summary": "Join Groww as a Manager - Compliance (PMS). Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Groww",
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
    "id": "portfolio-specialist-wealth-groww",
    "title": "Portfolio Specialist - Wealth",
    "companyId": "groww",
    "location": "Bengaluru-VTP, India",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Distributed systems",
      "TypeScript",
      "Python"
    ],
    "summary": "Join Groww as a Portfolio Specialist - Wealth. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Groww",
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
    "id": "procurement-specialist-groww",
    "title": "Procurement Specialist",
    "companyId": "groww",
    "location": "Bengaluru-VTP, India",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Distributed systems",
      "TypeScript",
      "Python"
    ],
    "summary": "Join Groww as a Procurement Specialist. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Groww",
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
    "id": "product-research-specialist-w-from-groww-groww",
    "title": "Product Research Specialist (W from Groww)",
    "companyId": "groww",
    "location": "Bengaluru-VTP, India",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Product",
    "postedDaysAgo": 0,
    "tags": [
      "Groww",
      "Cloud",
      "Agile"
    ],
    "summary": "Join Groww as a Product Research Specialist (W from Groww). Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Groww",
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
    "id": "relationship-manager-groww",
    "title": "Relationship Manager",
    "companyId": "groww",
    "location": "India",
    "remote": false,
    "type": "Full-time",
    "level": "Mid",
    "salaryMin": 95,
    "salaryMax": 130,
    "category": "Engineering",
    "postedDaysAgo": 0,
    "tags": [
      "Distributed systems",
      "TypeScript",
      "Python"
    ],
    "summary": "Join Groww as a Relationship Manager. Verified active opportunity tracked via JobRadar change telemetry.",
    "responsibilities": [
      "Contribute directly to production features and projects at Groww",
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
  return `$${job.salaryMin}k – $${job.salaryMax}k`;
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
      const indiaKeywords = ["bengaluru", "bangalore", "karnataka", "hyderabad", "pune", "mumbai", "delhi", "gurgaon", "gurugram", "noida", "chennai", "india"];
      const jobLoc = job.location.toLowerCase();
      let matchesLoc = jobLoc.includes(loc) || (job.remote && "remote".includes(loc));
      if (isIndiaQuery && indiaKeywords.some((k) => jobLoc.includes(k))) {
        matchesLoc = true;
      }
      if ((loc.includes("bangalore") || loc.includes("bengaluru")) && (jobLoc.includes("bangalore") || jobLoc.includes("bengaluru"))) {
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

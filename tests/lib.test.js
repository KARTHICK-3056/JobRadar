import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { classifyCategory, classifyJobType, classifySeniority } from "../server/lib/classify.js";
import { jobInRegion, parseLocation, resolveRegion, isIndiaRegion } from "../server/lib/locations.js";
import { scoreJob } from "../server/lib/match.js";
import { dedupeHash, displayLocation, htmlToBlocks, normalizeJob } from "../server/lib/normalize.js";
import { analyzeResume } from "../server/lib/resume.js";
import { convert, formatLpa, formatUsd, parseSalaryText, salaryView } from "../server/lib/salary.js";
import { canonicalSkill, extractSkills } from "../server/lib/skills.js";
import { isAllowed, parseRobots } from "../server/robots.js";

const RATES = { USD: 1, INR: 85, EUR: 0.9, GBP: 0.78 };

describe("skill extraction", () => {
  it("finds canonical skills and synonyms", () => {
    const s = extractSkills("We use JS, TypeScript, React and Node.js on k8s with Postgres and AWS.");
    for (const k of ["JavaScript", "TypeScript", "React", "Node.js", "Kubernetes", "PostgreSQL", "AWS"]) assert.ok(s.includes(k), `missing ${k}`);
  });
  it("matches short names only in tech context", () => {
    assert.ok(extractSkills("Backend in Golang and Rust").includes("Go"));
    assert.ok(extractSkills("Experience with Go, Python").includes("Go"));
    assert.ok(!extractSkills("Ready to go to market fast").includes("Go"));
    assert.ok(extractSkills("Strong C++ and C# skills").includes("C++"));
    assert.ok(extractSkills("Strong C++ and C# skills").includes("C#"));
    assert.ok(!extractSkills("We raised a Series C round").includes("C"));
    assert.ok(!extractSkills("Read the docs and rest a bit").includes("REST APIs"));
    assert.ok(extractSkills("Design REST APIs").includes("REST APIs"));
  });
  it("does not confuse Java and JavaScript", () => {
    assert.deepEqual(extractSkills("JavaScript only").filter((x) => x === "Java"), []);
  });
  it("canonicalises user-typed skills", () => {
    assert.equal(canonicalSkill("k8s"), "Kubernetes");
    assert.equal(canonicalSkill("js"), "JavaScript");
    assert.equal(canonicalSkill("node"), "Node.js");
    assert.equal(canonicalSkill("Some Niche Thing"), "Some Niche Thing");
  });
});

describe("city aliases and regions", () => {
  it("maps aliases to canonical cities", () => {
    assert.deepEqual(parseLocation("Bangalore, Karnataka").cities, ["Bengaluru"]);
    assert.deepEqual(parseLocation("Gurgaon, Haryana").cities, ["Gurugram"]);
    assert.deepEqual(parseLocation("Bombay").cities, ["Mumbai"]);
    assert.deepEqual(parseLocation("Madras").cities, ["Chennai"]);
    assert.equal(parseLocation("Chennai, Tamil Nadu, India").country, "India");
  });
  it("does not read US state codes as countries", () => {
    const p = parseLocation("Indianapolis, IN");
    assert.ok(!p.countries.includes("India"));
    assert.ok(p.countries.includes("United States"));
    assert.ok(!parseLocation("San Diego, CA").countries.includes("Canada"));
  });
  it("detects remote", () => {
    assert.equal(parseLocation("Remote - India").isRemote, true);
    assert.equal(parseLocation("Remote - India").country, "India");
    assert.equal(parseLocation("Hyderabad").isRemote, false);
  });
  it("resolves region aliases and legacy values", () => {
    assert.equal(resolveRegion("Bangalore").id, "Bengaluru");
    assert.equal(resolveRegion("Gurgaon").id, "Delhi NCR");
    assert.equal(resolveRegion("Delhi-NCR").id, "Delhi NCR");
    assert.equal(resolveRegion("All India").id, "India");
    assert.equal(resolveRegion("Remote (India)").id, "Remote India");
    assert.equal(resolveRegion("Bengaluru, Karnataka").id, "Bengaluru");
    assert.equal(resolveRegion("").id, "Global");
    assert.equal(resolveRegion("all").id, "Global");
    assert.equal(resolveRegion("uk").id, "United Kingdom");
    assert.ok(isIndiaRegion(resolveRegion("Chennai")));
    assert.ok(!isIndiaRegion(resolveRegion("London")));
  });
  it("matches jobs to metro regions", () => {
    const job = { ...parseLocation("Noida, Uttar Pradesh"), is_remote: false };
    assert.ok(jobInRegion(job, resolveRegion("Delhi NCR")));
    assert.ok(jobInRegion(job, resolveRegion("India")));
    assert.ok(!jobInRegion(job, resolveRegion("Chennai")));
    const remoteIn = { ...parseLocation("Remote, India"), is_remote: true };
    assert.ok(jobInRegion(remoteIn, resolveRegion("Remote India")));
  });
});

describe("currency and LPA formatting", () => {
  it("formats USD ranges", () => {
    assert.equal(formatUsd(60000, 90000), "$60k - $90k");
    assert.equal(formatUsd(7059, 11765), "$7.1k - $12k");
    assert.equal(formatUsd(120000, 120000), "$120k");
  });
  it("formats LPA", () => {
    assert.equal(formatLpa(600000, 1000000), "₹6 - ₹10 LPA");
    assert.equal(formatLpa(450000, 450000), "₹4.5 LPA");
  });
  it("converts via USD-based rates", () => {
    assert.equal(convert(85, "INR", "USD", RATES), 1);
    assert.equal(Math.round(convert(100, "EUR", "INR", RATES)), 9444);
    assert.equal(convert(10, "XYZ", "USD", RATES), null);
  });
  it("shows LPA + USD for India regions and USD elsewhere", () => {
    const inr = { salary_min: 600000, salary_max: 1000000, salary_currency: "INR", salary_period: "year" };
    assert.equal(salaryView(inr, { india: true, rates: RATES }).display, "₹6 - ₹10 LPA (~$7.1k - $12k)");
    assert.equal(salaryView(inr, { india: false, rates: RATES }).display, "$7.1k - $12k");
    const usd = { salary_min: 60000, salary_max: 90000, salary_currency: "USD", salary_period: "year" };
    assert.equal(salaryView(usd, { india: true, rates: RATES }).display, "₹51 - ₹77 LPA (~$60k - $90k)");
    assert.equal(salaryView({ salary_min: null, salary_max: null }, { india: true, rates: RATES }).display, null);
  });
  it("annualises monthly stipends", () => {
    const m = { salary_min: 25000, salary_max: 25000, salary_currency: "INR", salary_period: "month" };
    assert.equal(salaryView(m, { india: true, rates: RATES }).display, "₹3 LPA (~$3.5k)");
  });
});

describe("salary parsing (published values only)", () => {
  it("parses common formats", () => {
    assert.deepEqual(parseSalaryText("The base salary range is $120,000 - $150,000 per year."), { min: 120000, max: 150000, currency: "USD", period: "year" });
    assert.deepEqual(parseSalaryText("Compensation: USD 90k–120k"), { min: 90000, max: 120000, currency: "USD", period: "year" });
    assert.deepEqual(parseSalaryText("CTC: ₹10L - ₹15L"), { min: 1000000, max: 1500000, currency: "INR", period: "year" });
    assert.deepEqual(parseSalaryText("Salary 12 - 18 LPA"), { min: 1200000, max: 1800000, currency: "INR", period: "year" });
    assert.deepEqual(parseSalaryText("Stipend: Rs. 20,000 - Rs. 30,000 per month"), { min: 20000, max: 30000, currency: "INR", period: "month" });
    assert.deepEqual(parseSalaryText("Pay range 100,000 - 130,000 USD annually"), { min: 100000, max: 130000, currency: "USD", period: "year" });
  });
  it("ignores numbers that are not pay", () => {
    assert.equal(parseSalaryText("You've closed deals in the $500K–$1M ACV range"), null);
    assert.equal(parseSalaryText("We raised $20M - $30M in Series B funding"), null);
    assert.equal(parseSalaryText("Pay is $40 - $60 per hour"), null);
    assert.equal(parseSalaryText("No numbers here"), null);
  });
  it("only treats a range as monthly when the period is right next to it", () => {
    assert.deepEqual(parseSalaryText("📍London | 💰£76,500 - £95,000 + Benefits ✨| This is a 12 month Fixed-Term contract"), { min: 76500, max: 95000, currency: "GBP", period: "year" });
    assert.equal(parseSalaryText("Stipend: ₹25,000 - ₹35,000/month").period, "month");
  });
  it("does not apply a trailing k to a full figure", () => {
    assert.deepEqual(parseSalaryText("Salary: $114,000 - $140k"), { min: 114000, max: 140000, currency: "USD", period: "year" });
  });
});

describe("classification", () => {
  it("categorises titles", () => {
    assert.equal(classifyCategory("Senior Backend Engineer"), "Engineering");
    assert.equal(classifyCategory("Product Designer"), "Design");
    assert.equal(classifyCategory("Associate Product Manager"), "Product");
    assert.equal(classifyCategory("Data Scientist"), "Data");
    assert.equal(classifyCategory("Growth Marketing Manager"), "Marketing");
    assert.equal(classifyCategory("Customer Success Manager"), "Customer");
    assert.equal(classifyCategory("Technical Recruiter"), "People");
    assert.equal(classifyCategory("Legal Counsel"), "Other");
  });
  it("detects job type and seniority", () => {
    assert.equal(classifyJobType("Software Engineering Intern"), "Internship");
    assert.equal(classifyJobType("Designer", "Contract"), "Contract");
    assert.equal(classifyJobType("Engineer", "Part-time"), "Part-time");
    assert.equal(classifyJobType("Engineer"), "Full-time");
    assert.equal(classifySeniority("Staff Engineer"), "Lead");
    assert.equal(classifySeniority("Senior Engineer"), "Senior");
    assert.equal(classifySeniority("Junior Developer"), "Junior");
    assert.equal(classifySeniority("Product Manager"), "Mid");
    assert.equal(classifySeniority("Data Intern", { jobType: "Internship" }), "Junior");
  });
});

describe("normalizer and dedupe", () => {
  const raw = {
    source: "greenhouse",
    source_job_id: 1,
    source_url: "https://x/1",
    company: { name: "Acme &amp; Co" },
    title: "Senior Backend Engineer (Go)",
    location: "Bangalore, Karnataka, India | Bengaluru",
    description_html: "&lt;p&gt;Build APIs in Go and PostgreSQL.&lt;/p&gt;&lt;ul&gt;&lt;li&gt;Kubernetes&lt;/li&gt;&lt;/ul&gt;&lt;p&gt;The salary range is ₹30L - ₹45L.&lt;/p&gt;",
    posted_at: "2026-11-01T00:00:00Z",
  };
  it("normalizes to the shared schema", () => {
    const j = normalizeJob(raw);
    assert.equal(j.company, "Acme & Co");
    assert.equal(j.location_city, "Bengaluru");
    assert.equal(j.location_country, "India");
    assert.equal(j.location_raw, "Bangalore, Karnataka, India");
    assert.equal(j.category, "Engineering");
    assert.equal(j.seniority, "Senior");
    assert.equal(j.job_type, "Full-time");
    assert.ok(j.skills.includes("Go") && j.skills.includes("PostgreSQL") && j.skills.includes("Kubernetes"));
    assert.deepEqual([j.salary_min, j.salary_max, j.salary_currency], [3000000, 4500000, "INR"]);
    assert.equal(j.apply_url, "https://x/1");
    assert.ok(j.content_hash && j.id);
  });
  it("leaves salary empty when none is published", () => {
    const j = normalizeJob({ ...raw, description_html: "<p>Great team.</p>" });
    assert.equal(j.salary_min, null);
  });
  it("drops implausible structured salaries instead of fixing them", () => {
    const j = normalizeJob({ ...raw, salary: { min: 114000000, max: 140000000, currency: "USD", period: "year" }, description_html: "<p>x</p>" });
    assert.equal(j.salary_min, null);
  });
  it("dedupes across sources by title+company+location", () => {
    const a = normalizeJob(raw);
    const b = normalizeJob({ ...raw, source: "remoteok", title: "Senior Backend Engineer (Go)", location: "Bengaluru" });
    assert.equal(a.id, b.id);
    assert.equal(dedupeHash("Engineer", "Acme", "Chennai"), dedupeHash(" engineer ", "ACME", "chennai"));
    assert.notEqual(dedupeHash("Engineer", "Acme", "Chennai"), dedupeHash("Engineer", "Acme", "Pune"));
  });
  it("content hash changes when salary or description changes", () => {
    const a = normalizeJob(raw);
    const b = normalizeJob({ ...raw, description_html: raw.description_html.replace("45L", "50L") });
    assert.notEqual(a.content_hash, b.content_hash);
    assert.equal(a.id, b.id);
  });
  it("builds description blocks", () => {
    const { blocks } = htmlToBlocks("<h3>About</h3><p>Hello world</p><ul><li>One</li><li>Two</li></ul>");
    assert.deepEqual(blocks.map((b) => b.t), ["h", "p", "li", "li"]);
  });
  it("shortens multi-location strings for display", () => {
    assert.equal(displayLocation("Chennai, Tamil Nadu | Chennai | Pune, Maharashtra"), "Chennai, Tamil Nadu +1 more");
  });
  it("rejects records without title or company", () => {
    assert.equal(normalizeJob({ ...raw, title: "" }), null);
  });
});

describe("resume analysis and match scoring", () => {
  it("extracts skills, years and seniority", () => {
    const r = analyzeResume("B.Tech CSE student. Projects in React, Node, MongoDB and Python. Internship at X.");
    assert.ok(r.skills.includes("React") && r.skills.includes("Node.js") && r.skills.includes("Python"));
    assert.equal(r.seniority, "Junior");
    assert.equal(r.wants_internship, true);
    const s = analyzeResume("Software engineer with 6+ years of experience in Java, Spring Boot and AWS.");
    assert.equal(s.years_experience, 6);
    assert.equal(s.seniority, "Senior");
  });
  it("scores overlap with title skills weighted higher", () => {
    const profile = { skills: ["React", "TypeScript", "Node.js"] };
    const titleHit = scoreJob(profile, { skills: ["React", "AWS", "Docker"], title_skills: ["React"] });
    const bodyHit = scoreJob(profile, { skills: ["React", "AWS", "Docker"], title_skills: ["AWS"] });
    assert.ok(titleHit.match_score > bodyHit.match_score);
    assert.deepEqual(titleHit.matched_skills, ["React"]);
    const full = scoreJob(profile, { skills: ["React", "TypeScript", "Node.js"], title_skills: [] });
    const none = scoreJob(profile, { skills: ["Java", "Spring"], title_skills: [] });
    assert.ok(full.match_score >= 80);
    assert.equal(none.match_score, 0);
    assert.ok(full.match_score <= 100);
  });
  it("boosts internships for students and matching seniority", () => {
    const p = { skills: ["Python"], seniority: "Junior", wantsInternship: true };
    const intern = scoreJob(p, { skills: ["Python", "SQL"], job_type: "Internship", seniority: "Junior" });
    const senior = scoreJob(p, { skills: ["Python", "SQL"], job_type: "Full-time", seniority: "Senior" });
    assert.ok(intern.match_score > senior.match_score);
  });
});

describe("robots.txt", () => {
  const rules = parseRobots("User-agent: *\nDisallow: /api/\nAllow: /api/public\n\nUser-agent: JobRadarBot\nDisallow: /private");
  it("uses the most specific group for our agent", () => {
    assert.equal(isAllowed(rules, "JobRadarBot/2.0 (+x)", "/api/x"), true);
    assert.equal(isAllowed(rules, "JobRadarBot/2.0 (+x)", "/private/a"), false);
  });
  it("applies longest-match for other agents", () => {
    assert.equal(isAllowed(rules, "OtherBot", "/api/x"), false);
    assert.equal(isAllowed(rules, "OtherBot", "/api/public/y"), true);
    assert.equal(isAllowed(rules, "OtherBot", "/jobs"), true);
  });
  it("treats empty Disallow as allow-all and supports wildcards", () => {
    assert.equal(isAllowed(parseRobots("User-agent: *\nDisallow:"), "x", "/anything"), true);
    assert.equal(isAllowed(parseRobots("User-agent: *\nDisallow: /*?q="), "x", "/jobs?q=1"), false);
    assert.equal(isAllowed(parseRobots("User-agent: *\nDisallow: /"), "x", "/v1/companies"), false);
  });
});

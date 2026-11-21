// Keyword rules for category, seniority and job type.

export const CATEGORIES = ["Engineering", "Design", "Product", "Data", "Marketing", "Customer", "People"];

// Order matters: first matching rule wins, checked against the title first, then the department.
const CATEGORY_RULES = [
  ["People", /\b(recruit\w*|talent (acquisition|partner)|sourcer|human resources|hr\b|hrbp|people (partner|ops|operations|team|business)|people & culture|learning (and|&) development|l&d|payroll|compensation (and|&) benefits|total rewards|employer brand)/i],
  ["Design", /\b(designer|design (lead|manager|director|intern)|ux|ui\/ux|user experience|user research(er)?|ux research|visual design|brand design|creative director|illustrator|motion (designer|graphics)|art director|content design(er)?|product design)/i],
  ["Data", /\b(data (scien\w+|analy\w+|engineer\w*|architect|platform|infrastructure|intern)|machine learning|ml (engineer|ops|scientist|researcher)|\bml\b|\bai\b (engineer|scientist|researcher)|research scientist|applied scientist|analytics|business intelligence|\bbi\b (developer|engineer|analyst)|statistic\w+|quantitative|data intern|deep learning|computer vision|nlp|llm|decision scien\w+)/i],
  ["Product", /\b(product manager|product management|product owner|product lead|head of product|director of product|vp,? product|group product|\bapm\b|associate product manager|product intern|product operations|product ops|technical program manager|program manager|\btpm\b)/i],
  ["Engineering", /\b(engineer\w*|developer|programmer|swe\b|sde\b|software|devops|sre\b|site reliability|architect|tech(nical)? lead|full[- ]?stack|front[- ]?end|back[- ]?end|mobile|android|ios\b|qa\b|quality assurance|test(ing)? (engineer|automation)|sdet|security (engineer|analyst|researcher)|firmware|embedded|infrastructure|platform|cloud|network (engineer|administrator)|systems administrator|it support|technician|hardware|silicon|asic|fpga|cto\b)/i],
  ["Marketing", /\b(marketing|growth|seo|sem\b|content (writer|strategist|marketing|creator|manager|lead)|copywriter|social media|brand (manager|marketing|strategist)|communications|public relations|\bpr\b|demand gen\w*|lifecycle|community (manager|lead)|developer relations|devrel|developer advocate|events? (manager|marketing)|editor|journalist)/i],
  ["Customer", /\b(customer|client (success|services|partner)|support (engineer|specialist|agent|associate|representative|lead|manager)|technical support|account (executive|manager|director|management)|sales|business development|\bbdr\b|\bsdr\b|partnerships?|solutions? (engineer|consultant|architect)|pre-?sales|implementation (manager|consultant|specialist)|onboarding|customer experience|\bcx\b|relationship manager|success manager|inside sales|field sales)/i],
];

export function classifyCategory(title, department = "") {
  const t = String(title ?? "");
  for (const [cat, re] of CATEGORY_RULES) if (re.test(t)) return cat;
  const d = String(department ?? "");
  if (d) for (const [cat, re] of CATEGORY_RULES) if (re.test(d)) return cat;
  // Department-only shortcuts
  if (/engineering|r&d|technology|it\b/i.test(d)) return "Engineering";
  if (/design/i.test(d)) return "Design";
  if (/product/i.test(d)) return "Product";
  if (/marketing/i.test(d)) return "Marketing";
  if (/sales|customer|support|success/i.test(d)) return "Customer";
  if (/people|talent|hr\b|human/i.test(d)) return "People";
  if (/data|analytics/i.test(d)) return "Data";
  return "Other";
}

export function classifyJobType(title, hints = "") {
  const t = `${title ?? ""} ${hints ?? ""}`;
  if (/\b(intern|internship|co-?op|apprentice\w*|trainee|summer analyst|working student|werkstudent|praktikum|stage)\b/i.test(t)) return "Internship";
  if (/\b(contract(or)?|contract-to-hire|freelance|temporary|temp\b|fixed[- ]term|consultant \(contract\))/i.test(hints) || /\b(contract|contractor|freelance|temporary|fixed[- ]term)\b/i.test(title ?? "")) return "Contract";
  if (/\bpart[- ]?time\b/i.test(t)) return "Part-time";
  return "Full-time";
}

export function classifySeniority(title, { jobType } = {}) {
  const t = String(title ?? "");
  if (jobType === "Internship") return "Junior";
  if (/\b(principal|staff|lead|head of|director|vp\b|vice president|chief|engineering manager|group product manager|distinguished|fellow)\b/i.test(t)) return "Lead";
  if (/\b(senior|sr\.?|iii|iv|level 3|l5|l6|expert)\b/i.test(t)) return "Senior";
  if (/\b(junior|jr\.?|entry[- ]level|graduate|new grad|fresher|associate|trainee|early career|i\b|level 1|apprentice|campus)\b/i.test(t)) return "Junior";
  return "Mid";
}

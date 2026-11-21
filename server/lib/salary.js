// Salary parsing (only from text actually published in a posting), FX conversion, and display formatting.

const SYMBOL_TO_CCY = { $: "USD", "US$": "USD", "₹": "INR", "€": "EUR", "£": "GBP", "C$": "CAD", "A$": "AUD", "S$": "SGD", "CA$": "CAD", "AU$": "AUD" };
const CODES = ["USD", "INR", "EUR", "GBP", "CAD", "AUD", "SGD", "AED", "CHF", "SEK", "NOK", "DKK", "PLN", "JPY", "BRL", "MXN", "NZD", "ILS"];

/** Normalise a currency hint (symbol or code) to an ISO code. */
export function normCurrency(c) {
  if (!c) return null;
  const s = String(c).trim().toUpperCase();
  if (CODES.includes(s)) return s;
  if (s === "RS" || s === "RS." || s === "INR" || s === "₹") return "INR";
  return SYMBOL_TO_CCY[String(c).trim()] ?? SYMBOL_TO_CCY[s] ?? null;
}

function num(s, suffix) {
  let n = parseFloat(String(s).replace(/,/g, ""));
  if (!Number.isFinite(n)) return null;
  const k = (suffix ?? "").toLowerCase();
  if (k === "k") n *= 1e3;
  else if (k === "m" || k === "mn" || k === "million") n *= 1e6;
  else if (k === "l" || k === "lakh" || k === "lakhs" || k === "lpa" || k === "lac" || k === "lacs") n *= 1e5;
  else if (k === "cr" || k === "crore") n *= 1e7;
  return n;
}

// Reasonable annual bounds per currency to reject parse noise (e.g. "$5 credit", years, headcounts).
const BOUNDS = { USD: [8000, 2_000_000], EUR: [8000, 1_500_000], GBP: [8000, 1_500_000], CAD: [10000, 2_000_000], AUD: [10000, 2_000_000], SGD: [10000, 2_000_000], INR: [100_000, 50_000_000], AED: [20000, 5_000_000], CHF: [20000, 2_000_000] };

export function plausible(min, max, ccy, period) {
  const b = BOUNDS[ccy];
  if (!b) return min > 0;
  const f = period === "month" ? 12 : 1;
  return min * f >= b[0] * (period === "month" ? 0.25 : 1) && max * f <= b[1] && max >= min;
}

const SALARY_WORDS = /\b(salary|salaries|compensation|pay|paid|base|range|ctc|stipend|ote|per annum|annual|annually|a year|per year|per month|monthly|lpa|wage|remuneration|package|earn|usd|eur|gbp|inr)\b|\/\s?(yr|year|mo|month)\b|💰/;
const NOT_SALARY = /\b(acv|arr|revenue|deal|deals|funding|raised|series [a-e]|valuation|budget|spend|gmv|customers|users|portfolio|assets|aum|loan|credit)\b/;

/**
 * Parse a salary range published in free text. Returns null when nothing explicit is found.
 * Handles: "$120,000 - $150,000", "USD 120k–150k", "₹10L - ₹15L", "INR 10-15 LPA", "€60.000 – €80.000",
 * "Rs. 25,000/month", "12-18 LPA". Hourly rates are ignored (we never extrapolate hours).
 */
export function parseSalaryText(text) {
  if (!text) return null;
  const s = String(text).replace(/ /g, " ").replace(/[–—−]/g, "-");
  const CUR = "(US\\$|CA\\$|AU\\$|C\\$|A\\$|S\\$|\\$|₹|€|£|Rs\\.?|INR|USD|EUR|GBP|CAD|AUD|SGD|AED|CHF)";
  const NUM = "(\\d{1,3}(?:[,.]\\d{3})+|\\d+(?:\\.\\d+)?)";
  const SUF = "\\s?(k|K|m|M|mn|L|lakhs?|lakh|lacs?|LPA|lpa|cr|crore)?";
  const re = new RegExp(`${CUR}\\s?${NUM}${SUF}\\s*(?:-|to)\\s*${CUR}?\\s?${NUM}${SUF}(\\s*(?:USD|INR|EUR|GBP|CAD|AUD|SGD))?([^.\\n]{0,40})`, "g");
  let m;
  while ((m = re.exec(s))) {
    const [, c1, n1, s1, c2, n2, s2, trailingCode, tail] = m;
    const ccy = normCurrency(trailingCode?.trim()) ?? normCurrency(c1) ?? normCurrency(c2);
    if (!ccy) continue;
    const fixEuro = (n) => (ccy === "EUR" && /^\d{1,3}\.\d{3}$/.test(n) ? n.replace(".", "") : n);
    // A suffix written once ("$90-120k") applies to both numbers, but never to an already-full figure.
    const carry = (n, own, other) => num(n, own || (parseFloat(String(n).replace(/,/g, "")) < 1000 ? other : ""));
    let lo = carry(fixEuro(n1), s1, s2);
    let hi = carry(fixEuro(n2), s2, s1);
    // Text ranges only count when the posting is clearly talking about pay (not deal sizes, funding, ARR...).
    const before = s.slice(Math.max(0, m.index - 160), m.index).toLowerCase();
    const near = before + " " + (tail ?? "").toLowerCase();
    if (!SALARY_WORDS.test(near) || NOT_SALARY.test(before.slice(-60) + " " + (tail ?? "").toLowerCase())) continue;
    if (lo == null || hi == null) continue;
    // Pay period must sit right next to the figure ("/month", "per month"); "a 12 month contract" later on is not a period.
    const adj = (tail ?? "").toLowerCase().slice(0, 18) + " " + s.slice(Math.max(0, m.index - 20), m.index).toLowerCase();
    if (/\b(hour|hr|hourly)\b|\/\s?h(ou)?r/.test(adj)) continue;
    const period = /^\s*(\/\s?mo(nth)?\b|(per|a|\/)\s?month\b|monthly\b|p\.?m\.?(\s|$))/.test((tail ?? "").toLowerCase()) ? "month" : "year";
    if (!plausible(lo, hi, ccy, period)) continue;
    return { min: lo, max: hi, currency: ccy, period };
  }
  // "120,000 - 150,000 USD" (code after the range, no leading symbol)
  const re2 = new RegExp(`${NUM}${SUF}\\s*(?:-|to)\\s*${NUM}${SUF}\\s*(USD|EUR|GBP|CAD|AUD|SGD|INR)\\b([^.\\n]{0,40})`, "g");
  while ((m = re2.exec(s))) {
    const [, n1, s1, n2, s2, code, tail] = m;
    const lo = num(n1, s1 || (Number(n1.replace(/,/g, "")) < 1000 ? s2 : ""));
    const hi = num(n2, s2 || (Number(n2.replace(/,/g, "")) < 1000 ? s1 : ""));
    if (lo == null || hi == null) continue;
    const ctx = (tail ?? "").toLowerCase();
    const before2 = s.slice(Math.max(0, m.index - 160), m.index).toLowerCase();
    if (!SALARY_WORDS.test(before2 + " " + ctx) || NOT_SALARY.test(before2.slice(-60) + " " + ctx)) continue;
    if (/\b(hour|hr|hourly)\b/.test(ctx.slice(0, 18))) continue;
    const period = /^\s*(\/\s?mo(nth)?\b|(per|a|\/)\s?month\b|monthly\b)/.test(ctx) ? "month" : "year";
    if (plausible(lo, hi, code, period)) return { min: lo, max: hi, currency: code, period };
  }
  // INR "12 - 18 LPA" without a currency symbol
  const lpa = /(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(?:LPA|lpa|lakhs? per annum|L\.P\.A)/.exec(s);
  if (lpa) {
    const lo = Number(lpa[1]) * 1e5;
    const hi = Number(lpa[2]) * 1e5;
    if (plausible(lo, hi, "INR", "year")) return { min: lo, max: hi, currency: "INR", period: "year" };
  }
  return null;
}

/** Annualise a salary record. */
export function annual(min, max, period) {
  const f = period === "month" ? 12 : 1;
  return { min: min != null ? min * f : null, max: max != null ? max * f : null };
}

/**
 * Convert an amount between currencies using a USD-based rate table: rates[CCY] = units of CCY per 1 USD.
 * Returns null when a rate is missing.
 */
export function convert(amount, from, to, rates) {
  if (amount == null) return null;
  if (from === to) return amount;
  const rf = from === "USD" ? 1 : rates?.[from];
  const rt = to === "USD" ? 1 : rates?.[to];
  if (!rf || !rt) return null;
  return (amount / rf) * rt;
}

const roundK = (n) => {
  const k = n / 1000;
  if (k >= 100) return `${Math.round(k)}k`;
  if (k >= 10) return `${Math.round(k)}k`;
  return `${Math.round(k * 10) / 10}k`.replace(".0k", "k");
};
const fmtLpa = (inr) => {
  const l = inr / 1e5;
  const r = l >= 10 ? Math.round(l) : Math.round(l * 10) / 10;
  return String(r);
};

export function formatUsd(min, max) {
  if (min == null && max == null) return null;
  if (min != null && max != null && Math.round(min / 1000) !== Math.round(max / 1000)) return `$${roundK(min)} - $${roundK(max)}`;
  return `$${roundK(max ?? min)}`;
}

export function formatLpa(minInr, maxInr) {
  if (minInr == null && maxInr == null) return null;
  const a = fmtLpa(minInr ?? maxInr);
  const b = fmtLpa(maxInr ?? minInr);
  return a === b ? `₹${a} LPA` : `₹${a} - ₹${b} LPA`;
}

/**
 * Build the display string for a job's salary.
 * India regions: "₹6 - ₹10 LPA (~$7k - $12k)". Everywhere else: "$60k - $90k".
 * Returns { display, usdMin, usdMax, inrMin, inrMax } or { display: null } when not disclosed / not convertible.
 */
export function salaryView(job, { india, rates }) {
  if (job.salary_min == null && job.salary_max == null) return { display: null };
  const ccy = job.salary_currency ?? "USD";
  const a = annual(job.salary_min, job.salary_max, job.salary_period);
  const usdMin = convert(a.min, ccy, "USD", rates);
  const usdMax = convert(a.max, ccy, "USD", rates);
  const inrMin = convert(a.min, ccy, "INR", rates);
  const inrMax = convert(a.max, ccy, "INR", rates);
  if (usdMin == null && usdMax == null) return { display: null };
  if (india) {
    if (inrMin == null && inrMax == null) return { display: formatUsd(usdMin, usdMax), usdMin, usdMax };
    return { display: `${formatLpa(inrMin, inrMax)} (~${formatUsd(usdMin, usdMax)})`, usdMin, usdMax, inrMin, inrMax };
  }
  return { display: formatUsd(usdMin, usdMax), usdMin, usdMax, inrMin, inrMax };
}

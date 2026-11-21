// Location knowledge: canonical cities, aliases, countries, and the region options shown in the UI.

/** Indian cities: canonical name -> aliases (lowercase) and state words that imply the city. */
export const INDIA_CITIES = {
  Chennai: { aliases: ["chennai", "madras"], state: "Tamil Nadu" },
  Bengaluru: { aliases: ["bengaluru", "bangalore", "blr", "bengalooru"], state: "Karnataka" },
  Hyderabad: { aliases: ["hyderabad", "secunderabad", "hitec city", "hitech city", "cyberabad"], state: "Telangana" },
  Mumbai: { aliases: ["mumbai", "bombay", "navi mumbai", "thane", "powai"], state: "Maharashtra" },
  Delhi: { aliases: ["new delhi", "delhi"], state: "Delhi" },
  Gurugram: { aliases: ["gurugram", "gurgaon"], state: "Haryana" },
  Noida: { aliases: ["noida", "greater noida"], state: "Uttar Pradesh" },
  Pune: { aliases: ["pune", "poona"], state: "Maharashtra" },
  Kolkata: { aliases: ["kolkata", "calcutta"], state: "West Bengal" },
  Ahmedabad: { aliases: ["ahmedabad", "gandhinagar", "gift city"], state: "Gujarat" },
  Kochi: { aliases: ["kochi", "cochin", "ernakulam"], state: "Kerala" },
  Coimbatore: { aliases: ["coimbatore", "kovai"], state: "Tamil Nadu" },
  Jaipur: { aliases: ["jaipur"], state: "Rajasthan" },
  Chandigarh: { aliases: ["chandigarh", "mohali", "panchkula"], state: "Chandigarh" },
  Indore: { aliases: ["indore"], state: "Madhya Pradesh" },
  Lucknow: { aliases: ["lucknow"], state: "Uttar Pradesh" },
  Thiruvananthapuram: { aliases: ["thiruvananthapuram", "trivandrum", "technopark"], state: "Kerala" },
  Bhubaneswar: { aliases: ["bhubaneswar", "bhubaneshwar"], state: "Odisha" },
  Nagpur: { aliases: ["nagpur"], state: "Maharashtra" },
  Visakhapatnam: { aliases: ["visakhapatnam", "vizag", "vishakhapatnam"], state: "Andhra Pradesh" },
  Surat: { aliases: ["surat"], state: "Gujarat" },
  Mysuru: { aliases: ["mysuru", "mysore"], state: "Karnataka" },
  Madurai: { aliases: ["madurai"], state: "Tamil Nadu" },
  Vadodara: { aliases: ["vadodara", "baroda"], state: "Gujarat" },
  Bhopal: { aliases: ["bhopal"], state: "Madhya Pradesh" },
  Patna: { aliases: ["patna"], state: "Bihar" },
  Faridabad: { aliases: ["faridabad"], state: "Haryana" },
  Ghaziabad: { aliases: ["ghaziabad"], state: "Uttar Pradesh" },
};

/** Global cities -> country. */
export const GLOBAL_CITIES = {
  "San Francisco": { aliases: ["san francisco", "sf bay area", "bay area", "south san francisco"], country: "United States" },
  "New York": { aliases: ["new york", "nyc", "new york city", "brooklyn", "manhattan"], country: "United States" },
  Seattle: { aliases: ["seattle", "bellevue", "redmond"], country: "United States" },
  Austin: { aliases: ["austin"], country: "United States" },
  Boston: { aliases: ["boston", "cambridge, ma"], country: "United States" },
  Chicago: { aliases: ["chicago"], country: "United States" },
  "Los Angeles": { aliases: ["los angeles", "santa monica"], country: "United States" },
  "Mountain View": { aliases: ["mountain view", "palo alto", "menlo park", "sunnyvale", "san jose", "san mateo", "redwood city", "cupertino"], country: "United States" },
  Denver: { aliases: ["denver", "boulder"], country: "United States" },
  Atlanta: { aliases: ["atlanta"], country: "United States" },
  "Washington DC": { aliases: ["washington, dc", "washington dc", "washington d.c."], country: "United States" },
  London: { aliases: ["london"], country: "United Kingdom" },
  Manchester: { aliases: ["manchester"], country: "United Kingdom" },
  Edinburgh: { aliases: ["edinburgh"], country: "United Kingdom" },
  Dublin: { aliases: ["dublin"], country: "Ireland" },
  Berlin: { aliases: ["berlin"], country: "Germany" },
  Munich: { aliases: ["munich", "münchen", "muenchen"], country: "Germany" },
  Hamburg: { aliases: ["hamburg"], country: "Germany" },
  Frankfurt: { aliases: ["frankfurt"], country: "Germany" },
  Amsterdam: { aliases: ["amsterdam"], country: "Netherlands" },
  Paris: { aliases: ["paris"], country: "France" },
  Madrid: { aliases: ["madrid"], country: "Spain" },
  Barcelona: { aliases: ["barcelona"], country: "Spain" },
  Lisbon: { aliases: ["lisbon", "lisboa"], country: "Portugal" },
  Stockholm: { aliases: ["stockholm"], country: "Sweden" },
  Zurich: { aliases: ["zurich", "zürich"], country: "Switzerland" },
  Warsaw: { aliases: ["warsaw", "warszawa"], country: "Poland" },
  Toronto: { aliases: ["toronto"], country: "Canada" },
  Vancouver: { aliases: ["vancouver"], country: "Canada" },
  Montreal: { aliases: ["montreal", "montréal"], country: "Canada" },
  Singapore: { aliases: ["singapore"], country: "Singapore" },
  Dubai: { aliases: ["dubai"], country: "United Arab Emirates" },
  "Abu Dhabi": { aliases: ["abu dhabi"], country: "United Arab Emirates" },
  Sydney: { aliases: ["sydney"], country: "Australia" },
  Melbourne: { aliases: ["melbourne"], country: "Australia" },
  Tokyo: { aliases: ["tokyo"], country: "Japan" },
  Seoul: { aliases: ["seoul"], country: "South Korea" },
  Bangkok: { aliases: ["bangkok"], country: "Thailand" },
  Jakarta: { aliases: ["jakarta"], country: "Indonesia" },
  "Kuala Lumpur": { aliases: ["kuala lumpur"], country: "Malaysia" },
  Manila: { aliases: ["manila", "makati", "taguig"], country: "Philippines" },
  "São Paulo": { aliases: ["são paulo", "sao paulo"], country: "Brazil" },
  "Mexico City": { aliases: ["mexico city", "ciudad de méxico"], country: "Mexico" },
  "Tel Aviv": { aliases: ["tel aviv"], country: "Israel" },
};

/** Countries: canonical -> aliases. Short codes are matched as whole tokens only. */
export const COUNTRIES = {
  India: { aliases: ["india", "bharat"], codes: ["IND"] },
  "United States": { aliases: ["united states", "usa", "u.s.", "u.s.a", "united states of america", "america"], codes: ["US", "USA"] },
  "United Kingdom": { aliases: ["united kingdom", "england", "scotland", "wales", "great britain", "britain"], codes: ["UK", "GB"] },
  Canada: { aliases: ["canada"], codes: [] },
  Germany: { aliases: ["germany", "deutschland"], codes: [] },
  Singapore: { aliases: ["singapore"], codes: ["SG"] },
  "United Arab Emirates": { aliases: ["united arab emirates", "uae"], codes: ["AE", "UAE"] },
  Australia: { aliases: ["australia"], codes: ["AU"] },
  Ireland: { aliases: ["ireland"], codes: ["IE"] },
  Netherlands: { aliases: ["netherlands", "holland"], codes: ["NL"] },
  France: { aliases: ["france"], codes: ["FR"] },
  Spain: { aliases: ["spain"], codes: ["ES"] },
  Portugal: { aliases: ["portugal"], codes: ["PT"] },
  Sweden: { aliases: ["sweden"], codes: ["SE"] },
  Switzerland: { aliases: ["switzerland"], codes: ["CH"] },
  Poland: { aliases: ["poland"], codes: ["PL"] },
  Japan: { aliases: ["japan"], codes: ["JP"] },
  "South Korea": { aliases: ["south korea", "korea"], codes: ["KR"] },
  Thailand: { aliases: ["thailand"], codes: ["TH"] },
  Indonesia: { aliases: ["indonesia"], codes: [] },
  Malaysia: { aliases: ["malaysia"], codes: ["MY"] },
  Philippines: { aliases: ["philippines"], codes: ["PH"] },
  Brazil: { aliases: ["brazil", "brasil"], codes: ["BR"] },
  Mexico: { aliases: ["mexico", "méxico"], codes: ["MX"] },
  Israel: { aliases: ["israel"], codes: [] },
  "New Zealand": { aliases: ["new zealand"], codes: ["NZ"] },
  Austria: { aliases: ["austria"], codes: ["AT"] },
  Denmark: { aliases: ["denmark"], codes: ["DK"] },
  Norway: { aliases: ["norway"], codes: [] },
  Finland: { aliases: ["finland"], codes: ["FI"] },
  Italy: { aliases: ["italy"], codes: [] },
  Belgium: { aliases: ["belgium"], codes: ["BE"] },
  "Czech Republic": { aliases: ["czech republic", "czechia", "prague"], codes: ["CZ"] },
  Romania: { aliases: ["romania", "bucharest"], codes: ["RO"] },
  Argentina: { aliases: ["argentina", "buenos aires"], codes: [] },
  Colombia: { aliases: ["colombia", "bogota", "bogotá"], codes: [] },
  Chile: { aliases: ["chile", "santiago"], codes: [] },
  "South Africa": { aliases: ["south africa", "cape town", "johannesburg"], codes: ["ZA"] },
  Nigeria: { aliases: ["nigeria", "lagos"], codes: ["NG"] },
  Kenya: { aliases: ["kenya", "nairobi"], codes: ["KE"] },
  Egypt: { aliases: ["egypt", "cairo"], codes: ["EG"] },
  "Saudi Arabia": { aliases: ["saudi arabia", "riyadh"], codes: ["KSA"] },
  Vietnam: { aliases: ["vietnam", "ho chi minh", "hanoi"], codes: ["VN"] },
  Taiwan: { aliases: ["taiwan", "taipei"], codes: ["TW"] },
  "Hong Kong": { aliases: ["hong kong"], codes: ["HK"] },
  China: { aliases: ["china", "beijing", "shanghai", "shenzhen"], codes: ["CN"] },
  Turkey: { aliases: ["turkey", "türkiye", "istanbul"], codes: ["TR"] },
  Ukraine: { aliases: ["ukraine", "kyiv"], codes: ["UA"] },
  Estonia: { aliases: ["estonia", "tallinn"], codes: ["EE"] },
};

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];
const US_STATE_NAMES = ["alabama","alaska","arizona","arkansas","california","colorado","connecticut","delaware","florida","georgia","hawaii","idaho","illinois","iowa","kansas","kentucky","louisiana","maine","maryland","massachusetts","michigan","minnesota","mississippi","missouri","montana","nebraska","nevada","new hampshire","new jersey","new mexico","north carolina","north dakota","ohio","oklahoma","oregon","pennsylvania","rhode island","south carolina","south dakota","tennessee","texas","utah","vermont","virginia","washington","west virginia","wisconsin","wyoming"];
const INDIA_STATES = ["tamil nadu","karnataka","telangana","maharashtra","haryana","uttar pradesh","west bengal","gujarat","kerala","rajasthan","madhya pradesh","odisha","andhra pradesh","bihar","punjab","goa","assam","jharkhand","uttarakhand","chhattisgarh"];
const CANADA_PROVINCES = ["ontario", "british columbia", "quebec", "alberta"];

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wordRe = (alias) => new RegExp(`(^|[^\\p{L}])${esc(alias)}($|[^\\p{L}])`, "iu");

const cityMatchers = [
  ...Object.entries(INDIA_CITIES).map(([city, v]) => ({ city, country: "India", res: v.aliases.map(wordRe) })),
  ...Object.entries(GLOBAL_CITIES).map(([city, v]) => ({ city, country: v.country, res: v.aliases.map(wordRe) })),
];
const countryMatchers = Object.entries(COUNTRIES).map(([country, v]) => ({
  country,
  res: v.aliases.map(wordRe),
  codeRes: v.codes.map((c) => new RegExp(`(^|[\\s,(/-])${c}($|[\\s,)/-])`)),
}));

const REMOTE_RE = /\b(remote|anywhere|work from home|wfh|distributed|fully[- ]remote|remote[- ]first)\b/i;

/**
 * Parse a free-text location ("Bengaluru, Karnataka, India", "Remote - US", "San Francisco, CA | New York")
 * into { cities[], countries[], city, country, isRemote }.
 */
export function parseLocation(raw, extra = {}) {
  const text = String(raw ?? "").trim();
  const cities = new Set();
  const countries = new Set();
  for (const m of cityMatchers) {
    if (m.res.some((r) => r.test(text))) {
      cities.add(m.city);
      countries.add(m.country);
    }
  }
  // "Washington" alone is a US state, not DC; only DC aliases above map to Washington DC.
  for (const m of countryMatchers) {
    if (m.res.some((r) => r.test(text)) || m.codeRes.some((r) => r.test(text))) countries.add(m.country);
  }
  const lower = text.toLowerCase();
  if (INDIA_STATES.some((s) => lower.includes(s))) countries.add("India");
  if (US_STATE_NAMES.some((s) => wordRe(s).test(text)) && !countries.has("India")) {
    // "Washington" could be DC or the state; both are US.
    countries.add("United States");
  }
  if (US_STATES.some((s) => new RegExp(`,\\s*${s}(\\b|$)`).test(text))) countries.add("United States");
  if (CANADA_PROVINCES.some((s) => lower.includes(s))) countries.add("Canada");
  // Georgia (country) vs Georgia (US state) ambiguity is ignored on purpose.
  if (extra.country) {
    const c = canonicalCountry(extra.country);
    if (c) countries.add(c);
  }
  if (extra.city) {
    const c = canonicalCity(extra.city);
    if (c) {
      cities.add(c.city);
      countries.add(c.country);
    }
  }
  const isRemote = Boolean(extra.remote) || REMOTE_RE.test(text);
  const cityArr = [...cities];
  const countryArr = [...countries];
  return {
    cities: cityArr,
    countries: countryArr,
    city: cityArr[0] ?? null,
    country: countryArr[0] ?? null,
    isRemote,
  };
}

export function canonicalCity(name) {
  const t = String(name ?? "").trim().toLowerCase();
  if (!t) return null;
  for (const [city, v] of Object.entries(INDIA_CITIES)) if (city.toLowerCase() === t || v.aliases.includes(t)) return { city, country: "India" };
  for (const [city, v] of Object.entries(GLOBAL_CITIES)) if (city.toLowerCase() === t || v.aliases.includes(t)) return { city, country: v.country };
  return null;
}

export function canonicalCountry(name) {
  const raw = String(name ?? "").trim();
  const t = raw.toLowerCase();
  if (!t) return null;
  if (raw.length === 2 && ISO2[raw.toUpperCase()]) return ISO2[raw.toUpperCase()];
  for (const [country, v] of Object.entries(COUNTRIES)) {
    if (country.toLowerCase() === t || v.aliases.includes(t) || v.codes.includes(raw.toUpperCase())) return country;
  }
  return null;
}

// ---------------------------------------------------------------------------------------------
// Regions shown in the location dropdown.
// kind: global | india | remote | remote-india | city | metro | country
// ---------------------------------------------------------------------------------------------
const INDIA_DROPDOWN = [
  "Chennai", "Bengaluru", "Hyderabad", "Mumbai", "Delhi NCR", "Pune", "Kolkata", "Ahmedabad", "Kochi",
  "Coimbatore", "Jaipur", "Chandigarh", "Indore", "Lucknow", "Thiruvananthapuram", "Bhubaneswar", "Nagpur",
  "Visakhapatnam", "Surat", "Mysuru", "Madurai", "Vadodara", "Bhopal", "Patna",
];

export const REGIONS = [
  { id: "Global", label: "Global (top results)", kind: "global", group: "Popular" },
  { id: "India", label: "India (all)", kind: "india", group: "Popular", aliases: ["all india", "india (all)", "pan india", "pan-india"] },
  { id: "Remote", label: "Remote", kind: "remote", group: "Popular", aliases: ["remote", "anywhere", "work from home", "wfh"] },
  { id: "Remote India", label: "Remote (India)", kind: "remote-india", group: "Popular", aliases: ["remote (india)", "remote india", "india remote"] },
  ...INDIA_DROPDOWN.map((c) =>
    c === "Delhi NCR"
      ? { id: "Delhi NCR", label: "Delhi NCR (Delhi, Gurugram, Noida)", kind: "metro", group: "India", country: "India", cities: ["Delhi", "Gurugram", "Noida", "Faridabad", "Ghaziabad"], aliases: ["delhi ncr", "delhi-ncr", "ncr", "delhi", "new delhi", "gurgaon", "gurugram", "noida", "gurgaon / delhi ncr"] }
      : { id: c, label: c, kind: "city", group: "India", country: "India", cities: [c], aliases: INDIA_CITIES[c].aliases },
  ),
  { id: "United States", label: "United States", kind: "country", group: "Global", country: "United States", aliases: ["us", "usa", "united states", "america"] },
  { id: "United Kingdom", label: "United Kingdom", kind: "country", group: "Global", country: "United Kingdom", aliases: ["uk", "united kingdom", "england", "britain"] },
  { id: "Canada", label: "Canada", kind: "country", group: "Global", country: "Canada" },
  { id: "Germany", label: "Germany", kind: "country", group: "Global", country: "Germany" },
  { id: "Singapore", label: "Singapore", kind: "country", group: "Global", country: "Singapore" },
  { id: "United Arab Emirates", label: "UAE", kind: "country", group: "Global", country: "United Arab Emirates", aliases: ["uae", "united arab emirates", "dubai"] },
  { id: "Australia", label: "Australia", kind: "country", group: "Global", country: "Australia" },
  { id: "Ireland", label: "Ireland", kind: "country", group: "Global", country: "Ireland" },
  { id: "Netherlands", label: "Netherlands", kind: "country", group: "Global", country: "Netherlands" },
  { id: "San Francisco", label: "San Francisco Bay Area", kind: "metro", group: "Global", country: "United States", cities: ["San Francisco", "Mountain View"], aliases: ["san francisco", "sf", "bay area", "sf bay area"] },
  ...["New York", "Seattle", "London", "Berlin", "Toronto", "Dublin", "Amsterdam", "Paris", "Sydney", "Tokyo"].map((c) => ({
    id: c, label: c, kind: "city", group: "Global", country: GLOBAL_CITIES[c].country, cities: [c], aliases: GLOBAL_CITIES[c].aliases,
  })),
];

const regionById = new Map(REGIONS.map((r) => [r.id.toLowerCase(), r]));

/** Resolve any user-supplied region/location string (incl. aliases & legacy values) to a REGIONS entry. */
export function resolveRegion(input) {
  const raw = String(input ?? "").trim();
  if (!raw || /^(all|global|worldwide|global \(top results\))$/i.test(raw)) return regionById.get("global");
  const t = raw.toLowerCase();
  if (regionById.has(t)) return regionById.get(t);
  for (const r of REGIONS) {
    if (r.label.toLowerCase() === t) return r;
    if (r.aliases?.includes(t)) return r;
  }
  // Legacy values like "Bengaluru, Karnataka" or "Remote (India)" or "Chennai, Tamil Nadu"
  const first = t.split(/[,/|]/)[0].trim();
  for (const r of REGIONS) if (r.id.toLowerCase() === first || r.aliases?.includes(first)) return r;
  const city = canonicalCity(first);
  if (city) return { id: city.city, label: city.city, kind: "city", country: city.country, cities: [city.city] };
  const country = canonicalCountry(first) ?? canonicalCountry(raw);
  if (country) return { id: country, label: country, kind: "country", country };
  return { id: raw, label: raw, kind: "freetext", text: t };
}

export const isIndiaRegion = (region) => region.kind === "india" || region.kind === "remote-india" || region.country === "India";

/** Does a job (with parsed cities/countries/is_remote) belong to the region? */
export function jobInRegion(job, region) {
  switch (region.kind) {
    case "global":
      return true;
    case "india":
      return job.countries.includes("India");
    case "remote":
      return Boolean(job.is_remote);
    case "remote-india":
      return Boolean(job.is_remote) && job.countries.includes("India");
    case "city":
    case "metro":
      return job.cities.some((c) => region.cities.includes(c));
    case "country":
      return job.countries.includes(region.country);
    case "freetext":
      return (job.location_raw ?? "").toLowerCase().includes(region.text);
    default:
      return true;
  }
}

/** ISO 3166-1 alpha-2 -> canonical country (used for structured hints such as Lever's `country`). */
export const ISO2 = {
  IN: "India", US: "United States", GB: "United Kingdom", UK: "United Kingdom", CA: "Canada", DE: "Germany", SG: "Singapore",
  AE: "United Arab Emirates", AU: "Australia", IE: "Ireland", NL: "Netherlands", FR: "France", ES: "Spain", PT: "Portugal",
  SE: "Sweden", CH: "Switzerland", PL: "Poland", JP: "Japan", KR: "South Korea", TH: "Thailand", ID: "Indonesia", MY: "Malaysia",
  PH: "Philippines", BR: "Brazil", MX: "Mexico", IL: "Israel", NZ: "New Zealand", AT: "Austria", DK: "Denmark", NO: "Norway",
  FI: "Finland", IT: "Italy", BE: "Belgium", CZ: "Czech Republic", RO: "Romania", AR: "Argentina", CO: "Colombia", CL: "Chile",
  ZA: "South Africa", NG: "Nigeria", KE: "Kenya", EG: "Egypt", SA: "Saudi Arabia", VN: "Vietnam", TW: "Taiwan", HK: "Hong Kong",
  CN: "China", TR: "Turkey", UA: "Ukraine", EE: "Estonia",
};

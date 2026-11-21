// One-off helper that (re)generates server/data/companies.json from this curated list.
// Tokens were verified live on 2026-11-19. Use `npm run verify-companies` to re-check them.
const fs = require("node:fs");
const path = require("node:path");

const C = [];
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const add = (ats, token, name, industry, hq, website, india = false) => C.push({ id: slug(name), name, ats, token, industry, hq, website, india });

// ---- India-headquartered or India-heavy
add("greenhouse", "razorpaysoftwareprivatelimited", "Razorpay", "Fintech & Payments", "Bengaluru, India", "https://razorpay.com", true);
add("greenhouse", "groww", "Groww", "Fintech & Investing", "Bengaluru, India", "https://groww.in", true);
add("greenhouse", "inmobi", "InMobi", "AdTech", "Bengaluru, India", "https://www.inmobi.com", true);
add("greenhouse", "druva", "Druva", "Cloud Data Protection", "Pune, India & Sunnyvale, US", "https://www.druva.com", true);
add("greenhouse", "highradius", "HighRadius", "Fintech SaaS", "Houston, US & Hyderabad, India", "https://www.highradius.com", true);
add("greenhouse", "zuora", "Zuora", "Subscription Billing SaaS", "Redwood City, US", "https://www.zuora.com", true);
add("greenhouse", "fourkites", "FourKites", "Supply Chain SaaS", "Chicago, US", "https://www.fourkites.com", true);
add("greenhouse", "slice", "slice", "Fintech & Banking", "Bengaluru, India", "https://www.sliceit.com", true);
add("greenhouse", "truecaller", "Truecaller", "Communications", "Stockholm, Sweden", "https://www.truecaller.com", true);
add("greenhouse", "glance", "Glance", "Consumer Tech", "Bengaluru, India", "https://glance.com", true);
add("greenhouse", "verse", "VerSe Innovation", "Media Tech", "Bengaluru, India", "https://www.verse.in", true);
add("greenhouse", "hackerrank", "HackerRank", "Developer Tools", "Mountain View, US", "https://www.hackerrank.com", true);
add("greenhouse", "zinier", "Zinier", "Field Service SaaS", "San Francisco, US", "https://www.zinier.com", true);
add("greenhouse", "agoda", "Agoda", "Travel Tech", "Singapore", "https://www.agoda.com", true);
add("greenhouse", "turing", "Turing", "AI & Engineering Services", "Palo Alto, US", "https://www.turing.com", true);
add("lever", "cred", "CRED", "Fintech & Rewards", "Bengaluru, India", "https://cred.club", true);
add("lever", "meesho", "Meesho", "E-commerce", "Bengaluru, India", "https://www.meesho.com", true);
add("lever", "paytm", "Paytm", "Fintech & Payments", "Noida, India", "https://paytm.com", true);
add("lever", "zeta", "Zeta", "Banking Tech", "Bengaluru, India", "https://www.zeta.tech", true);
add("lever", "mindtickle", "Mindtickle", "Sales Enablement SaaS", "Pune, India & San Francisco, US", "https://www.mindtickle.com", true);
add("lever", "pocketfm", "Pocket FM", "Audio Entertainment", "Bengaluru, India", "https://www.pocketfm.com", true);
add("lever", "porter", "Porter", "Logistics", "Bengaluru, India", "https://porter.in", true);
add("lever", "fi", "Fi Money", "Fintech & Banking", "Bengaluru, India", "https://fi.money", true);
add("ashby", "sarvam", "Sarvam AI", "AI", "Bengaluru, India", "https://www.sarvam.ai", true);
add("ashby", "atlan", "Atlan", "Data Catalog SaaS", "Singapore & New Delhi, India", "https://atlan.com", true);
add("ashby", "plane", "Plane", "Project Management SaaS", "Bengaluru, India", "https://plane.so", true);
add("ashby", "signoz", "SigNoz", "Observability", "Bengaluru, India & San Francisco, US", "https://signoz.io", true);
add("zoho-rss", "careers.zohocorp.com/jobs/Careers", "Zoho", "Business Software", "Chennai, India", "https://www.zoho.com", true);

// ---- Global (region matching is always per job location, so their India roles still show up for India)
const G = [
  ["greenhouse", "figma", "Figma", "Design Tools", "San Francisco, US", "https://www.figma.com"],
  ["greenhouse", "stripe", "Stripe", "Fintech & Payments", "San Francisco, US & Dublin, Ireland", "https://stripe.com"],
  ["greenhouse", "airbnb", "Airbnb", "Travel", "San Francisco, US", "https://www.airbnb.com"],
  ["greenhouse", "cloudflare", "Cloudflare", "Internet Infrastructure", "San Francisco, US", "https://www.cloudflare.com"],
  ["greenhouse", "databricks", "Databricks", "Data & AI Platform", "San Francisco, US", "https://www.databricks.com"],
  ["greenhouse", "anthropic", "Anthropic", "AI", "San Francisco, US", "https://www.anthropic.com"],
  ["greenhouse", "coinbase", "Coinbase", "Crypto", "Remote-first, US", "https://www.coinbase.com"],
  ["greenhouse", "reddit", "Reddit", "Social Media", "San Francisco, US", "https://www.redditinc.com"],
  ["greenhouse", "gitlab", "GitLab", "Developer Tools", "Remote-first", "https://about.gitlab.com"],
  ["greenhouse", "lyft", "Lyft", "Mobility", "San Francisco, US", "https://www.lyft.com"],
  ["greenhouse", "pinterest", "Pinterest", "Social Media", "San Francisco, US", "https://www.pinterest.com"],
  ["greenhouse", "twilio", "Twilio", "Communications APIs", "San Francisco, US", "https://www.twilio.com"],
  ["greenhouse", "robinhood", "Robinhood", "Fintech & Investing", "Menlo Park, US", "https://robinhood.com"],
  ["greenhouse", "dropbox", "Dropbox", "Cloud Storage", "San Francisco, US", "https://www.dropbox.com"],
  ["greenhouse", "mongodb", "MongoDB", "Databases", "New York, US", "https://www.mongodb.com"],
  ["greenhouse", "elastic", "Elastic", "Search & Observability", "Mountain View, US & Amsterdam", "https://www.elastic.co"],
  ["greenhouse", "rubrik", "Rubrik", "Data Security", "Palo Alto, US", "https://www.rubrik.com"],
  ["greenhouse", "datadog", "Datadog", "Observability", "New York, US", "https://www.datadoghq.com"],
  ["greenhouse", "okta", "Okta", "Identity & Security", "San Francisco, US", "https://www.okta.com"],
  ["greenhouse", "samsara", "Samsara", "IoT & Operations", "San Francisco, US", "https://www.samsara.com"],
  ["greenhouse", "asana", "Asana", "Work Management SaaS", "San Francisco, US", "https://asana.com"],
  ["greenhouse", "instacart", "Instacart", "Grocery Delivery", "San Francisco, US", "https://www.instacart.com"],
  ["greenhouse", "gusto", "Gusto", "HR & Payroll SaaS", "San Francisco, US", "https://gusto.com"],
  ["greenhouse", "duolingo", "Duolingo", "EdTech", "Pittsburgh, US", "https://www.duolingo.com"],
  ["greenhouse", "toast", "Toast", "Restaurant Tech", "Boston, US", "https://pos.toasttab.com"],
  ["greenhouse", "vercel", "Vercel", "Developer Platform", "San Francisco, US", "https://vercel.com"],
  ["greenhouse", "brex", "Brex", "Fintech", "San Francisco, US", "https://www.brex.com"],
  ["greenhouse", "chime", "Chime", "Fintech & Banking", "San Francisco, US", "https://www.chime.com"],
  ["greenhouse", "flexport", "Flexport", "Logistics", "San Francisco, US", "https://www.flexport.com"],
  ["greenhouse", "affirm", "Affirm", "Fintech", "San Francisco, US", "https://www.affirm.com"],
  ["greenhouse", "wise", "Wise", "Fintech & Payments", "London, UK", "https://wise.com"],
  ["greenhouse", "monzo", "Monzo", "Banking", "London, UK", "https://monzo.com"],
  ["greenhouse", "n26", "N26", "Banking", "Berlin, Germany", "https://n26.com"],
  ["greenhouse", "celonis", "Celonis", "Process Mining SaaS", "Munich, Germany", "https://www.celonis.com"],
  ["greenhouse", "contentful", "Contentful", "Content Platform SaaS", "Berlin, Germany", "https://www.contentful.com"],
  ["greenhouse", "scaleai", "Scale AI", "AI Data", "San Francisco, US", "https://scale.com"],
  ["greenhouse", "intercom", "Intercom", "Customer Service SaaS", "San Francisco, US & Dublin, Ireland", "https://www.intercom.com"],
  ["greenhouse", "mixpanel", "Mixpanel", "Product Analytics", "San Francisco, US", "https://mixpanel.com"],
  ["greenhouse", "braze", "Braze", "Customer Engagement SaaS", "New York, US", "https://www.braze.com"],
  ["greenhouse", "pagerduty", "PagerDuty", "Incident Management", "San Francisco, US", "https://www.pagerduty.com"],
  ["greenhouse", "newrelic", "New Relic", "Observability", "San Francisco, US", "https://newrelic.com"],
  ["greenhouse", "discord", "Discord", "Communications", "San Francisco, US", "https://discord.com"],
  ["greenhouse", "airtable", "Airtable", "No-code SaaS", "San Francisco, US", "https://www.airtable.com"],
  ["lever", "spotify", "Spotify", "Music & Audio", "Stockholm, Sweden", "https://www.spotify.com"],
  ["lever", "palantir", "Palantir", "Data Analytics", "Denver, US", "https://www.palantir.com"],
  ["lever", "toptal", "Toptal", "Talent Marketplace", "Remote-first", "https://www.toptal.com"],
  ["ashby", "notion", "Notion", "Productivity SaaS", "San Francisco, US", "https://www.notion.so"],
  ["ashby", "openai", "OpenAI", "AI", "San Francisco, US", "https://openai.com"],
  ["ashby", "linear", "Linear", "Developer Tools", "San Francisco, US", "https://linear.app"],
  ["ashby", "ramp", "Ramp", "Fintech", "New York, US", "https://ramp.com"],
  ["ashby", "supabase", "Supabase", "Developer Platform", "Remote-first", "https://supabase.com"],
  ["ashby", "replit", "Replit", "Developer Tools", "San Francisco, US", "https://replit.com"],
  ["ashby", "modal", "Modal", "AI Infrastructure", "New York, US", "https://modal.com"],
  ["ashby", "cohere", "Cohere", "AI", "Toronto, Canada", "https://cohere.com"],
  ["ashby", "perplexity", "Perplexity", "AI", "San Francisco, US", "https://www.perplexity.ai"],
  ["ashby", "elevenlabs", "ElevenLabs", "AI Audio", "London, UK", "https://elevenlabs.io"],
  ["ashby", "vanta", "Vanta", "Security & Compliance", "San Francisco, US", "https://www.vanta.com"],
  ["ashby", "langchain", "LangChain", "AI Developer Tools", "San Francisco, US", "https://www.langchain.com"],
  ["ashby", "temporal", "Temporal", "Developer Platform", "Seattle, US", "https://temporal.io"],
  ["ashby", "hex", "Hex", "Data Analytics", "San Francisco, US", "https://hex.tech"],
  ["ashby", "posthog", "PostHog", "Product Analytics", "Remote-first", "https://posthog.com"],
  ["ashby", "snowflake", "Snowflake", "Data Cloud", "Bozeman, US", "https://www.snowflake.com"],
  ["ashby", "sentry", "Sentry", "Developer Tools", "San Francisco, US", "https://sentry.io"],
  ["ashby", "oyster", "Oyster", "HR & Global Payroll", "Remote-first", "https://www.oysterhr.com"],
  ["ashby", "airbyte", "Airbyte", "Data Integration", "San Francisco, US", "https://airbyte.com"],
  ["ashby", "resend", "Resend", "Developer Tools", "San Francisco, US", "https://resend.com"],
];
for (const g of G) add(...g, false);

const out = path.join(__dirname, "..", "server", "data", "companies.json");
fs.writeFileSync(
  out,
  JSON.stringify(
    {
      _note: "Seed list of public ATS boards. Each token was verified live. Run `npm run verify-companies` to re-check and prune dead ones. Only industry/HQ/website live here; jobs and company descriptions are always scraped.",
      verified_at: "2026-11-19",
      companies: C,
    },
    null,
    1,
  ),
);
console.log(`${C.length} companies -> ${out}`);

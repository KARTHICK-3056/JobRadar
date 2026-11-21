// Curated skills dictionary. Each entry: canonical name -> synonyms (case-insensitive, matched on word
// boundaries). Entries with `cs: true` are matched case-sensitively (short/ambiguous names like Go, R, C).
// `re` overrides the generated matcher entirely.

const D = {
  // ---- Languages
  JavaScript: ["javascript", "js", "ecmascript", "es6", "es2015"],
  TypeScript: ["typescript", "ts"],
  Python: ["python", "python3", "py"],
  Java: ["java", "j2ee", "jvm"],
  Kotlin: ["kotlin"],
  Scala: ["scala"],
  Go: { re: /\b[Gg]o[Ll]ang\b|(?<![\w.-])Go(?![\w+#-]|\s+(?:to|live|beyond|above|back|further|deeper|after|through|out|on|ahead|get)\b)/ },
  Rust: ["rust", "rustlang"],
  "C++": { re: /(?<![\w])c\+\+(?![\w])|\bcpp\b/i },
  "C#": { re: /(?<![\w])c#(?![\w])|\bcsharp\b|\.net core\b/i },
  C: { re: /(?<![\w+#.\-/&])C(?![\w+#\-/&.]|\s*(?:suite|level|corp|series|round))(?<!Series C)/ },
  Ruby: ["ruby"],
  PHP: ["php"],
  Swift: ["swift", "swiftui"],
  "Objective-C": ["objective-c", "objective c", "objc"],
  Dart: ["dart"],
  R: { re: /\bR (?:programming|language|studio)\b|\bRStudio\b|(?:, |\/)R(?=[,/ ]|$)(?! &)|\bin R\b/ },
  MATLAB: ["matlab"],
  Perl: ["perl"],
  Elixir: ["elixir"],
  Erlang: ["erlang"],
  Haskell: ["haskell"],
  Clojure: ["clojure"],
  Lua: ["lua"],
  Solidity: ["solidity"],
  Bash: ["bash", "shell scripting", "shell script", "zsh"],
  PowerShell: ["powershell"],
  SQL: ["sql", "t-sql", "pl/sql", "plsql", "tsql"],
  HTML: ["html", "html5"],
  CSS: ["css", "css3", "scss", "sass", "less css"],
  GraphQL: ["graphql"],
  Assembly: ["assembly language", "x86 assembly", "arm assembly"],
  Verilog: ["verilog", "systemverilog"],
  VHDL: ["vhdl"],
  COBOL: ["cobol"],
  Fortran: ["fortran"],
  Julia: { re: /\bJulia\b(?! [A-Z])/ },
  // ---- Frontend
  React: ["react", "reactjs", "react.js"],
  "React Native": ["react native", "react-native"],
  "Next.js": ["next.js", "nextjs", "next js"],
  Angular: ["angular", "angularjs", "angular.js"],
  "Vue.js": ["vue", "vuejs", "vue.js", "nuxt", "nuxt.js"],
  Svelte: ["svelte", "sveltekit"],
  Redux: ["redux", "redux toolkit"],
  "Tailwind CSS": ["tailwind", "tailwindcss", "tailwind css"],
  jQuery: ["jquery"],
  Webpack: ["webpack"],
  Vite: ["vite", "vitejs"],
  Flutter: ["flutter"],
  "Web Components": ["web components"],
  WebGL: ["webgl"],
  "Three.js": ["three.js", "threejs"],
  // ---- Backend / frameworks
  "Node.js": ["node.js", "nodejs", "node js", "node"],
  Express: ["express.js", "expressjs", "express js"],
  NestJS: ["nestjs", "nest.js"],
  Django: ["django"],
  Flask: ["flask"],
  FastAPI: ["fastapi"],
  Spring: ["spring", "spring boot", "springboot", "spring framework"],
  Hibernate: ["hibernate"],
  "Ruby on Rails": ["ruby on rails", "rails", "ror"],
  Laravel: ["laravel"],
  ".NET": ["asp.net", ".net", "dotnet", "dot net"],
  gRPC: ["grpc"],
  "REST APIs": ["rest api", "rest apis", "restful", "rest", "restful apis"],
  Microservices: ["microservices", "micro-services", "microservice"],
  "Distributed Systems": ["distributed systems", "distributed system"],
  "System Design": ["system design", "systems design"],
  // ---- Databases
  PostgreSQL: ["postgresql", "postgres", "psql"],
  MySQL: ["mysql", "mariadb"],
  MongoDB: ["mongodb", "mongo"],
  Redis: ["redis"],
  Cassandra: ["cassandra"],
  DynamoDB: ["dynamodb"],
  Elasticsearch: ["elasticsearch", "elastic search", "opensearch"],
  SQLite: ["sqlite"],
  Oracle: ["oracle db", "oracle database", "oracle"],
  "SQL Server": ["sql server", "mssql"],
  Snowflake: ["snowflake"],
  BigQuery: ["bigquery", "big query"],
  Redshift: ["redshift"],
  ClickHouse: ["clickhouse"],
  Neo4j: ["neo4j"],
  Firebase: ["firebase", "firestore"],
  Supabase: ["supabase"],
  "Vector Databases": ["vector database", "vector databases", "pinecone", "weaviate", "qdrant", "milvus", "pgvector"],
  // ---- Cloud / DevOps
  AWS: ["aws", "amazon web services", "ec2", "s3", "lambda", "ecs", "eks", "cloudformation"],
  GCP: ["gcp", "google cloud", "google cloud platform"],
  Azure: ["azure", "microsoft azure"],
  Docker: ["docker", "containers", "containerization"],
  Kubernetes: ["kubernetes", "k8s", "helm", "openshift"],
  Terraform: ["terraform", "infrastructure as code", "iac", "pulumi"],
  Ansible: ["ansible"],
  "CI/CD": ["ci/cd", "cicd", "continuous integration", "continuous delivery", "continuous deployment"],
  Jenkins: ["jenkins"],
  "GitHub Actions": ["github actions"],
  GitLab: ["gitlab", "gitlab ci"],
  Git: ["git", "version control"],
  Linux: ["linux", "unix", "ubuntu", "centos", "rhel"],
  Nginx: ["nginx"],
  Prometheus: ["prometheus"],
  Grafana: ["grafana"],
  Datadog: ["datadog"],
  Observability: ["observability", "opentelemetry", "monitoring and alerting"],
  SRE: ["sre", "site reliability", "site reliability engineering"],
  Serverless: ["serverless"],
  Networking: ["tcp/ip", "networking", "dns", "load balancing"],
  // ---- Data / ML
  "Machine Learning": ["machine learning", "ml", "ml models"],
  "Deep Learning": ["deep learning", "neural networks", "neural network"],
  NLP: ["nlp", "natural language processing"],
  "Computer Vision": ["computer vision", "image processing", "opencv"],
  LLMs: ["llm", "llms", "large language models", "large language model", "generative ai", "genai", "gen ai", "gpt", "prompt engineering", "rag", "retrieval augmented generation", "fine-tuning"],
  PyTorch: ["pytorch", "torch"],
  TensorFlow: ["tensorflow", "keras"],
  "scikit-learn": ["scikit-learn", "sklearn", "scikit learn"],
  Pandas: ["pandas"],
  NumPy: ["numpy"],
  Spark: ["spark", "apache spark", "pyspark"],
  Hadoop: ["hadoop", "hdfs", "hive"],
  Kafka: ["kafka", "apache kafka"],
  Airflow: ["airflow", "apache airflow"],
  dbt: ["dbt"],
  ETL: ["etl", "elt", "data pipelines", "data pipeline"],
  "Data Warehousing": ["data warehouse", "data warehousing", "data lake", "lakehouse"],
  Databricks: ["databricks"],
  Tableau: ["tableau"],
  "Power BI": ["power bi", "powerbi"],
  Looker: ["looker", "lookml"],
  Excel: ["excel", "spreadsheets", "google sheets"],
  Statistics: ["statistics", "statistical modeling", "statistical analysis", "a/b testing", "ab testing", "experimentation", "hypothesis testing"],
  "Data Analysis": ["data analysis", "data analytics", "analytics"],
  "Data Visualization": ["data visualization", "data visualisation", "dashboards"],
  MLOps: ["mlops", "ml ops", "mlflow", "kubeflow", "sagemaker", "vertex ai"],
  "Hugging Face": ["hugging face", "huggingface", "transformers"],
  LangChain: ["langchain", "llamaindex"],
  // ---- Mobile
  Android: ["android", "android sdk", "jetpack compose"],
  iOS: ["ios", "uikit", "xcode"],
  // ---- Testing / QA
  "Test Automation": ["test automation", "automation testing", "automated testing"],
  Selenium: ["selenium"],
  Cypress: ["cypress"],
  Playwright: ["playwright"],
  Jest: ["jest"],
  JUnit: ["junit"],
  pytest: ["pytest"],
  // ---- Security
  Security: ["application security", "appsec", "cybersecurity", "cyber security", "infosec", "penetration testing", "pentesting", "vulnerability", "threat modeling", "soc 2", "iso 27001", "siem"],
  OAuth: ["oauth", "oauth2", "openid connect", "oidc", "saml", "sso"],
  Cryptography: ["cryptography", "encryption"],
  // ---- Design
  Figma: ["figma"],
  Sketch: { re: /\bSketch\b(?! out)/ },
  "Adobe XD": ["adobe xd"],
  Photoshop: ["photoshop"],
  Illustrator: ["illustrator"],
  "After Effects": ["after effects"],
  "UI Design": ["ui design", "user interface design", "visual design", "interaction design"],
  "UX Design": ["ux", "ux design", "user experience", "ux research", "user research", "usability testing"],
  Prototyping: ["prototyping", "wireframing", "wireframes", "prototypes"],
  "Design Systems": ["design system", "design systems"],
  Accessibility: ["accessibility", "wcag", "a11y"],
  "Motion Design": ["motion design", "animation"],
  // ---- Product / business
  "Product Management": ["product management", "product roadmap", "roadmapping", "prd", "product strategy"],
  Agile: ["agile", "scrum", "kanban", "sprint planning"],
  Jira: ["jira", "confluence"],
  SEO: ["seo", "search engine optimization"],
  SEM: ["sem", "google ads", "paid search", "ppc", "performance marketing"],
  "Content Marketing": ["content marketing", "copywriting", "content strategy"],
  "Social Media": ["social media", "social media marketing"],
  "Email Marketing": ["email marketing", "marketing automation", "hubspot", "marketo", "braze"],
  "Google Analytics": ["google analytics", "ga4", "mixpanel", "amplitude"],
  Salesforce: ["salesforce", "sfdc"],
  CRM: ["crm"],
  "B2B Sales": ["b2b sales", "enterprise sales", "saas sales"],
  "Customer Success": ["customer success", "account management"],
  "Technical Writing": ["technical writing", "documentation"],
  Communication: ["communication skills", "stakeholder management"],
  Recruiting: ["recruiting", "talent acquisition", "sourcing"],
  HRIS: ["hris", "workday", "successfactors", "bamboohr"],
  Finance: ["financial modeling", "fp&a", "accounting"],
  // ---- Misc engineering
  Blockchain: ["blockchain", "web3", "ethereum", "smart contracts"],
  Embedded: ["embedded systems", "embedded", "firmware", "rtos", "microcontrollers"],
  "Game Development": ["unity", "unreal engine", "game development"],
  Compilers: ["compilers", "llvm"],
  CUDA: ["cuda", "gpu programming"],
  Payments: ["payments", "upi", "payment gateway"],
  "Data Structures & Algorithms": ["data structures", "algorithms", "dsa"],
  OOP: ["object oriented", "object-oriented", "oop", "ood"],
};

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Synonyms that are common English words: only match them case-sensitively in their tech casing.
const CASE_SENSITIVE_SYNONYMS = new Set(["rest", "node", "spring", "rails", "express", "oracle", "unity", "lambda", "ts", "ml", "ux", "sem", "py", "less css", "transformers", "embedded", "animation", "containers", "analytics", "documentation", "sourcing", "payments", "algorithms", "excel", "torch", "agile", "dashboards", "crm", "ror", "rag", "gpt", "dsa", "ood", "oop", "iac", "s3", "ecs", "eks", "ec2", "dns", "sso"]);
const TECH_CASE = { rest: "REST", node: "Node", spring: "Spring", rails: "Rails", express: "Express", oracle: "Oracle", unity: "Unity", lambda: "Lambda", ts: "TS", ml: "ML", ux: "UX", sem: "SEM", py: "Py", "less css": "LESS", transformers: "Transformers", embedded: "embedded", animation: "animation", containers: "containers", analytics: "analytics", documentation: "documentation", sourcing: "sourcing", payments: "payments", algorithms: "algorithms", excel: "Excel", torch: "Torch", agile: "Agile", dashboards: "dashboards", crm: "CRM", ror: "RoR", rag: "RAG", gpt: "GPT", dsa: "DSA", ood: "OOD", oop: "OOP", iac: "IaC", s3: "S3", ecs: "ECS", eks: "EKS", ec2: "EC2", dns: "DNS", sso: "SSO" };
// Lowercase generic words are too noisy to count as skills from job descriptions.
const DESCRIPTION_NOISE = new Set(["embedded", "animation", "containers", "analytics", "documentation", "sourcing", "payments", "algorithms", "dashboards"]);

function buildMatchers(noiseFilter) {
  const out = [];
  for (const [name, spec] of Object.entries(D)) {
    if (!Array.isArray(spec)) {
      out.push({ name, res: [spec.re] });
      continue;
    }
    const res = [];
    for (const syn of spec) {
      if (noiseFilter && DESCRIPTION_NOISE.has(syn)) continue;
      const body = `(?<![\\w.+#-])${esc(syn)}(?![\\w+#]|\\.\\w)`;
      if (CASE_SENSITIVE_SYNONYMS.has(syn)) res.push(new RegExp(body.replace(esc(syn), esc(TECH_CASE[syn] ?? syn))));
      else res.push(new RegExp(body, "i"));
    }
    if (res.length) out.push({ name, res });
  }
  return out;
}

const MATCHERS = buildMatchers(true);
const MATCHERS_LOOSE = buildMatchers(false);

/** Extract canonical skills from free text. Returns a de-duplicated array in dictionary order. */
export function extractSkills(text, { loose = false } = {}) {
  if (!text) return [];
  const s = String(text);
  const found = [];
  for (const m of loose ? MATCHERS_LOOSE : MATCHERS) {
    if (m.res.some((r) => r.test(s))) found.push(m.name);
  }
  // A mention of "React Native" alone shouldn't also imply React web, etc. Keep both if both present.
  return found;
}

/** Normalise a user-typed skill to the canonical dictionary name when possible. */
export function canonicalSkill(input) {
  const t = String(input ?? "").trim();
  if (!t) return null;
  const lower = t.toLowerCase();
  for (const [name, spec] of Object.entries(D)) {
    if (name.toLowerCase() === lower) return name;
    if (Array.isArray(spec) && spec.includes(lower)) return name;
  }
  const hit = extractSkills(t, { loose: true });
  return hit[0] ?? t;
}

export const SKILL_NAMES = Object.keys(D);

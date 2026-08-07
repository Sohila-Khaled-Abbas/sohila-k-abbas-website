import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Github, BarChart3, Search, X, Filter, Presentation, ExternalLink, CheckCircle2 } from "lucide-react";
import { useProjects } from "@/hooks/use-supabase-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Project } from "@/lib/supabase";

const Projects = () => {
  const { data: projects, isLoading, error } = useProjects();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTechnology, setSelectedTechnology] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commonTechs, setCommonTechs] = useState<string[]>([]);

  const uniqueTechnologies = projects
    ? [...new Set(projects.flatMap((p) => p.technologies || []))]
    : [];

  useEffect(() => {
    if (projects) {
      const techCount = new Map<string, number>();
      projects.forEach((p) =>
        p.technologies?.forEach((t) => techCount.set(t, (techCount.get(t) || 0) + 1))
      );
      setCommonTechs(
        Array.from(techCount.entries())
          .filter(([, c]) => c > 1)
          .sort((a, b) => b[1] - a[1])
          .map(([t]) => t)
          .slice(0, 5)
      );
    }
  }, [projects]);

  useEffect(() => {
    if (!projects) return;
    let result = [...projects];
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const exactTech = uniqueTechnologies.find((t) => t.toLowerCase() === q);
      if (exactTech && !selectedTechnology) {
        result = result.filter((p) => p.technologies?.includes(exactTech));
      } else {
        result = result.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.technologies?.some((t) => t.toLowerCase().includes(q))
        );
      }
    }
    if (selectedTechnology) {
      result = result.filter((p) => p.technologies?.includes(selectedTechnology));
    }
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime());
    } else if (sortBy === "tech") {
      result.sort((a, b) => (a.technologies?.join("") || "").localeCompare(b.technologies?.join("") || ""));
    }
    setFilteredProjects(result);
  }, [projects, searchQuery, selectedTechnology, sortBy, uniqueTechnologies]);

  const highlightIfMatched = (t: string) => searchQuery && t.toLowerCase().includes(searchQuery.toLowerCase());

  const fallbackProjects = [
    {
      title: "Gourmet Bistro — Multi-Agent AI Customer Service & Ordering System",
      description: "Enterprise multi-agent automation system in n8n featuring LangChain, Qdrant/Supabase RAG, Google Sheets dynamic pricing, order management with 5-min cancellation grace period, and Telegram kitchen dispatch.",
      technologies: ["n8n", "LangChain", "Qdrant", "Supabase", "Telegram API", "PostgreSQL", "Google Sheets"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/n8n-workflow-gourmet-bistro-customer-service",
      live_url: "https://github.com/Sohila-Khaled-Abbas/n8n-workflow-gourmet-bistro-customer-service",
      details: {
        business_goal: "Automate 80% of front-of-house customer service inquiries, dynamic pricing calculations, and order modifications while enforcing business rules and kitchen dispatch.",
        technical_implementation: [
          "Engineered a supervisory LangChain multi-agent router dispatching inquiries to 4 role-specialized sub-agents (Front Desk, Menu FAQ, Order Creation, and Cancellation).",
          "Integrated Qdrant vector database and Supabase PgVector embeddings for grounded allergen and menu Q&A without hallucinations.",
          "Built order calculation logic querying Google Sheets pricing and persisting draft states into Supabase PostgreSQL.",
          "Enforced business rules: strict 5-minute order cancellation window and Egyptian phone number validation before dispatching Telegram kitchen alerts."
        ],
        key_business_insights: [
          "Role-Based Agent Decoupling: Delegating specialized roles prevented prompt degradation and improved response accuracy to 99%.",
          "Idempotency in Ordering: Database upserts prevented duplicate orders during temporary network retries.",
          "Grace Period Enforcement: Automated cancellation time checking eliminated kitchen food waste caused by late order cancellations."
        ],
        outcomes: [
          "80% Workload Reduction: Handled routine menu questions and draft orders without human staff intervention.",
          "Instant Kitchen Dispatch: Reduced order-to-kitchen transmission time to under 2 seconds via Telegram alerts."
        ]
      }
    },
    {
      title: "Apple Financial & Product Intelligence RAG Agent v2",
      description: "Autonomous RAG agent indexing Apple's SEC 10-K financial filings and hardware product catalogs into Qdrant using OpenAI embeddings and PostgreSQL buffer memory.",
      technologies: ["n8n", "LangChain", "OpenAI", "Qdrant", "PostgreSQL", "RAG"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/n8n-workflow-apple-rag-chatbot-v2",
      live_url: "https://github.com/Sohila-Khaled-Abbas/n8n-workflow-apple-rag-chatbot-v2",
      details: {
        business_goal: "Enable instant, accurate natural-language querying of SEC 10-K annual reports and product specs with strict citation grounding.",
        technical_implementation: [
          "Implemented text chunking and vectorization using OpenAI text-embedding-3-small into a high-performance Qdrant vector store.",
          "Constructed hybrid search retriever with cosine distance scoring to find precise financial metrics across hundreds of pages.",
          "Integrated PostgreSQL conversational buffer memory to maintain context across multi-turn user dialogues."
        ],
        key_business_insights: [
          "Context Window Efficiency: Chunk-level retrieval reduced prompt token consumption by 70% compared to full document passing.",
          "Strict Grounding: Prompt constraints prevented hallucinated balance sheet numbers by enforcing source citations."
        ],
        outcomes: [
          "Instant Financial Lookup: Cut analyst query time on 10-K filings from 20 minutes of manual searching to under 3 seconds."
        ]
      }
    },
    {
      title: "Upwork AI Automated Proposal & Job Lead Pipeline",
      description: "Automated freelance lead generation engine scraping high-budget Upwork job postings via Apify, evaluating client requirements with GPT-4, and generating tailored proposals.",
      technologies: ["n8n", "Apify", "OpenAI", "LangChain", "JavaScript", "Telegram API"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/n8n-workflow-upwork-ai-proposal-creator",
      live_url: "https://github.com/Sohila-Khaled-Abbas/n8n-workflow-upwork-ai-proposal-creator",
      details: {
        business_goal: "Accelerate freelance lead prospecting and eliminate hours of manual proposal drafting while increasing interview conversion rates.",
        technical_implementation: [
          "Configured scheduled Apify scraper actors to harvest new job postings matching targeted keywords and client verification criteria.",
          "Extracted core client pain points and technical requirements using structured GPT-4 prompt chains.",
          "Generated tailored proposal drafts including relevant portfolio proofs and pushed them directly to a private Telegram channel for instant review."
        ],
        key_business_insights: [
          "Early Application Advantage: Automated alerts enabled submitting custom proposals within the first 15 minutes of job posting.",
          "Personalization Impact: Requirement-matched proposals achieved 3x higher response rates than generic templates."
        ],
        outcomes: [
          "10+ Hours Saved Weekly: Transformed a 12-hour weekly prospecting chore into a 20-minute review session."
        ]
      }
    },
    {
      title: "Pizza Delivery Bot with MSSQL Session Persistence",
      description: "Interactive Telegram delivery bot with natural language cart management, LangChain agent, OpenRouter inference, and relational MSSQL session state persistence.",
      technologies: ["n8n", "Telegram API", "LangChain", "OpenRouter", "MSSQL", "SQL"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/n8n-workflow-delivery-telegram-bot",
      live_url: "https://github.com/Sohila-Khaled-Abbas/n8n-workflow-delivery-telegram-bot",
      details: {
        business_goal: "Provide a conversational food ordering interface on Telegram with resilient cart state persistence across chat sessions.",
        technical_implementation: [
          "Built a Telegram bot trigger capturing user messages and routing to a LangChain agent powered by OpenRouter.",
          "Implemented custom tool nodes for adding items, calculating subtotals, and removing cart entries.",
          "Persisted cart sessions and user state into relational MSSQL tables for state recovery."
        ],
        key_business_insights: [
          "Session Resilience: Storing cart data in MSSQL prevented customer cart loss during network disconnections.",
          "Natural Language Ordering: Handled complex conversational additions ('add extra cheese to second pizza') seamlessly."
        ],
        outcomes: [
          "Zero Cart Drop-Off from Timeouts: Session persistence ensured 100% cart recovery upon user reconnect."
        ]
      }
    },
    {
      title: "Emaar Towers Real Estate AI Lead Qualification Agent",
      description: "Real estate AI lead qualification agent evaluating buyer budgets, property preferences, and down payment readiness with OpenRouter LLM, CRM logging, and VIP broker routing.",
      technologies: ["n8n", "OpenRouter", "Telegram API", "Google Sheets", "CRM Automation"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/n8n-workflow-emaar-towers-lead-qualification",
      live_url: "https://github.com/Sohila-Khaled-Abbas/n8n-workflow-emaar-towers-lead-qualification",
      details: {
        business_goal: "Qualify inbound luxury real estate inquiries automatically, filtering low-intent leads and fast-tracking high-net-worth buyers.",
        technical_implementation: [
          "Engineered a multi-turn conversational agent asking structured questions on budget, preferred unit type, and payment timeline.",
          "Classified buyer intent and budget tiers automatically into CRM spreadsheets.",
          "Dispatched high-priority Telegram alerts to senior sales brokers for qualified luxury buyers."
        ],
        key_business_insights: [
          "Lead Prioritization: Filtering buyers below the threshold saved brokers over 15 hours per week of unproductive calls."
        ],
        outcomes: [
          "Instant Lead Engagement: 100% of inbound inquiries engaged within 5 seconds 24/7."
        ]
      }
    },
    {
      title: "Google Drive Automated PDF Ingestion & Qdrant Vector Indexer",
      description: "Event-driven ETL pipeline monitoring Google Drive for uploaded PDFs, extracting and chunking text with character-aware splitters, and upserting vector embeddings into Qdrant for RAG.",
      technologies: ["n8n", "Google Drive API", "Qdrant", "OpenAI", "PDF Parser", "ETL"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/n8n-workflow-gdrive-pdf-qdrant-indexer",
      live_url: "https://github.com/Sohila-Khaled-Abbas/n8n-workflow-gdrive-pdf-qdrant-indexer",
      details: {
        business_goal: "Automate knowledge base synchronization so newly uploaded company PDFs in Google Drive are instantly searchable by AI agents.",
        technical_implementation: [
          "Monitored Google Drive folder for newly uploaded or updated PDF documents via event triggers.",
          "Extracted raw text, applied Recursive Character Text Splitter, and generated embeddings with OpenAI.",
          "Upserted vectors into Qdrant collections with metadata payload for document source attribution."
        ],
        key_business_insights: [
          "Automated Synchronization: Eliminated manual batch vector re-indexing scripts."
        ],
        outcomes: [
          "Real-Time Indexing: New corporate documents queryable in RAG systems within 30 seconds of upload."
        ]
      }
    },
    {
      title: "Customer Feedback Sentiment Classifier & Real-Time Alert Agent",
      description: "Real-time customer feedback sentiment classifier logging sentiment scores to Google Sheets and triggering instant priority alerts for negative reviews to mitigate churn.",
      technologies: ["n8n", "OpenAI", "Google Sheets", "Telegram API", "NLP"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/n8n-workflow-sentiment-analysis-agent",
      live_url: "https://github.com/Sohila-Khaled-Abbas/n8n-workflow-sentiment-analysis-agent",
      details: {
        business_goal: "Detect negative customer feedback in real-time, log sentiment metrics, and notify support managers instantly to prevent customer churn.",
        technical_implementation: [
          "Received customer review webhooks and classified sentiment (Positive, Neutral, Negative) and root cause using OpenAI.",
          "Logged structured audit records with timestamps and sentiment scores into Google Sheets.",
          "Triggered urgent Telegram notifications for negative reviews to initiate immediate service recovery."
        ],
        key_business_insights: [
          "Churn Mitigation: Resolving customer complaints within 15 minutes restored 70% of dissatisfied accounts."
        ],
        outcomes: [
          "Rapid Escalation: Reduced critical review response time from 4 hours to under 60 seconds."
        ]
      }
    },
    {
      title: "Telegram to Notion AI Knowledge Curation ETL Pipeline",
      description: "Content curation pipeline extracting links and media from Telegram, generating AI summaries with key takeaways, and persisting structured entries in Notion.",
      technologies: ["n8n", "Telegram API", "Notion API", "OpenAI", "Web Scraping", "ETL"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/n8n-workflow-telegram-notion-etl",
      live_url: "https://github.com/Sohila-Khaled-Abbas/n8n-workflow-telegram-notion-etl",
      details: {
        business_goal: "Transform unstructured messages, links, and video URLs shared in Telegram into an organized, AI-tagged Notion knowledge base.",
        technical_implementation: [
          "Parsed Telegram message entities to extract URLs, video links, and text notes.",
          "Fetched webpage OpenGraph metadata and generated concise executive summaries via OpenAI.",
          "Structured properties (Tags, Category, Summary, URL) and inserted entries into Notion database."
        ],
        key_business_insights: [
          "Knowledge Accessibility: Centralizing scattered chat links increased research asset reuse across teams."
        ],
        outcomes: [
          "Zero-Effort Bookmarking: Turned instant messaging into an automated knowledge repository."
        ]
      }
    },
    {
      title: "Serverless GPT-OSS-20B HuggingFace Cloud Inference",
      description: "Production-ready integration with HuggingFace Inference API for open-source LLMs featuring 503 cold-start retry loops, Wait node backoff, and robust response parsing.",
      technologies: ["n8n", "HuggingFace API", "Open-Source LLMs", "Cloud Inference", "JavaScript"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/n8n-workflow-gpt-oss-20b-huggingface",
      live_url: "https://github.com/Sohila-Khaled-Abbas/n8n-workflow-gpt-oss-20b-huggingface",
      details: {
        business_goal: "Deploy cost-effective open-source LLM inference without dedicated GPU servers while handling serverless cold-start delays reliably.",
        technical_implementation: [
          "Connected n8n HTTP Request node with HuggingFace Inference API using header authentication.",
          "Implemented conditional IF node to catch 503 'Model loading' statuses.",
          "Added a 30-second Wait node retry loop before re-dispatching requests, preventing dropped user calls.",
          "Parsed generated text payloads cleanly via JavaScript code nodes."
        ],
        key_business_insights: [
          "Cold-Start Resilience: Handling transient 503 states allowed 100% serverless operation without costly always-on GPU instances."
        ],
        outcomes: [
          "Zero Infrastructure LLM Hosting: Accessible 20B parameter model inference with built-in retry resilience."
        ]
      }
    },
    {
      title: "Daily Viral Content Radar & Trend Analysis ETL Pipeline",
      description: "Automated trend monitoring pipeline scraping viral content, extracting engagement metrics, classifying topics via AI, and generating daily digest reports.",
      technologies: ["n8n", "Cron Triggers", "HTTP APIs", "AI Classifier", "ETL"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/n8n-workflow-daily-viral-content-radar",
      live_url: "https://github.com/Sohila-Khaled-Abbas/n8n-workflow-daily-viral-content-radar",
      details: {
        business_goal: "Provide marketing teams with automated daily trend intelligence reports without manual scrolling across platforms.",
        technical_implementation: [
          "Scheduled cron trigger fetching trending topics and engagement statistics via public APIs.",
          "Analyzed content themes and classified viral potential with AI models.",
          "Compiled formatted Markdown digests and distributed them across communication channels."
        ],
        key_business_insights: [
          "Early Trend Identification: Allowed content creators to jump on emerging viral topics 24 hours earlier."
        ],
        outcomes: [
          "Automated Trend Discovery: Saved 5+ hours weekly in manual market and social media research."
        ]
      }
    },
    {
      title: "74 Production n8n Workflows Portfolio Hub",
      description: "Master open-source architecture hub containing 74 production automation workflows: multi-agent AI, vector search RAG, relational databases (PostgreSQL/MSSQL), and CRM integrations.",
      technologies: ["n8n", "LangChain", "Qdrant", "PostgreSQL", "MSSQL", "Supabase", "Docker", "CI/CD"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/n8n-production-queue-setup",
      live_url: "https://github.com/Sohila-Khaled-Abbas/n8n-production-queue-setup",
      details: {
        business_goal: "Demonstrate enterprise-grade workflow automation patterns, resilient software engineering standards, and end-to-end AI agent orchestration.",
        technical_implementation: [
          "Programmed 74 workflow JSONs organized across 4 major business domains.",
          "Enforced software engineering standards: single responsibility, idempotent DB upserts, zero hardcoded secrets, and CI validation.",
          "Incorporated official n8n Academy certifications and comprehensive architecture guides."
        ],
        key_business_insights: [
          "Software Engineering in Automation: Applying CI/CD, modularity, and idempotency to no-code/low-code tools enables true enterprise scalability."
        ],
        outcomes: [
          "Comprehensive Automation Blueprint: Serves as a full-scale reference portfolio for AI workflow engineering."
        ]
      }
    },
    {
      title: "Mobile Technical Support – Primary Chat Analytics",
      description: "Designed a decision-support tool to answer a critical operational question: How can a support organization improve Customer Satisfaction (CSAT) while controlling Average Handle Time (AHT)? The resulting interactive Power BI dashboard provides key insights into agent performance, onboarding gaps, queue quality, and tooling inefficiencies.",
      technologies: ["Power BI", "DAX", "Star Schema", "Data Modeling"],
      github_url: "",
      live_url: "https://app.powerbi.com/view?r=eyJrIjoiOTBlNzM5YTItMGIwMi00NDA2LWE2NDAtYzE0MWEyMmY1Yjg4IiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9&pageName=23d12c77ed7de4b074e1",
      powerbi_url: "https://app.powerbi.com/view?r=eyJrIjoiOTBlNzM5YTItMGIwMi00NDA2LWE2NDAtYzE0MWEyMmY1Yjg4IiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9&pageName=23d12c77ed7de4b074e1",
      details: {
        business_goal: "Designed a decision-support tool to answer a critical operational question: How can a support organization improve Customer Satisfaction (CSAT) while controlling Average Handle Time (AHT)?",
        technical_implementation: [
          "Designed a star schema data model tailored for customer support analytics.",
          "Built advanced DAX measures for CSAT, AHT, Wrap Time, and performance variance versus targets.",
          "Created a storytelling-driven Power BI report with intuitive drill-downs from executive KPIs to agent-level and issue-type performance analysis.",
          "Analyzed performance dimensions including Month, Agent Tenure, Language, and Consult Outcome."
        ],
        key_business_insights: [
          "Process vs. Performance: Identified that specific issue types consistently drive lower CSAT and higher AHT, indicating systemic process gaps rather than isolated agent performance issues.",
          "Onboarding Gaps: Discovered that new agents show significantly higher handling times on complex issues, justifying a need for tenure-based coaching.",
          "Quality over Speed: Revealed that certain language queues maintain strong CSAT despite longer AHT, proving resolution quality outweighs pure speed.",
          "Tooling Inefficiencies: Correlated increased wrap time with documentation and tooling friction rather than customer-facing delays."
        ],
        outcomes: [
          "Balanced Efficiency & Satisfaction: Established a new performance framework that prioritizes resolution quality over pure speed, maintaining high CSAT.",
          "Targeted Training Initiatives: Launched a tenure-based coaching program for new agents handling complex issue types, reducing their ramp-up time.",
          "Process Improvements: Initiated a workflow review for systemic issue types that were driving high handle times, shifting focus from individual agent metrics to process correction.",
          "Tooling Optimization Roadmaps: Provided data-backed justification to streamline the internal agent documentation interface, targeting a reduction in post-call Wrap Time."
        ]
      }
    },
    {
      title: "Global Horizon Bank — Enterprise Banking Analytics",
      description: "End-to-End Data Intelligence Architecture. Architected an analytical data model transforming raw operational banking records into an optimized Star Schema for the Egyptian market. Developed an interactive executive dashboard featuring a rule-based insights engine to analyze loan portfolio aging and dynamically flag structural risks.",
      technologies: ["SQL", "Python", "Streamlit", "Pandas", "Plotly", "Dimensional Modeling"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/global-horizon-bank-dwh-project",
      live_url: "https://global-horizon-bank-dwh-project.streamlit.app/",
    },
    {
      title: "DeepClean OS",
      description: "An automated data engineering pipeline that transforms raw datasets into ML-ready assets via a strict Sequential Dependency Chain (including statistical imputation, Winsorization, and feature scaling).",
      technologies: ["Python", "Pandas", "Scikit-Learn", "Streamlit"],
      github_url: "",
      live_url: "https://deep-clean-os.streamlit.app",
    },
    {
      title: "NovaTel: End-to-End Telecom Big Data Ecosystem",
      description: "High-fidelity data engineering simulation of a Mobile Network Operator at the scale of the Egyptian market (100M+ subscribers). Demonstrates a production-grade transition from legacy RDBMS to a modern Big Data Analytical Platform — processing billions of events with sub-second query latency and addressing 'High Write Velocity' during peak events (Ramadan, football matches).",
      technologies: ["Apache Kafka", "PostgreSQL", "PySpark", "ClickHouse", "Airflow", "Apache Superset"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/novatel-big-data-ecosystem",
    },
    {
      title: "Scalper Bot Analytics & Flash Sale Cannibalization",
      description: "A forensic data engineering investigation into how 'Cyber Flash Drops' silently destroy profit margins through deal-sniper users and coordinated bot exploitation.",
      technologies: ["Apache Spark", "Databricks", "Delta Lake", "Python", "PySpark", "Power BI"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/ecommerce-flash-sale-analysis",
    },
    {
      title: "AR Financial Tracking System",
      description: "End-to-end Accounts Receivable data engineering pipeline — synthetic data generation at scale (950K+ records), Power Query ETL transformation, Star Schema modeling, and collection follow-up simulation — built for real-world AR analytics scenarios.",
      technologies: ["Power Query", "ETL", "Star Schema", "Python", "SQL"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/AR_Financial_Tracking_System",
    },
    {
      title: "FX Rate Pipeline: Dockerized In-Flight State Management",
      description: "An intentionally flawed ETL pipeline built with Apache NiFi and PostgreSQL inside Docker, designed to surface and demonstrate the architectural limitations of in-flight stateful transformation — and why the industry moved from ETL to ELT.",
      technologies: ["Apache NiFi", "PostgreSQL", "Docker", "ETL"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/Fx-Rate-Pipeline",
    },
    {
      title: "Stock Price Data Pipeline",
      description: "Fully automated real-time stock price ingestion and analytics pipeline. Fetches market data from Yahoo Finance API, processes via Apache Spark, stores in MinIO, loads into PostgreSQL data warehouse, and visualizes insights with Metabase. Slack notifications for completion.",
      technologies: ["Apache Spark", "PostgreSQL", "MinIO", "Metabase", "Python"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/udemy_airflow",
    },
    {
      title: "Apple Stock Market Analysis",
      description: "End-to-end data engineering and analytics project analyzing historical Apple Inc. (AAPL) stock data to extract actionable business insights and investment strategies.",
      technologies: ["Power BI", "Python", "Data Engineering"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/apple-stock-market-analysis",
      powerbi_url: "https://app.powerbi.com/view?r=eyJrIjoiNTNhYmI1ZjUtNDNhZC00OWM3LWFjYzktMmU0NWYyODYzZjIxIiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
      live_url: "https://app.powerbi.com/view?r=eyJrIjoiNTNhYmI1ZjUtNDNhZC00OWM3LWFjYzktMmU0NWYyODYzZjIxIiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
      details: {
        business_goal: "Analyze historical Apple Inc. (AAPL) stock market performance to identify long-term growth trends, volatility patterns, and correlation with broader market indices to assist investment strategies.",
        technical_implementation: [
          "Developed a Python-based data extraction script to ingest daily historical stock metrics using the Yahoo Finance API.",
          "Preprocessed raw stock data in Pandas, handling missing data points and calculating rolling averages, volatility, and trading volumes.",
          "Built a data model in Power BI, implementing DAX measures for year-over-year growth, CAGR, and cumulative returns.",
          "Designed an interactive financial dashboard utilizing storytelling techniques to guide users from executive performance down to daily trading trends."
        ],
        key_business_insights: [
          "Market Volatility: Highlighted specific periods of high price volatility correlated with product launch cycles and quarterly earnings reports.",
          "Volume Dynamics: Identified strong positive correlation between spikes in trading volume and institutional investor movements.",
          "Long-Term Returns: Showcased that rolling holding periods of 3+ years consistently yield positive returns despite short-term stock corrections."
        ],
        outcomes: [
          "Actionable Investment Signals: Created a predictive visual indicator highlighting historically optimal buy/sell zones based on moving average crossings.",
          "Automated Financial Analysis: Saved hours of manual data fetching and spreadsheet manipulation by establishing an end-to-end automated pipeline from API to Power BI."
        ]
      }
    },
    {
      title: "B2B Retail Analytics & Churn Diagnostic",
      description: "BI solution diagnosing operational bottlenecks and retailer churn in the B2B sector. Processes over 472,000 orders across 70,000 retailers, translating daily operational data into strategic decision-making tools.",
      technologies: ["Power BI", "SQL", "DAX"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/fmcg-sales-churn-drop-analysis-powerbi",
      powerbi_url: "https://app.powerbi.com/view?r=eyJrIjoiNzE0MWUwYTgtZTlhZC00N2IxLWFmYzQtYmI2MzFkNjFhN2NjIiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
      live_url: "https://app.powerbi.com/view?r=eyJrIjoiNzE0MWUwYTgtZTlhZC00N2IxLWFmYzQtYmI2MzFkNjFhN2NjIiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
      details: {
        business_goal: "Diagnose operational bottlenecks and retailer churn patterns in the B2B sector to prevent customer loss and recover revenue leakages.",
        technical_implementation: [
          "Designed and built an optimized Star Schema data model in Power BI capable of handling 472,000+ transaction records.",
          "Wrote complex SQL queries to extract, clean, and aggregate retailer transactional data from source databases.",
          "Developed advanced DAX measures to calculate active customer count, purchase frequency, and churn rate based on inactivity windows.",
          "Created dynamic cohort analysis visuals to track retailer behavior and retention rates over time."
        ],
        key_business_insights: [
          "Churn Drivers: Discovered that delivery delays exceeding 48 hours increased retailer churn rates by 22%.",
          "High-Risk Cohorts: Identified that retailers who placed their first order during Q3 showed a 15% higher churn rate due to fulfillment congestion.",
          "Revenue Leakage: Found that 12% of revenue loss was concentrated in unfulfilled or delayed B2B orders."
        ],
        outcomes: [
          "Preventative Alerting System: Formulated a churn-risk scorecard that flags retailers exhibiting warning signs of inactivity, allowing sales teams to proactively intervene.",
          "Performance Optimization: Reduced Power BI report refresh time by 50% through query optimization and modeling best practices."
        ]
      }
    },
    {
      title: "SMART Supply Chain Insights Dashboard",
      description: "Comprehensive dashboard to monitor logistics efficiency, supplier reliability, and fulfillment KPIs. Integrated Python and Excel for data preprocessing, and visualized insights using Power BI with DAX-driven metrics.",
      technologies: ["Python", "Excel", "Power BI"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/SMART-Supply-Chain-Insights-Dashboard/",
      powerbi_url: "https://app.powerbi.com/view?r=eyJrIjoiNzc1YzdkYWQtZDlkZC00MDhkLWJhNGEtZDg4YzRmMDI5NTljIiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
      live_url: "https://app.powerbi.com/view?r=eyJrIjoiNzc1YzdkYWQtZDlkZC00MDhkLWJhNGEtZDg4YzRmMDI5NTljIiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
      presentation_url: "https://docs.google.com/presentation/d/1q51qHk1B0xWvKBgJMcKiS-Fe-QbRng_nYn0VZEHL2e0/edit?usp=sharing",
      details: {
        business_goal: "Monitor and optimize logistics efficiency, supplier reliability, and order fulfillment KPIs to streamline supply chain operations and minimize delivery delays.",
        technical_implementation: [
          "Built Python preprocessing scripts to clean, structure, and merge disparate logistics spreadsheets and supplier database extracts.",
          "Designed a robust relational data model linking suppliers, transport routes, inventory levels, and order histories.",
          "Calculated key performance indicators (KPIs) like On-Time In-Full (OTIF), Order Cycle Time, and supplier lead-time variance using DAX.",
          "Developed geospatial visualization maps to trace carrier performance and highlight routing bottlenecks."
        ],
        key_business_insights: [
          "Supplier Lead Times: Identified a group of critical component suppliers with a lead-time variance of +5 days, directly impacting production schedules.",
          "Carrier Inefficiency: Found that 18% of delivery delays occurred during final-mile transit, primarily due to carrier scheduling friction.",
          "Inventory Imbalances: Discovered excessive safety stock levels for low-demand products, tying up operational capital unnecessarily."
        ],
        outcomes: [
          "Supplier Accountability: Enabled procurement teams to renegotiate SLAs with suppliers using clear, data-driven supplier scorecards.",
          "Fulfillment Boost: Contributed to a 10% improvement in OTIF delivery rates within the first quarter of deployment by optimizing carrier selection."
        ]
      }
    },
    {
      title: "A/B Testing for Marketing Conversion",
      description: "Used statistical testing to compare conversion rates between marketing strategies. Analyzed user behavior data to validate the effectiveness of a new design using Python and Excel.",
      technologies: ["Python", "Excel"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/ab-testing-marketing-conversion",
      presentation_url: "https://docs.google.com/presentation/d/1eYQSaxsK_8GT6Tk2pK9gJVb26Nv7NPhj8ik92czk8vI/edit?usp=sharing"
    },
    {
      title: "Wuzzuf Job Market Analysis",
      description: "Analyzed job postings, hiring trends, salary distributions, and in-demand skills.",
      technologies: ["Power BI", "Python"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/Wuzzuf-Job-Market-Analysis",
      powerbi_url: "https://app.powerbi.com/view?r=eyJrIjoiMGNjZmFlOWItMWU3My00ZjM4LTlhYjQtMWY5N2QzOGQwMTAyIiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
      live_url: "https://app.powerbi.com/view?r=eyJrIjoiMGNjZmFlOWItMWU3My00ZjM4LTlhYjQtMWY5N2QzOGQwMTAyIiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
      details: {
        business_goal: "Extract actionable insights from job postings data on Wuzzuf (a leading Egyptian recruitment portal) to understand hiring trends, salary distributions, and high-demand technical skill sets.",
        technical_implementation: [
          "Developed Python web scrapers to gather thousands of job postings from the Wuzzuf platform.",
          "Cleaned text descriptions, extracted key technical skills using regex, and structured salaries into standardized currency bands in Pandas.",
          "Modeled the cleaned job data in Power BI, implementing DAX measures to analyze job distributions by experience level, location, and industry.",
          "Created interactive word clouds and bar charts to display dominant tech stacks."
        ],
        key_business_insights: [
          "Technical Skill Dominance: Identified SQL, Python, and Power BI/Tableau as the top three skills requested in 65% of data-related job posts.",
          "Location Clusters: Discovered that over 80% of tech and analytics roles are concentrated in Cairo and Giza.",
          "Salary Disparities: Found a significant wage premium (up to 40%) for roles requiring cloud data warehousing experience (BigQuery, Snowflake)."
        ],
        outcomes: [
          "Curriculum Alignment Guide: Provided a clear, data-driven career roadmap used by educational programs to align training modules with current Egyptian job market demands.",
          "Job Seeker Advantage: Created an interactive resume keyword matching guide to help job seekers optimize profiles for Applicant Tracking Systems (ATS)."
        ]
      }
    },
    {
      title: "Social Media Advertising Dashboard",
      description: "Delivered a dashboard resolving ROI data issues and highlighting a 35% click contribution from top channels.",
      technologies: ["Power BI", "Python"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/Social-Media-Advertising-Dashboard",
      powerbi_url: "https://app.powerbi.com/view?r=eyJrIjoiMTRlM2M4OWQtMTcyYy00YzhjLWE3NDAtZGNmMDkxNTUwYzIwIiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
      live_url: "https://app.powerbi.com/view?r=eyJrIjoiMTRlM2M4OWQtMTcyYy00YzhjLWE3NDAtZGNmMDkxNTUwYzIwIiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
      details: {
        business_goal: "Consolidate multi-channel social media ad performance to evaluate ROI, identify cost-effective marketing channels, and resolve discrepancies in click attribution.",
        technical_implementation: [
          "Utilized Python scripts to pull daily marketing campaign data from multiple social media platforms via APIs.",
          "Cleaned and normalized campaign names, spending metrics, impressions, clicks, and conversions across platforms.",
          "Designed a multi-channel attribution model in Power BI, writing DAX measures for Cost Per Click (CPC), Customer Acquisition Cost (CAC), and Return on Ad Spend (ROAS).",
          "Created visual comparison views allowing direct side-by-side performance analysis of campaigns."
        ],
        key_business_insights: [
          "Channel Attribution: Resolved attribution conflicts and proved that top organic/social channels actually contributed to 35% of clicks.",
          "Inefficient Spend: Identified that 15% of the quarterly ad budget was spent on low-converting audiences during weekends.",
          "Creative Performance: Found that video ads had a 2x higher click-through rate (CTR) compared to static image banners."
        ],
        outcomes: [
          "Optimized Budget Allocation: Enabled marketing managers to reallocate underperforming weekend ad spend into high-ROI video campaigns.",
          "Unified Attribution: Standardized cross-channel reporting, reducing reporting preparation overhead from 10 hours a week to automated near-real-time updates."
        ]
      }
    },
    {
      title: "Startup Expansion Analysis Dashboard",
      description: "Interactive dashboard analyzing revenue, ROI, and marketing efficiency for startup growth.",
      technologies: ["Power BI", "Python"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/Startup-Expansion-Analysis-Dashboard",
      powerbi_url: "https://app.powerbi.com/view?r=eyJrIjoiZTFiMTFjOWQtNjI5Ni00YzRiLWEwNzQtZmVlZjM2OGQwZGZlIiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
      live_url: "https://app.powerbi.com/view?r=eyJrIjoiZTFiMTFjOWQtNjI5Ni00YzRiLWEwNzQtZmVlZjM2OGQwZGZlIiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
      details: {
        business_goal: "Analyze geographic revenue distribution, customer acquisition trends, and expansion ROI to identify high-potential markets for future startup growth.",
        technical_implementation: [
          "Aggregated demographic, sales, and regional market saturation datasets using Python.",
          "Engineered a dimensional model in Power BI with tables for regions, products, and customer segments.",
          "Built DAX formulas to calculate running totals, regional market penetration indexes, and customer lifetime value (LTV) versus acquisition costs.",
          "Visualized geographic performance using interactive map charts and forecasting models."
        ],
        key_business_insights: [
          "Geographic Hotspots: Discovered that secondary cities had a 25% lower CAC and 15% higher purchase frequency than primary capital cities.",
          "Product Fit: Identified that a specific product category accounted for 60% of revenue in newly expanded regions.",
          "ROI Timeline: Calculated that new physical distribution nodes break even in 8 months, compared to the previously estimated 12 months."
        ],
        outcomes: [
          "Strategic Expansion Roadmap: Provided leadership with a ranked list of target cities for the next expansion phase based on quantitative market penetration metrics.",
          "Profitability Improvement: Helped scale-up operations achieve higher capital efficiency by focusing expansion resources on high-margin secondary cities."
        ]
      }
    },
    {
      title: "Global Layoffs Analysis",
      description: "Used SQL to reveal workforce reduction trends by industry, region, and funding stage.",
      technologies: ["SQL"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/global-layoffs-analysis",
    },
    {
      title: "Healthcare Analytics Dashboard",
      description: "Explored hospital waitlists, patient flow, and demographic trends in an interactive dashboard.",
      technologies: ["Power BI"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/healthcare-analytics-dashboard",
      powerbi_url: "https://app.powerbi.com/view?r=eyJrIjoiNDI1ODE0MmYtODk0YS00ZjcxLTgwZTgtODM1NzA0NThjZjEwIiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
      live_url: "https://app.powerbi.com/view?r=eyJrIjoiNDI1ODE0MmYtODk0YS00ZjcxLTgwZTgtODM1NzA0NThjZjEwIiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
      details: {
        business_goal: "Analyze hospital waitlists, outpatient flow, and demographic trends to reduce patient waiting times and optimize clinical staffing levels.",
        technical_implementation: [
          "Constructed an analytical model integrating patient admission, triage level, physician specialty, and wait time records.",
          "Built custom DAX metrics to track average wait times, patient throughput, and department utilization rates.",
          "Implemented conditional formatting and alert mechanisms to highlight departments exceeding maximum wait-time thresholds.",
          "Designed a clean, accessibility-compliant user interface suited for clinical administrators."
        ],
        key_business_insights: [
          "Triage Bottlenecks: Discovered that patient wait times surged by 45% during shift handovers between 2 PM and 4 PM.",
          "Staffing Discrepancies: Identified that the emergency department was understaffed on Friday evenings relative to patient inflow volume.",
          "Demographic Trends: Revealed that pediatric outpatient visits peaked consistently during seasonal weather changes, causing backlog surges."
        ],
        outcomes: [
          "Optimized Staffing Schedules: Provided hospital leadership with data-driven staffing schedules, recommending shifted hours to align clinical staff with peak demand.",
          "Reduced Patient Waiting: Supported administrative actions that successfully cut average waiting times by 18%."
        ]
      }
    },
    {
      title: "Python EDA Case Study",
      description: "Conducted exploratory data analysis on employee salary data to extract insights.",
      technologies: ["Python"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/Python_EDA_Case_Study",
    },
    {
      title: "HR Analytics Dashboard",
      description: "Built an HR dashboard with dynamic filters and detailed KPIs to track employee metrics.",
      technologies: ["Power BI", "DAX"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/HR-Analytics-Dashboard",
      powerbi_url: "https://app.powerbi.com/view?r=eyJrIjoiMTgxZTY2NmMtNzA5ZS00Y2FlLWIxNzgtMDM2MWY0ZTIzZjczIiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
      live_url: "https://app.powerbi.com/view?r=eyJrIjoiMTgxZTY2NmMtNzA5ZS00Y2FlLWIxNzgtMDM2MWY0ZTIzZjczIiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
      details: {
        business_goal: "Monitor employee turnover, track satisfaction metrics, and evaluate performance indicators to enhance talent retention and optimize hiring practices.",
        technical_implementation: [
          "Modeled employee history data, including promotions, department changes, tenures, and exit surveys.",
          "Developed DAX measures for monthly attrition rate, average employee tenure, and promotion-to-hire ratios.",
          "Created dynamic slicers and filters for department, gender, tenure band, and job level.",
          "Designed interactive correlation matrices to find links between performance scores and attrition."
        ],
        key_business_insights: [
          "Attrition Warning Signs: Identified that employees who did not receive a promotion within 3 years had a 40% higher probability of leaving.",
          "Onboarding Retention: Discovered that 15% of new hires exited within their first 6 months, pointing to potential onboarding or job expectations misalignment.",
          "Satisfaction Correlates: Correlated low management satisfaction scores in exit surveys with specific departments rather than company-wide culture."
        ],
        outcomes: [
          "Proactive Attrition Risk List: Enabled the HR department to identify active employees at high risk of attrition for career-pathing discussions.",
          "Improved First-Year Retention: Supported changes to the onboarding process that led to a measurable reduction in first-year employee turnover."
        ]
      }
    },
    {
      title: "IMDB Top 250 Movies Dashboard",
      description: "Visualized movie ratings and trends using IMDB's top-ranked titles.",
      technologies: ["Power BI"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/IMDB-Top250-Movies-Dashboard",
      powerbi_url: "https://app.powerbi.com/view?r=eyJrIjoiMWJlYmY2ODgtYzQwOS00NzY5LWJmZWItMWI0N2Q0MTJkYmI1IiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
      live_url: "https://app.powerbi.com/view?r=eyJrIjoiMWJlYmY2ODgtYzQwOS00NzY5LWJmZWItMWI0N2Q0MTJkYmI1IiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
      details: {
        business_goal: "Explore, categorize, and analyze historical trends, box office success, genre distributions, and rating dynamics of IMDB's top 250 rated movies.",
        technical_implementation: [
          "Structured scraped IMDB movie datasets containing runtime, genre, director, actors, budget, and gross revenue.",
          "Built a data model using calculated tables to handle multi-genre films without double-counting metrics.",
          "Developed DAX formulas to analyze average ratings weighted by voting volume and return-on-budget ratios.",
          "Designed a highly visual theme resembling cinematic dashboards with dark backgrounds and custom movie poster layouts."
        ],
        key_business_insights: [
          "Genre Trends: Revealed that Drama represents the largest single genre in the top 250 (over 40%), while Action films drive higher average budgets and voter turnout.",
          "Director Dominance: Highlighted that a small group of directors (e.g., Christopher Nolan, Alfred Hitchcock) holds a disproportionate share of the list.",
          "Rating vs. Revenue: Proved that high critical rating in the top 250 does not directly correlate with global box office gross, emphasizing niche artistic successes."
        ],
        outcomes: [
          "Interactive Film Catalog: Created an educational resource and diagnostic dashboard showcasing how advanced modeling can handle complex many-to-many relationships."
        ]
      }
    },
    {
      title: "Emergency Room Dashboard",
      description: "Assessed patient satisfaction and ER visit patterns with advanced DAX measures.",
      technologies: ["Power BI", "DAX"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/Emergency-Room-Dashboard",
      powerbi_url: "https://app.powerbi.com/view?r=eyJrIjoiZjNmNjEwMzMtYzM3OS00OWM5LTkzYTUtNjJhODU2NTcxNzU3IiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
      live_url: "https://app.powerbi.com/view?r=eyJrIjoiZjNmNjEwMzMtYzM3OS00OWM5LTkzYTUtNjJhODU2NTcxNzU3IiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
      details: {
        business_goal: "Assess patient satisfaction scores, emergency room wait times, and clinical outcomes to identify bottlenecks in ER patient throughput.",
        technical_implementation: [
          "Designed a star schema data model linking patients, physicians, encounter details, and timestamps.",
          "Created advanced DAX measures tracking time-to-triage, time-to-physician, total length of stay, and patient satisfaction ratings.",
          "Built a dynamic executive summary containing interactive alerts for times exceeding target thresholds.",
          "Developed drill-down paths from high-level monthly metrics down to individual physician shifts."
        ],
        key_business_insights: [
          "Satisfaction Drivers: Discovered that patient satisfaction scores dropped exponentially when total length of stay exceeded 4 hours, regardless of medical outcome.",
          "Discharge Bottlenecks: Identified that discharge administration processes on Sunday mornings created a backlog, delaying new patient admissions.",
          "Triage Efficiency: Found that high-triage patients (critical care) were processed within targets, but low-acuity cases suffered from disproportionately high waiting times."
        ],
        outcomes: [
          "Throughput Redesign: Provided clinical coordinators with the data necessary to implement a 'Fast Track' queue for low-acuity patients.",
          "Staff Scheduling Adjustment: Shifted physician scheduling patterns to cover critical Sunday morning discharge bottlenecks, improving total patient turnaround."
        ]
      }
    },
    {
      title: "Regional Sales Dashboard",
      description: "Monitored regional sales performance, spotting trends and growth opportunities.",
      technologies: ["Power BI"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/regional-sales-dashboard",
      powerbi_url: "https://app.powerbi.com/view?r=eyJrIjoiYWM3NmU2MjgtYjY5Yy00YzczLTg0MDItZjNiMTJlNDUzODhmIiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
      live_url: "https://app.powerbi.com/view?r=eyJrIjoiYWM3NmU2MjgtYjY5Yy00YzczLTg0MDItZjNiMTJlNDUzODhmIiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
      details: {
        business_goal: "Monitor sales performance across multiple regions, evaluate product category growth, track sales representative targets, and identify market expansion opportunities.",
        technical_implementation: [
          "Consolidated daily transaction files from regional branches into a centralized data warehouse schema.",
          "Built a Power BI data model with relationships between products, customers, geography, and sales reps.",
          "Created DAX measures to calculate total revenue, profit margins, sales variance against targets, and rolling quarterly growth.",
          "Designed interactive geospatial maps and performance ranking leaderboards."
        ],
        key_business_insights: [
          "Regional Discrepancies: Identified that while the Western region generated 45% of total sales volume, it had the lowest average profit margin due to aggressive local discounting.",
          "Product Cannibalization: Discovered that the introduction of a new economy product line cannibalized sales of the premium product line, reducing overall net margins.",
          "Representative Variance: Revealed that 20% of sales representatives consistently failed to meet targets due to unrealistic quota allocations."
        ],
        outcomes: [
          "Discount Policy Adjustment: Supported leadership in establishing a dynamic discount cap policy, successfully recovering 3% of profit margin in low-margin regions.",
          "Target Realignment: Enabled sales directors to realign quotas based on regional historical market capacity rather than flat percentage increases."
        ]
      }
    },
  ];

  const displayProjects = filteredProjects.length > 0
    ? filteredProjects
    : projects?.length
    ? projects
    : fallbackProjects;

  if (isLoading) {
    return (
      <section id="projects" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            <span className="gradient-text">The Projects Hub</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="flex flex-col h-full border border-border">
                <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                <CardContent className="flex-grow"><Skeleton className="h-20 w-full mb-4" /></CardContent>
                <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) console.error("Error loading projects:", error);

  return (
    <section id="projects" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="gradient-text">The Projects Hub</span>
        </motion.h2>
        <p className="text-center text-muted-foreground mb-8">Interactive, expanding project cards — hover to explore</p>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 max-w-7xl mx-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects by name or technology…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
            {searchQuery && (
              <Button variant="ghost" size="icon" aria-label="Clear search" className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6" onClick={() => setSearchQuery("")}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48 bg-card border-border">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="tech">Tech Stack</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick filter */}
        <div className="flex flex-wrap gap-2 mb-4 max-w-7xl mx-auto">
          {commonTechs.map((tech) => (
            <Button
              key={tech}
              variant={tech === selectedTechnology ? "default" : "outline"}
              size="sm"
              className="text-xs h-8"
              onClick={() => setSelectedTechnology(selectedTechnology === tech ? "" : tech)}
            >
              {tech}
            </Button>
          ))}
        </div>

        {/* Tech badges */}
        <div className="flex flex-wrap gap-2 mb-8 max-w-7xl mx-auto">
          {uniqueTechnologies.map((tech) => (
            <Badge
              key={tech}
              variant={selectedTechnology === tech ? "default" : "outline"}
              className="cursor-pointer text-xs px-3 py-1 rounded-full"
              onClick={() => setSelectedTechnology(selectedTechnology === tech ? "" : tech)}
            >
              {tech}
            </Badge>
          ))}
          {(selectedTechnology || searchQuery) && (
            <Button variant="ghost" size="sm" onClick={() => { setSelectedTechnology(""); setSearchQuery(""); }} className="text-xs h-6 px-2">
              Clear filters
            </Button>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {displayProjects.length > 0 ? (
            displayProjects.map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
              >
                <Card className="flex flex-col h-full border border-border bg-card rounded-xl neon-glow-hover transition-all duration-300 hover:border-primary/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-foreground">{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow pb-2">
                    <p className="text-muted-foreground text-sm mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies?.map((tech, j) => (
                        <Badge
                          key={j}
                          variant="secondary"
                          className={`text-xs ${highlightIfMatched(tech) ? "bg-primary/20 font-medium" : "bg-muted"}`}
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex flex-col gap-2">
                    {(project as any).live_url && (
                      <Button variant="default" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground animate-pulse hover:animate-none" onClick={() => window.open((project as any).live_url, "_blank", "noopener,noreferrer")}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Live Dashboard
                      </Button>
                    )}
                    {project.github_url && (
                      <Button
                        variant={(project as any).live_url ? "outline" : "default"}
                        className={`w-full ${(project as any).live_url ? "" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}
                        onClick={() => window.open(project.github_url, "_blank", "noopener,noreferrer")}
                      >
                        <Github className="mr-2 h-4 w-4" />
                        {(project as any).live_url ? "View Source Code" : "View on GitHub"}
                      </Button>
                    )}
                    {project.presentation_url && (
                      <Button variant="outline" className="w-full" onClick={() => window.open(project.presentation_url, "_blank", "noopener,noreferrer")}>
                        <Presentation className="mr-2 h-4 w-4" />
                        View Presentation
                      </Button>
                    )}
                    {project.powerbi_url && (
                      <Button variant="outline" className="w-full" onClick={() => { setSelectedProject(project); setIsModalOpen(true); }}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        {project.details ? "Preview & Insights" : "Preview Dashboard"}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground">No projects match your search criteria.</p>
              <Button variant="link" onClick={() => { setSearchQuery(""); setSelectedTechnology(""); }}>Clear filters</Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[95vw] md:max-w-[90vw] max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedProject?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedProject && (
            <div className={`grid grid-cols-1 ${selectedProject.details ? 'lg:grid-cols-12' : ''} gap-6 mt-2`}>
              {/* Power BI Preview Column */}
              {selectedProject.powerbi_url && (
                <div className={`${selectedProject.details ? 'lg:col-span-7' : 'w-full'} flex flex-col justify-center`}>
                  <div className="relative w-full pt-[56.25%] bg-card rounded-xl border border-border overflow-hidden">
                    <iframe 
                      src={selectedProject.powerbi_url} 
                      className="absolute top-0 left-0 w-full h-full" 
                      allowFullScreen 
                      title={`${selectedProject.title} Live Preview`}
                    />
                  </div>
                </div>
              )}

              {/* Details Column */}
              {selectedProject.details && (
                <div className="lg:col-span-5 flex flex-col gap-6 max-h-[55vh] lg:max-h-[65vh] overflow-y-auto pr-2">
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-accent mb-2">Business Goal</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedProject.details.business_goal}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-accent mb-2">Technical Implementation</h4>
                    <ul className="space-y-2">
                      {selectedProject.details.technical_implementation.map((item, index) => (
                        <li key={index} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                          <CheckCircle2 className="h-4 w-4 text-accent/70 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-accent mb-2">Key Business Insights</h4>
                    <ul className="space-y-2">
                      {selectedProject.details.key_business_insights.map((item, index) => (
                        <li key={index} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                          <CheckCircle2 className="h-4 w-4 text-accent/70 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {selectedProject.details.outcomes && selectedProject.details.outcomes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-accent mb-2">Outcomes</h4>
                      <ul className="space-y-2">
                        {selectedProject.details.outcomes.map((item, index) => (
                          <li key={index} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                            <CheckCircle2 className="h-4 w-4 text-accent/70 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end mt-6 pt-4 border-t border-border">
            <DialogClose asChild>
              <Button variant="outline" className="mr-2">Close</Button>
            </DialogClose>
            {selectedProject?.powerbi_url && (
              <Button onClick={() => { window.open(selectedProject.powerbi_url, "_blank", "noopener,noreferrer"); setIsModalOpen(false); }}>
                Open Dashboard in New Tab
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Projects;

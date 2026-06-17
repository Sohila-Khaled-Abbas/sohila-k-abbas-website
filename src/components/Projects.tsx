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
    },
    {
      title: "B2B Retail Analytics & Churn Diagnostic",
      description: "BI solution diagnosing operational bottlenecks and retailer churn in the B2B sector. Processes over 472,000 orders across 70,000 retailers, translating daily operational data into strategic decision-making tools.",
      technologies: ["Power BI", "SQL", "DAX"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/fmcg-sales-churn-drop-analysis-powerbi",
      powerbi_url: "https://app.powerbi.com/view?r=eyJrIjoiNzE0MWUwYTgtZTlhZC00N2IxLWFmYzQtYmI2MzFkNjFhN2NjIiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
    },
    {
      title: "SMART Supply Chain Insights Dashboard",
      description: "Comprehensive dashboard to monitor logistics efficiency, supplier reliability, and fulfillment KPIs. Integrated Python and Excel for data preprocessing, and visualized insights using Power BI with DAX-driven metrics.",
      technologies: ["Python", "Excel", "Power BI"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/SMART-Supply-Chain-Insights-Dashboard/",
      powerbi_url: "https://app.powerbi.com/view?r=eyJrIjoiNzc1YzdkYWQtZDlkZC00MDhkLWJhNGEtZDg4YzRmMDI5NTljIiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
      presentation_url: "https://docs.google.com/presentation/d/1q51qHk1B0xWvKBgJMcKiS-Fe-QbRng_nYn0VZEHL2e0/edit?usp=sharing"
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
    },
    {
      title: "Social Media Advertising Dashboard",
      description: "Delivered a dashboard resolving ROI data issues and highlighting a 35% click contribution from top channels.",
      technologies: ["Power BI", "Python"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/Social-Media-Advertising-Dashboard",
      powerbi_url: "https://app.powerbi.com/view?r=eyJrIjoiMTRlM2M4OWQtMTcyYy00YzhjLWE3NDAtZGNmMDkxNTUwYzIwIiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
    },
    {
      title: "Startup Expansion Analysis Dashboard",
      description: "Interactive dashboard analyzing revenue, ROI, and marketing efficiency for startup growth.",
      technologies: ["Power BI", "Python"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/Startup-Expansion-Analysis-Dashboard",
      powerbi_url: "https://app.powerbi.com/view?r=eyJrIjoiZTFiMTFjOWQtNjI5Ni00YzRiLWEwNzQtZmVlZjM2OGQwZGZlIiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
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
    },
    {
      title: "IMDB Top 250 Movies Dashboard",
      description: "Visualized movie ratings and trends using IMDB's top-ranked titles.",
      technologies: ["Power BI"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/IMDB-Top250-Movies-Dashboard",
      powerbi_url: "https://app.powerbi.com/view?r=eyJrIjoiMWJlYmY2ODgtYzQwOS00NzY5LWJmZWItMWI0N2Q0MTJkYmI1IiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
    },
    {
      title: "Emergency Room Dashboard",
      description: "Assessed patient satisfaction and ER visit patterns with advanced DAX measures.",
      technologies: ["Power BI", "DAX"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/Emergency-Room-Dashboard",
      powerbi_url: "https://app.powerbi.com/view?r=eyJrIjoiZjNmNjEwMzMtYzM3OS00OWM5LTkzYTUtNjJhODU2NTcxNzU3IiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
    },
    {
      title: "Regional Sales Dashboard",
      description: "Monitored regional sales performance, spotting trends and growth opportunities.",
      technologies: ["Power BI"],
      github_url: "https://github.com/Sohila-Khaled-Abbas/regional-sales-dashboard",
      powerbi_url: "https://app.powerbi.com/view?r=eyJrIjoiYWM3NmU2MjgtYjY5Yy00YzczLTg0MDItZjNiMTJlNDUzODhmIiwidCI6IjI1Y2UwMjYxLWJiZDYtNDljZC1hMWUyLTU0MjYwODg2ZDE1OSJ9",
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

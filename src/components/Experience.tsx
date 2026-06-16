import { motion } from "framer-motion";
import { Briefcase, Calendar, MapPin, Building2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const experiences = [
  {
    role: "Machine Learning Engineer (Intern)",
    company: "FlyRank AI",
    period: "Jul 2026 – Present",
    location: "Remote",
    bullets: [
      "Developed feature engineering workflows and model-ready datasets using Python, Workbench, and JupyterLab.",
      "Applied machine learning techniques alongside analytics engineering practices to improve data preparation and deployment readiness.",
      "Collaborated on integrating predictive models into broader data and BI ecosystems."
    ]
  },
  {
    role: "Data Engineer (Intern)",
    company: "Data Pill",
    period: "Mar 2026 – Present",
    location: "Remote",
    bullets: [
      "Designed ELT workflows and dimensional data models in Databricks, leveraging dbt.",
      "Engineered distributed Apache Spark pipelines to process large-scale datasets.",
      "Built enterprise ETL solutions using SSIS and Informatica.",
      "Implemented warehouse-ready data models aligned with Kimball principles."
    ]
  },
  {
    role: "Business Intelligence Developer",
    company: "Freelance",
    period: "Dec 2024 – Present",
    location: "Remote",
    bullets: [
      "Architected 10+ Power BI solutions using dimensional modeling.",
      "Automated data ingestion and ELT workflows with Python and Apache Airflow.",
      "Optimized Power BI semantic models and DAX measures, reducing refresh latency.",
      "Refactored legacy T-SQL workloads, reducing query execution times by 25%."
    ]
  },
  {
    role: "Technical Coach",
    company: "Digital Egypt Pioneers Initiative (DEPI)",
    period: "Sep 2025 – Jun 2026",
    location: "Part-Time, Remote",
    bullets: [
      "Mentored 50+ professionals in analytics solutions (SQL, Python, Power BI).",
      "Conducted 100+ technical reviews improving code quality.",
      "Guided optimization initiatives and developed frameworks for statistical interpretation."
    ]
  },
  {
    role: "Data Analytics Mentor",
    company: "Data Pill",
    period: "Jul 2025 – Apr 2026",
    location: "Part-Time, Remote",
    bullets: [
      "Reviewed and optimized SQL queries, Python workflows, and data models.",
      "Designed realistic business intelligence scenarios for learners.",
      "Coached learners on analytics engineering best practices and dimensional modeling."
    ]
  }
];

const fadeUp = (delay: number = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const }
});

const Experience = () => {
  return (
    <section id="experience" className="py-20 bg-background bg-dot-pattern">
      <div className="container max-w-4xl mx-auto px-4">
        
        {/* ── Heading ── */}
        <div className="text-center mb-12">
          <span className="section-label mb-3 inline-block">Work History</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-3">
            <span className="gradient-text">Professional Experience</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A record of engineering data systems, mentoring technical professionals, and delivering business value.
          </p>
        </div>

        {/* ── Timeline ── */}
        <div className="relative border-l border-border pl-6 md:pl-8 space-y-12 max-w-3xl mx-auto">
          {experiences.map((exp, i) => (
            <motion.div
              key={i}
              className="relative"
              {...fadeUp(i * 0.08)}
            >
              {/* Timeline node */}
              <span className="absolute -left-[39px] md:-left-[47px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-accent/70 shadow-sm">
                <Briefcase className="h-3.5 w-3.5 text-accent" />
              </span>

              <Card className="bg-card border border-border rounded-2xl neon-glow-hover gradient-border overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-xl font-bold text-foreground">{exp.role}</CardTitle>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1 font-semibold text-[hsl(var(--accent))]">
                          <Building2 className="h-4 w-4" />
                          {exp.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {exp.location}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="w-fit self-start md:self-center bg-secondary text-secondary-foreground flex items-center gap-1 font-mono text-xs px-2.5 py-1">
                      <Calendar className="h-3 w-3" />
                      {exp.period}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <ul className="space-y-3">
                    {exp.bullets.map((bullet, k) => (
                      <li key={k} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                        <CheckCircle2 className="h-4 w-4 text-accent/70 flex-shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;

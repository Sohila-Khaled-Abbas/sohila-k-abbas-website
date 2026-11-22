import { motion } from "framer-motion";
import { Briefcase, Calendar, MapPin, Building2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const experiences = [
  {
    role: "Machine Learning Engineer Intern",
    company: "FlyRank AI",
    period: "Jul 2026 – Sep 2026",
    location: "Remote",
    bullets: [
      "Queried a search-performance warehouse with approximately 79 million rows using DuckDB and SQL over Parquet data.",
      "Prepared Python features and ran machine-learning experiments with temporal and client-grouped validation.",
      "Built ranked content-refresh recommendations with an n8n workflow."
    ]
  },
  {
    role: "Freelance BI Developer",
    company: "Independent",
    period: "Dec 2024 – Present",
    location: "Remote",
    bullets: [
      "Built Power BI dashboards and decision-ready reporting across sales, retail, supply chain, e-commerce, customer satisfaction, marketing, HR, and healthcare.",
      "Prepared and validated data with Excel, SQL, and Power Query; designed semantic models, DAX measures, KPI definitions, and report handovers."
    ]
  }
];

const fadeUp = (delay: number = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const }
});

const Experience = () => (
  <section id="experience" className="py-20 bg-background bg-dot-pattern">
    <div className="container max-w-4xl mx-auto px-4">
      <div className="text-center mb-12">
        <span className="section-label mb-3 inline-block">Work History</span>
        <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-3">
          <span className="gradient-text">Professional Experience</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Freelance BI delivery and applied machine-learning engineering.
        </p>
      </div>
      <div className="relative border-l border-border pl-6 md:pl-8 space-y-12 max-w-3xl mx-auto">
        {experiences.map((exp, i) => (
          <motion.div key={i} className="relative" {...fadeUp(i * 0.08)}>
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

export default Experience;

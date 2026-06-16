import { motion } from "framer-motion";
import { ChartBar, Code, Award, Users, Zap, Database, FileText } from "lucide-react";
import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────────

interface Highlight {
  icon: ComponentType<{ className?: string }>;
  text: string;
}

// ─── Data ─────────────────────────────────────────────────────

const HIGHLIGHTS: Highlight[] = [
  {
    icon: ChartBar,
    text: "Architected 10+ interactive Power BI dashboards using star-schema modeling, reducing time-to-insight from days to minutes",
  },
  {
    icon: Code,
    text: "Reduced manual reporting overhead by 40% for 5+ clients via automated ETL pipelines using Python and SQL",
  },
  {
    icon: Award,
    text: "Top 2 Data Science Creator in Egypt (Favikon, 2026) & Top 200 Arabic-Speaking Influencer",
  },
  {
    icon: Users,
    text: "60,000+ LinkedIn followers reached via original dashboard insights and data education content",
  },
  {
    icon: Database,
    text: "Optimized query performance by 25% through refactored SQL scripts and indexing strategies for large-scale datasets",
  },
  {
    icon: Zap,
    text: "Increased project success rates by 35% for 50+ professionals through structured mentoring frameworks",
  },
];

// ─── Animation helper ─────────────────────────────────────────

const fadeUp = (delay: number) => ({
  initial:    { opacity: 0, y: 22 },
  whileInView:{ opacity: 1, y: 0  },
  viewport:   { once: true },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
});

// ─── Component ────────────────────────────────────────────────

const About = () => (
  <section id="about" className="py-20 bg-secondary/30">
    <div className="container max-w-4xl mx-auto px-4">

      {/* ── Heading ── */}
      <motion.div className="text-center mb-4" {...fadeUp(0)}>
        <span className="section-label">About Me</span>
      </motion.div>

      <motion.h2
        className="text-3xl md:text-4xl font-bold text-center mb-6"
        {...fadeUp(0.06)}
      >
        <span className="gradient-text">The Engineer Behind the Data</span>
      </motion.h2>

      {/* ── Bio ── */}
      <motion.p
        className="text-lg text-muted-foreground leading-relaxed mb-6 text-center max-w-2xl mx-auto"
        {...fadeUp(0.12)}
      >
        BI Developer specialising in end-to-end data modeling and automated ETL pipelines.
        Expert in SQL, Python, and Power BI with a focus on transforming fragmented datasets
        into scalable, decision-ready architectures. Recognised Technical Mentor for 50+
        professionals and Top 200 Arabic-speaking influencer in data literacy.
      </motion.p>

      {/* ── CV Button ── */}
      <motion.div className="flex justify-center mb-8" {...fadeUp(0.15)}>
        <Button size="lg" className="btn-cta font-semibold shadow-md" asChild>
          <a
            href="https://drive.google.com/file/d/134BGo0ox7ClojNGwiT6IKX0eZKIjjncd/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center"
          >
            <FileText className="mr-2 h-5 w-5" />
            View Resume
          </a>
        </Button>
      </motion.div>

      {/* ── Quote ── */}
      <motion.blockquote
        className="border-l-[3px] pl-5 italic text-foreground/75 my-8 max-w-2xl mx-auto text-center"
        style={{ borderColor: "hsl(var(--accent))" }}
        {...fadeUp(0.18)}
      >
        "Dashboards aren't just visuals — they're decisions waiting to happen."
      </motion.blockquote>

      {/* ── Highlights grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {HIGHLIGHTS.map((highlight, index) => (
          <motion.div
            key={index}
            className="bg-card border border-border rounded-xl p-5 flex items-start gap-4 neon-glow-hover gradient-border"
            {...fadeUp(0.08 * index)}
          >
            {/* Icon badge */}
            <div
              className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "hsl(12 52% 56% / 0.12)" }}
            >
              <highlight.icon className="h-4.5 w-4.5" style={{ color: "hsl(var(--accent))" }} />
            </div>
            <p className="text-foreground text-sm leading-relaxed">{highlight.text}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Key Recent Courses & Diplomas ── */}
      <motion.div className="mt-12 border-t border-border pt-10" {...fadeUp(0.25)}>
        <h3 className="text-xl font-bold text-center mb-6">Key Recent Courses &amp; Diplomas</h3>
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          <Badge variant="outline" className="px-3.5 py-1.5 bg-card border-border hover:border-accent text-foreground text-xs rounded-full transition-colors cursor-default">
            Data Analytics Diploma (Ahmed Ali / Friendly Analysis) — 2026
          </Badge>
          <Badge variant="outline" className="px-3.5 py-1.5 bg-card border-border hover:border-accent text-foreground text-xs rounded-full transition-colors cursor-default">
            Data Warehouse: The Ultimate Guide (Udemy) — 2026
          </Badge>
          <Badge variant="outline" className="px-3.5 py-1.5 bg-card border-border hover:border-accent text-foreground text-xs rounded-full transition-colors cursor-default">
            Build with AI: Masr Edition (ITI) — 2026
          </Badge>
          <Badge variant="outline" className="px-3.5 py-1.5 bg-card border-border hover:border-accent text-foreground text-xs rounded-full transition-colors cursor-default">
            365 Data Science / IBM / GCP / LinkedIn Learning — 2024-2025
          </Badge>
        </div>
      </motion.div>
    </div>
  </section>
);

export default About;

import { motion } from "framer-motion";
import { ChartBar, Code, Award, Users, Zap, Database } from "lucide-react";
import type { ComponentType } from "react";

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
    </div>
  </section>
);

export default About;

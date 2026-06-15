import { motion } from "framer-motion";
import { TrendingUp, Clock, Star, Quote, Linkedin, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ComponentType } from "react";

// ─── Types ────────────────────────────────────────────────────

interface Metric {
  icon:  ComponentType<{ className?: string }>;
  value: string;
  label: string;
  desc:  string;
}

interface Testimonial {
  quote:  string;
  author: string;
  role:   string;
}

// ─── Data ─────────────────────────────────────────────────────

const METRICS: Metric[] = [
  {
    icon:  TrendingUp,
    value: "200+",
    label: "Dashboard Users",
    desc:  "Explored Wuzzuf Job Market Dashboard to identify hiring trends",
  },
  {
    icon:  Clock,
    value: "40%",
    label: "Time Reduction",
    desc:  "In reporting time through Python automation",
  },
  {
    icon:  Star,
    value: "25%",
    label: "Speed Improvement",
    desc:  "In SQL data retrieval performance",
  },
];

const TESTIMONIALS: Testimonial[] = [
  {
    quote:  "Sohila doesn't just build dashboards — she builds clarity.",
    author: "Freelance Client",
    role:   "Operations Manager",
  },
  {
    quote:  "She mixes technical expertise with storytelling. That's rare.",
    author: "Peer Data Analyst",
    role:   "Senior BI Developer",
  },
];

const BOTTOM_BADGES = [
  "6+ Hours Weekly Saved",
  "40% Faster Reporting",
  "50+ Mentored",
];

// ─── Animation helper ─────────────────────────────────────────

const fadeUp = (delay: number = 0) => ({
  initial:    { opacity: 0, y: 20 },
  whileInView:{ opacity: 1, y: 0  },
  viewport:   { once: true },
  transition: { delay, duration: 0.55 },
});

// ─── Component ────────────────────────────────────────────────

const Credibility = () => (
  <section id="credibility" className="py-20 bg-secondary/30">
    <div className="container mx-auto px-4">

      {/* ── Heading ── */}
      <div className="text-center mb-12">
        <span className="section-label">Social Proof</span>
        <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-3">
          <span className="gradient-text">Trusted by the Data Community</span>
        </h2>
        <p className="text-muted-foreground">Measurable impact, community leadership, and proven results</p>
      </div>

      {/* ── Featured badges: LinkedIn + Favikon ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
        {/* LinkedIn */}
        <motion.div
          className="bg-card border border-border rounded-2xl p-8 text-center flex flex-col items-center neon-glow gradient-border gold-glow-hover"
          {...fadeUp(0)}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ background: "hsl(12 52% 56% / 0.12)" }}
          >
            <Linkedin className="h-7 w-7" style={{ color: "hsl(var(--accent))" }} />
          </div>
          <p
            className="text-5xl md:text-6xl font-extrabold font-mono tracking-tight"
            style={{ color: "hsl(var(--accent))" }}
          >
            60K+
          </p>
          <p className="text-base font-semibold text-foreground mt-2">LinkedIn Followers</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Engaging with dashboards, career tips, and Python use cases
          </p>
        </motion.div>

        {/* Favikon */}
        <motion.div
          className="bg-card border border-border rounded-2xl p-8 text-center flex flex-col items-center neon-glow gradient-border gold-glow-hover"
          {...fadeUp(0.1)}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ background: "hsl(38 65% 52% / 0.12)" }}
          >
            <Trophy className="h-7 w-7" style={{ color: "hsl(var(--gold))" }} />
          </div>
          <Badge
            className="mb-3 text-sm px-3 py-1"
            style={{ background: "hsl(38 65% 52% / 0.15)", color: "hsl(var(--gold))", borderColor: "hsl(38 65% 52% / 0.3)" }}
          >
            Favikon 2026
          </Badge>
          <p
            className="text-4xl md:text-5xl font-extrabold font-mono tracking-tight"
            style={{ color: "hsl(var(--gold))" }}
          >
            Top 2
          </p>
          <p className="text-base font-semibold text-foreground mt-2">Data Science Creator</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Egypt — recognised for leading a 60K+ community focused on Power BI and analytics
          </p>
        </motion.div>
      </div>

      {/* ── Metrics grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto">
        {METRICS.map((metric, index) => (
          <motion.div
            key={metric.label}
            className="bg-card border border-border rounded-xl p-5 text-center neon-glow-hover"
            {...fadeUp(index * 0.1)}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-3"
              style={{ background: "hsl(12 52% 56% / 0.10)" }}
            >
              <metric.icon className="h-4.5 w-4.5" style={{ color: "hsl(var(--accent))" }} />
            </div>
            <p className="text-2xl font-bold font-mono" style={{ color: "hsl(var(--accent))" }}>
              {metric.value}
            </p>
            <p className="text-sm font-medium text-foreground mb-1">{metric.label}</p>
            <p className="text-xs text-muted-foreground">{metric.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Testimonials ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {TESTIMONIALS.map((testimonial, index) => (
          <motion.div
            key={index}
            className="bg-card border border-border rounded-xl p-6 neon-glow-hover relative overflow-hidden"
            {...fadeUp(index * 0.15)}
          >
            {/* Large decorative quote */}
            <span
              className="absolute top-3 right-4 text-6xl font-serif leading-none opacity-10 select-none"
              style={{ color: "hsl(var(--accent))" }}
              aria-hidden="true"
            >
              "
            </span>
            <Quote className="h-5 w-5 mb-3" style={{ color: "hsl(var(--accent))" }} />
            <blockquote className="text-foreground italic mb-4 text-sm leading-relaxed">
              "{testimonial.quote}"
            </blockquote>
            <div className="text-sm border-t border-border pt-3">
              <p className="font-semibold text-foreground">{testimonial.author}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{testimonial.role}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Bottom badges ── */}
      <div className="text-center mt-10">
        <div className="flex justify-center gap-3 flex-wrap">
          {BOTTOM_BADGES.map((badge) => (
            <Badge
              key={badge}
              variant="outline"
              className="px-3 py-1 font-mono text-xs border-[hsl(var(--accent)/0.3)] text-[hsl(var(--accent))]"
            >
              {badge}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default Credibility;

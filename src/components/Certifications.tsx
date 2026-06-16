import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Award } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────

interface CertGroup {
  category: string;
  color:    string;
  certs:    string[];
}

// ─── Data ─────────────────────────────────────────────────────

const CERT_GROUPS: CertGroup[] = [
  {
    category: "AI & LLMs",
    color:    "hsl(12 52% 56%)",   // terracotta
    certs:    ["Anthropic: AI Fluency", "Anthropic: Claude 101", "Anthropic: Claude Code in Action"],
  },
  {
    category: "Data Engineering",
    color:    "hsl(38 65% 52%)",   // gold
    certs:    ["Databricks: SQL Analytics & BI", "Udemy: Data Warehouse Fundamentals", "DataCamp: Data Engineer Associate"],
  },
  {
    category: "BI & Analytics",
    color:    "hsl(25 32% 44%)",   // mocha
    certs:    ["DataCamp: Data Scientist Associate", "DataCamp: Data Analyst Associate", "DataCamp: Python Data Associate", "DataCamp: Data Literacy", "edX: Verified Certificates"],
  },
  {
    category: "SQL & Programming",
    color:    "hsl(12 52% 56%)",
    certs:    ["HackerRank: SQL (Basic)", "HackerRank: SQL (Intermediate)", "HackerRank: SQL (Advanced)", "HackerRank: Python (Basic)", "DataCamp: SQL Associate", "LeetCode: Top SQL 50"],
  },
  {
    category: "Cloud & Platforms",
    color:    "hsl(38 65% 52%)",
    certs:    ["Google Cloud Skills Boost", "Microsoft Learn", "Cisco: Data Analytics Essentials", "LinkedIn Learning"],
  },
  {
    category: "Diplomas & Key Courses",
    color:    "hsl(25 32% 44%)",
    certs:    [
      "Friendly Analysis: Data Analytics Diploma",
      "Udemy: Data Warehouse Ultimate Guide",
      "ITI: Build with AI (Masr Edition)",
      "365 Data Science / IBM / GCP / LinkedIn Learning Courses"
    ],
  },
];

// Flattened list for the marquee (duplicated for seamless loop)
const ALL_CERTS       = CERT_GROUPS.flatMap((g) => g.certs);
const MARQUEE_ITEMS   = [...ALL_CERTS, ...ALL_CERTS];

// ─── Animation helper ─────────────────────────────────────────

const fadeUp = (delay: number) => ({
  initial:    { opacity: 0, y: 20 },
  whileInView:{ opacity: 1, y: 0  },
  viewport:   { once: true },
  transition: { delay, duration: 0.55 },
});

// ─── Component ────────────────────────────────────────────────

const Certifications = () => (
  <section id="certifications" className="py-20 bg-secondary/30 overflow-hidden">
    <div className="container mx-auto px-4">
      {/* ── Heading ── */}
      <div className="text-center mb-4">
        <span className="section-label">Credentials</span>
      </div>
      <motion.h2
        className="text-3xl md:text-4xl font-bold text-center mb-2"
        {...fadeUp(0)}
      >
        <span className="gradient-text">Certifications &amp; Credentials</span>
      </motion.h2>
      <p className="text-center text-muted-foreground mb-10">
        40+ certifications across AI, Data Engineering, BI &amp; Analytics
      </p>
    </div>

    {/* ── Infinite marquee ── */}
    <div className="relative mb-12">
      {/* Fade masks */}
      <div
        className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, hsl(var(--background)), transparent)" }}
        aria-hidden="true"
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, hsl(var(--background)), transparent)" }}
        aria-hidden="true"
      />
      <div className="flex animate-marquee whitespace-nowrap">
        {MARQUEE_ITEMS.map((cert, index) => (
          <span
            key={index}
            className="mx-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap"
            style={{
              background:  "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              color:       "hsl(var(--foreground))",
            }}
          >
            <Award className="h-3 w-3 flex-shrink-0" style={{ color: "hsl(var(--accent))" }} />
            {cert}
          </span>
        ))}
      </div>
    </div>

    {/* ── Categorised grid ── */}
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {CERT_GROUPS.map((group, index) => (
          <motion.div
            key={group.category}
            className="bg-card border border-border rounded-xl p-5 neon-glow-hover relative overflow-hidden"
            {...fadeUp(index * 0.1)}
          >
            {/* Colour-coded top bar */}
            <div
              className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
              style={{ background: `linear-gradient(90deg, ${group.color}, hsl(38 65% 52%))` }}
              aria-hidden="true"
            />

            <h3
              className="font-semibold text-sm font-mono mb-3 mt-1"
              style={{ color: group.color }}
            >
              {group.category}
            </h3>

            <div className="flex flex-wrap gap-2">
              {group.certs.map((cert, j) => (
                <Badge
                  key={j}
                  variant="secondary"
                  className="text-xs bg-muted/70 hover:bg-muted transition-colors"
                >
                  {cert}
                </Badge>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── CTA ── */}
      <div className="mt-10 text-center">
        <Button variant="outline" size="lg" asChild>
          <a
            href="https://drive.google.com/drive/folders/1ch0TNOhaczs76D_T1t2juD0HbasaoU2I?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center border-[hsl(var(--accent)/0.4)] text-foreground hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.06)] transition-colors"
          >
            View All Certificates
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  </section>
);

export default Certifications;

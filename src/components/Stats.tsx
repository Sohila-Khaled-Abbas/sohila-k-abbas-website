import { motion } from "framer-motion";
import CountUp from "react-countup";
import { Award, Users, UserCheck } from "lucide-react";
import type { ComponentType } from "react";

// ─── Types ────────────────────────────────────────────────────

interface KPI {
  icon:   ComponentType<{ className?: string }>;
  value:  number;
  suffix: string;
  label:  string;
  color:  string;
}

// ─── Data ─────────────────────────────────────────────────────

const KPIS: KPI[] = [
  {
    icon:   Award,
    value:  40,
    suffix: "+",
    label:  "Technical Certifications",
    color:  "hsl(12 52% 56%)",    // terracotta
  },
  {
    icon:   Users,
    value:  1000,
    suffix: "+",
    label:  "Community Members Mentored",
    color:  "hsl(38 65% 52%)",    // gold
  },
  {
    icon:   UserCheck,
    value:  60,
    suffix: "K+",
    label:  "LinkedIn Followers",
    color:  "hsl(25 32% 44%)",    // mocha
  },
];

// ─── Component ────────────────────────────────────────────────

const Stats = () => (
  <section className="py-10 relative z-10 -mt-8">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {KPIS.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            className="relative group"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.55 }}
          >
            {/* Glow backdrop */}
            <div
              className="absolute -inset-px rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(135deg, ${kpi.color}40, ${kpi.color}18)` }}
              aria-hidden="true"
            />

            <div className="relative bg-card border border-border rounded-xl p-6 text-center gold-glow-hover">
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: `${kpi.color}18` }}
              >
                <kpi.icon className="h-5 w-5" style={{ color: kpi.color }} />
              </div>

              {/* Count */}
              <p
                className="text-3xl font-bold font-mono tracking-tight"
                style={{ color: kpi.color }}
              >
                <CountUp end={kpi.value} duration={2.5} suffix={kpi.suffix} separator="," />
              </p>

              <p className="text-sm text-muted-foreground mt-1">{kpi.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Stats;

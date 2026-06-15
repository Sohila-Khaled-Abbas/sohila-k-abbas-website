import { motion } from "framer-motion";
import { Users, BookOpen, Layout, MessageCircle, ExternalLink } from "lucide-react";
import type { ComponentType } from "react";

// ─── Types ────────────────────────────────────────────────────

interface CommunityLink {
  label: string;
  url:   string;
}

interface TimelineItem {
  icon:    ComponentType<{ className?: string }>;
  role:    string;
  org:     string;
  details: string[];
  links?:  CommunityLink[];
}

// ─── Data ─────────────────────────────────────────────────────

const TIMELINE: TimelineItem[] = [
  {
    icon: Users,
    role: "Data Analysis Mentor",
    org:  "TechZone",
    details: [
      "Guided learners through SQL, Power BI, and Python projects",
      "Mentored 50+ learners through TZ4 SQL Initiative",
      "Conducted live PostgreSQL workshops",
    ],
  },
  {
    icon: MessageCircle,
    role: "Founder",
    org:  "The Data Tea",
    details: [
      "Founded a pro-bono educational network bridging the knowledge gap for entry-level professionals",
      "Grew the network to 1,000+ subscribers",
    ],
    links: [
      { label: "Telegram",  url: "https://t.me/thedatatea" },
      { label: "WhatsApp",  url: "#"                        },
    ],
  },
  {
    icon: Layout,
    role: "Notion Creator",
    org:  "Notion Egypt Community",
    details: [
      "Delivered hands-on workshops integrating Notion with data workflows and project management",
    ],
  },
];

// ─── Animation helper ─────────────────────────────────────────

const slideIn = (delay: number) => ({
  initial:    { opacity: 0, x: -20 },
  whileInView:{ opacity: 1, x: 0   },
  viewport:   { once: true },
  transition: { delay, duration: 0.5 },
});

// ─── Component ────────────────────────────────────────────────

const Community = () => (
  <section id="community" className="py-20 bg-background">
    <div className="container mx-auto px-4">

      {/* ── Heading ── */}
      <div className="text-center mb-12">
        <span className="section-label">Giving Back</span>
        <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-3">
          <span className="gradient-text">Community &amp; Volunteering</span>
        </h2>
        <p className="text-muted-foreground">Building bridges in the data community</p>
      </div>

      {/* ── Timeline ── */}
      <div className="max-w-3xl mx-auto relative">
        {/* Vertical connector */}
        <div
          className="absolute left-6 top-4 bottom-4 w-[2px] rounded-full"
          style={{ background: "linear-gradient(to bottom, hsl(var(--accent)), hsl(var(--gold)), hsl(var(--border)))" }}
          aria-hidden="true"
        />

        <div className="space-y-8">
          {TIMELINE.map((item, index) => (
            <motion.div
              key={index}
              className="relative pl-16"
              {...slideIn(index * 0.15)}
            >
              {/* Icon dot */}
              <div
                className="absolute left-[5px] top-1 w-10 h-10 rounded-full border-2 flex items-center justify-center"
                style={{
                  background:   "hsl(var(--card))",
                  borderColor:  index === 0 ? "hsl(var(--accent))" : "hsl(var(--gold))",
                }}
              >
                <item.icon
                  className="h-4 w-4"
                  style={{ color: index === 0 ? "hsl(var(--accent))" : "hsl(var(--gold))" }}
                />
              </div>

              {/* Card */}
              <div className="bg-card border border-border rounded-xl p-5 neon-glow-hover gradient-border">
                {/* Role + org */}
                <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                  <h3 className="font-semibold text-foreground">{item.role}</h3>
                  <span
                    className="text-xs font-mono font-medium px-2 py-0.5 rounded-md"
                    style={{
                      background: "hsl(var(--accent) / 0.10)",
                      color:      "hsl(var(--accent))",
                    }}
                  >
                    @ {item.org}
                  </span>
                </div>

                {/* Details */}
                <ul className="mt-2 space-y-1.5">
                  {item.details.map((detail, j) => (
                    <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span
                        className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                        style={{ background: "hsl(var(--accent))" }}
                        aria-hidden="true"
                      />
                      {detail}
                    </li>
                  ))}
                </ul>

                {/* External links */}
                {item.links && (
                  <div className="flex gap-3 mt-3 pt-3 border-t border-border">
                    {item.links.map((link, j) => (
                      <a
                        key={j}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-mono transition-colors hover:underline"
                        style={{ color: "hsl(var(--accent))" }}
                      >
                        {link.label}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default Community;

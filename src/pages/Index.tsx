import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Database, ShieldCheck, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Community from "@/components/Community";
import Credibility from "@/components/Credibility";
import Certifications from "@/components/Certifications";
import Hero from "@/components/Hero";

const metrics = [
  { value: "40%", label: "Manual Overhead Reduced" },
  { value: "12%", label: "Revenue Leaks Identified" },
  { value: "50+", label: "Professionals Mentored" },
];

const caseStudies = [
  {
    icon: BarChart3,
    title: "Recovering 12% Revenue Leaks in Retail",
    description:
      "Processed 472,000+ orders to uncover hidden losses. Architected a Star Schema data model that reduced report refresh time by 50%.",
    tags: ["Power BI", "DAX", "SQL"],
  },
  {
    icon: ShieldCheck,
    title: "Mitigating Operational Risk & Fraud",
    description:
      "Detected a 5% shipping anomaly rate using custom ML models in Workbench and statistical methods (Z-score / IQR), visualized for immediate risk mitigation.",
    tags: ["Python", "PostgreSQL"],
  },
  {
    icon: Workflow,
    title: "Automating Reporting Pipelines",
    description:
      "Replaced days of manual Excel work by syncing disparate API data into a centralized PostgreSQL architecture, reducing overhead by 40%.",
    tags: ["ETL", "APIs", "Databricks"],
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Sohila Khaled Abbas — Data & Analytics Engineer for B2B Teams"
        description="Automated ETL pipelines and interactive BI ecosystems that turn chaotic spreadsheets into executive clarity. Case studies, dashboards, and data engineering work."
        path="/"
      />
      <Header />

      <main>
        {/* HERO */}
        <Hero />

        {/* METRIC BANNER */}
        <section className="border-y border-border bg-secondary/30">
          <div className="container mx-auto px-4 py-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto divide-y sm:divide-y-0 sm:divide-x divide-border">
              {metrics.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center py-4 sm:py-0"
                >
                  <p
                    className="text-3xl md:text-4xl font-extrabold font-mono tracking-tight"
                    style={{ color: i === 0 ? "hsl(var(--accent))" : i === 1 ? "hsl(var(--gold))" : "hsl(25 32% 44%)" }}
                  >
                    {m.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 uppercase tracking-wider">
                    {m.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED CASE STUDIES */}
        <section id="case-studies" className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <span className="section-label">Featured Work</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">
                <span className="gradient-text">Business Transformations</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {caseStudies.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <Card className="h-full border border-border bg-card neon-glow-hover rounded-xl overflow-hidden relative">
                    {/* Top accent bar */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[3px]"
                      style={{ background: "linear-gradient(90deg, hsl(var(--accent)), hsl(var(--gold)))" }}
                      aria-hidden="true"
                    />
                    <CardContent className="p-7 flex flex-col h-full pt-8">
                      <div
                        className="w-11 h-11 rounded-lg flex items-center justify-center mb-5"
                        style={{ background: "hsl(var(--accent) / 0.10)" }}
                      >
                        <c.icon className="h-5 w-5" style={{ color: "hsl(var(--accent))" }} />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-3 leading-snug">
                        {c.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                        {c.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {c.tags.map((t) => (
                          <span key={t} className="tech-tag">{t}</span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* AUTHORITY */}
        <section className="py-20 bg-secondary/30 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "hsl(var(--accent) / 0.12)" }}
              >
                <Database className="h-7 w-7" style={{ color: "hsl(var(--accent))" }} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-5">
                <span className="gradient-text">The Engineering Edge</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Bridging the gap between raw data chaos and strategic decision-making.
                Transitioning from Agricultural Sciences to Data Analytics Engineering required
                strict logical problem-solving — the exact framework I apply to corporate business data.
              </p>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-border text-foreground hover:bg-background hover:border-[hsl(var(--accent))] transition-colors"
              >
                <a href="#about">Read My Story</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Existing in-page sections preserved for navigation */}
        <About />
        <Experience />
        <Skills />
        <Projects />
        <Community />
        <Credibility />
        <Certifications />

        {/* BOTTOM CTA */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center gradient-border rounded-2xl p-10 md:p-14 bg-secondary/30">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="gradient-text">Is your data an asset or an operational burden?</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Let's find out where your revenue is leaking.
              </p>
              <Button asChild size="lg" className="btn-cta font-semibold shadow-md">
                <Link to="/intake">
                  Schedule a 15-Minute Data Audit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;

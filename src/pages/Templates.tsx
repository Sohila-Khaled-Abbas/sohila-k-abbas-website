import { motion } from "framer-motion";
import { ExternalLink, BookOpen } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const templates = [
  {
    title: "Excel Learning Roadmap",
    description:
      "Many people start learning Excel randomly — a video here, an article there — and end up memorizing scattered commands without ever seeing the full picture. This roadmap walks you step by step from the fundamentals all the way to building a complete interactive dashboard, based on the mindmap created with Eng. Mostafa.",
    link: "https://data-management-track-roadmap.notion.site/Excel-Roadmap-25d3daee0ded806284d3e663fd7bd609?pvs=74",
  },
  {
    title: "SQL Mastery Roadmap",
    description:
      "Want to learn SQL but don't know where to start or what order to follow? A complete template that teaches you SQL step by step from zero to advanced (Joins, CTEs, Window Functions). Includes a Topics checklist, Projects Tracker, Notes section, and a curated library of trusted Resources.",
    link: "https://sql-mastery-roadmap.super.site/",
  },
];


const Templates = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Notion Roadmaps & Data Learning Templates — Sohila Khaled Abbas"
        description="Curated Notion roadmaps for Excel, SQL, Python web scraping, and Data Engineering — structured paths from fundamentals to advanced projects."
        path="/templates"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Notion Roadmaps & Data Learning Templates",
          url: "https://sohilakhaled-portfolio.lovable.app/templates",
          hasPart: templates.map((t) => ({
            "@type": "CreativeWork",
            name: t.title,
            description: t.description,
            url: t.link,
          })),
        })}</script>
      </Helmet>
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 max-w-3xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-accent border border-primary/20 mb-4">
              <BookOpen className="h-3.5 w-3.5" />
              Curated Learning Paths
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Notion Roadmaps & Templates</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Structured roadmaps and ready-to-use Notion workspaces to guide your data journey — from Excel to Data Engineering.
            </p>
          </motion.div>

          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8 text-foreground">
            Featured Learning Paths
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {templates.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card className="h-full bg-card border border-border rounded-2xl neon-glow-hover overflow-hidden">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center mb-3">
                      <BookOpen className="h-6 w-6 text-accent" />
                    </div>
                    <CardTitle className="text-xl font-bold text-foreground">{t.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t.description}
                    </p>
                    <Button
                      asChild
                      className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto self-start"
                    >
                      <a href={t.link} target="_blank" rel="noopener noreferrer">
                        Open Template
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Templates;

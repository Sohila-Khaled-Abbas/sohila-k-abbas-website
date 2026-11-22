import { motion } from "framer-motion";
import { ChartBar, Code, Database, Workflow, FileText } from "lucide-react";
import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";

interface Highlight {
  icon: ComponentType<{ className?: string }>;
  text: string;
}

const HIGHLIGHTS: Highlight[] = [
  { icon: ChartBar, text: "Power BI dashboards, DAX measures, and KPI reporting grounded in business questions." },
  { icon: Database, text: "SQL, Power Query, and dimensional modeling with attention to data quality and traceability." },
  { icon: Code, text: "Python-based data preparation and applied machine-learning experiments." },
  { icon: Workflow, text: "Practical automation and repeatable reporting workflows." },
];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const About = () => (
  <section id="about" className="py-20 bg-secondary/30">
    <div className="container max-w-4xl mx-auto px-4">
      <motion.div className="text-center mb-4" {...fadeUp(0)}>
        <span className="section-label">About Me</span>
      </motion.div>
      <motion.h2 className="text-3xl md:text-4xl font-bold text-center mb-6" {...fadeUp(0.06)}>
        <span className="gradient-text">The Engineer Behind the Data</span>
      </motion.h2>
      <motion.p className="text-lg text-muted-foreground leading-relaxed mb-6 text-center max-w-2xl mx-auto" {...fadeUp(0.12)}>
        I’m a BI Developer with nearly two years of freelance experience building Power BI dashboards and decision-ready reporting. My work spans sales and retail, churn, supply chain, e-commerce, customer satisfaction, marketing, HR, and healthcare. I also work with Python and SQL on applied data projects, with an emphasis on clear models, validated metrics, and practical handover.
      </motion.p>
      <motion.div className="flex flex-wrap justify-center gap-4 mb-8" {...fadeUp(0.15)}>
        <Button size="lg" className="btn-cta font-semibold shadow-md" asChild>
          <a href="https://drive.google.com/file/d/134BGo0ox7ClojNGwiT6IKX0eZKIjjncd/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            View Resume
          </a>
        </Button>
        <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary hover:border-[hsl(var(--accent))] transition-colors" asChild>
          <a href="#experience">View Experience</a>
        </Button>
      </motion.div>
      <motion.blockquote className="border-l-[3px] pl-5 italic text-foreground/75 my-8 max-w-2xl mx-auto text-center" style={{ borderColor: "hsl(var(--accent))" }} {...fadeUp(0.18)}>
        “Dashboards aren't just visuals — they're decisions waiting to happen.”
      </motion.blockquote>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {HIGHLIGHTS.map((highlight, index) => (
          <motion.div key={index} className="bg-card border border-border rounded-xl p-5 flex items-start gap-4 neon-glow-hover gradient-border" {...fadeUp(0.08 * index)}>
            <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "hsl(12 52% 56% / 0.12)" }}>
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

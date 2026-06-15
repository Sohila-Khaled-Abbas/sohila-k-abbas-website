import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Animation variants ───────────────────────────────────────

const fadeUp = (delay: number = 0) => ({
  initial:    { opacity: 0, y: 32 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as const },
});

// ─── Component ────────────────────────────────────────────────

const Hero = () => (
  <section
    id="hero"
    className="min-h-screen flex items-center justify-center bg-background bg-dot-pattern bg-warm-mesh pt-20 relative overflow-hidden"
  >
    {/* ── Ambient glow orbs ── */}
    <div
      className="absolute top-16 left-0 w-[520px] h-[520px] rounded-full opacity-30 pointer-events-none"
      style={{ background: "radial-gradient(circle, hsl(38 65% 52% / 0.18) 0%, transparent 70%)" }}
      aria-hidden="true"
    />
    <div
      className="absolute bottom-0 right-0 w-[480px] h-[480px] rounded-full opacity-25 pointer-events-none"
      style={{ background: "radial-gradient(circle, hsl(12 52% 56% / 0.15) 0%, transparent 70%)" }}
      aria-hidden="true"
    />

    <div className="container mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-14 relative z-10">

      {/* ── Portrait ── */}
      <motion.div
        className="w-full md:w-5/12 flex justify-center md:order-2"
        {...fadeUp(0.05)}
      >
        <div className="relative">
          {/* Rotating gradient ring */}
          <div
            className="absolute -inset-3 rounded-full opacity-60"
            style={{
              background: "conic-gradient(from 0deg, hsl(38 65% 52%), hsl(12 52% 56%), hsl(25 32% 30%), hsl(38 65% 52%))",
              animation: "spin 8s linear infinite",
              filter: "blur(6px)",
            }}
            aria-hidden="true"
          />
          {/* Pulse ring */}
          <div
            className="absolute inset-0 rounded-full animate-pulse-ring"
            aria-hidden="true"
          />
          {/* Image container */}
          <motion.div
            className="relative w-64 h-64 md:w-[380px] md:h-[380px] rounded-full overflow-hidden border-4 shadow-2xl"
            style={{ borderColor: "hsl(38 65% 52% / 0.5)" }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <img
              src="/images/sohila-hero.png"
              alt="Sohila Khaled Abbas — BI Developer and Data Analytics Engineer"
              className="w-full h-full object-cover"
              width={380}
              height={380}
              fetchPriority="high"
              decoding="async"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* ── Text content ── */}
      <div className="w-full md:w-7/12 text-center md:text-left md:order-1">

        <motion.div {...fadeUp(0)}>
          <span className="section-label mb-4 inline-block">
            BI Developer &amp; Data Analytics Engineer
          </span>
        </motion.div>

        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5"
          {...fadeUp(0.1)}
        >
          <span className="block text-foreground">Sohila Khaled Abbas</span>
          <span className="gradient-text block text-2xl md:text-3xl lg:text-4xl font-bold mt-2">
            BI Developer &amp; Data Analytics Engineer
          </span>
        </motion.h1>

        <motion.p
          className="text-lg text-muted-foreground mb-9 max-w-xl leading-relaxed"
          {...fadeUp(0.2)}
        >
          Transforming fragmented datasets into scalable, decision-ready architectures.
          Recognized Technical Mentor and Top 200 Arabic-Speaking Influencer in data education.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
          {...fadeUp(0.3)}
        >
          <Button size="lg" className="btn-cta font-semibold shadow-md" asChild>
            <a href="#projects">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Dashboards
            </a>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="border-border text-foreground hover:bg-secondary hover:border-[hsl(var(--accent))] transition-colors"
            asChild
          >
            <a href="/intake">
              <Mail className="mr-2 h-4 w-4" />
              Work With Me
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </motion.div>
      </div>
    </div>
  </section>
);

export default Hero;

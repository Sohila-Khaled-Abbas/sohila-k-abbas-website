import { Github, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import Logo from "@/components/Logo";

// ─── Types ────────────────────────────────────────────────────

interface SocialLink {
  icon:  typeof Github;
  href:  string;
  label: string;
}

// ─── Data ─────────────────────────────────────────────────────

const SOCIAL_LINKS: SocialLink[] = [
  {
    icon:  Github,
    href:  "https://github.com/Sohila-Khaled-Abbas",
    label: "GitHub",
  },
  {
    icon:  Linkedin,
    href:  "https://www.linkedin.com/in/sohilakabbas",
    label: "LinkedIn",
  },
  {
    icon:  Mail,
    href:  "mailto:sohila.k.data@gmail.com",
    label: "Email",
  },
];

// ─── Component ────────────────────────────────────────────────

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">

        {/* ── Terminal-style contact block ── */}
        <div className="max-w-2xl mx-auto bg-background border border-border rounded-xl p-6 font-mono text-sm mb-10 shadow-sm">
          {/* Window chrome dots */}
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-destructive/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-2 text-muted-foreground text-xs">contact.sh</span>
          </div>

          <div className="space-y-2 text-muted-foreground">
            <p>
              <span style={{ color: "hsl(var(--accent))" }}>$</span>{" "}
              echo $LOCATION
            </p>
            <p className="text-foreground flex items-center gap-2">
              <MapPin className="h-3 w-3 flex-shrink-0" style={{ color: "hsl(var(--accent))" }} />
              Damietta, Egypt
            </p>

            <p>
              <span style={{ color: "hsl(var(--accent))" }}>$</span>{" "}
              echo $PHONE
            </p>
            <p className="text-foreground flex items-center gap-2">
              <Phone className="h-3 w-3 flex-shrink-0" style={{ color: "hsl(var(--accent))" }} />
              (+2) 01114919021
            </p>

            <p>
              <span style={{ color: "hsl(var(--accent))" }}>$</span>{" "}
              echo $EMAIL
            </p>
            <p className="text-foreground flex items-center gap-2">
              <Mail className="h-3 w-3 flex-shrink-0" style={{ color: "hsl(var(--accent))" }} />
              <a
                href="mailto:sohila.k.data@gmail.com"
                className="hover:text-[hsl(var(--accent))] transition-colors"
              >
                sohila.k.data@gmail.com
              </a>
            </p>

            <p style={{ color: "hsl(var(--accent))" }}>
              $ <span className="animate-blink">_</span>
            </p>
          </div>
        </div>

        {/* ── Brand + social + copyright ── */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-5">
          {/* Logo + tagline */}
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <div>
              <p className="font-semibold text-sm text-foreground">Sohila Khaled Abbas</p>
              <p className="text-xs text-muted-foreground">BI Developer &amp; Data Analytics Engineer</p>
            </div>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                aria-label={label}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-border text-muted-foreground transition-all duration-200 hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.06)]"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-muted-foreground text-xs">
            &copy; {year} Sohila Khaled Abbas. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

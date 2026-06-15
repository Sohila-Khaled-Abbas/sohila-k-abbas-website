import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

// ─── Types ────────────────────────────────────────────────────

interface NavLink {
  name: string;
  href: string;
}

// ─── Constants ────────────────────────────────────────────────

const NAV_LINKS: NavLink[] = [
  { name: "Home",           href: "/" },
  { name: "About",          href: "/#about" },
  { name: "Skills",         href: "/#skills" },
  { name: "Projects",       href: "/#projects" },
  { name: "Templates",      href: "/templates" },
  { name: "Community",      href: "/#community" },
  { name: "Credibility",    href: "/#credibility" },
  { name: "Certifications", href: "/#certifications" },
  { name: "Inquiry",        href: "/intake" },
];

const SCROLL_OFFSET = 84; // px below fixed header

// ─── Helpers ──────────────────────────────────────────────────

function getStoredDarkMode(): boolean {
  return localStorage.getItem("darkMode") === "true";
}

function applyDarkMode(enabled: boolean): void {
  document.documentElement.classList.toggle("dark", enabled);
  localStorage.setItem("darkMode", String(enabled));
}

// ─── Component ────────────────────────────────────────────────

const Header = () => {
  const [isScrolled,      setIsScrolled]      = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode,      setIsDarkMode]      = useState(getStoredDarkMode);
  const location = useLocation();

  // Initialise dark-mode & scroll listener
  useEffect(() => {
    applyDarkMode(isDarkMode);

    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      applyDarkMode(!prev);
      return !prev;
    });
  }, []);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      // Let react-router handle real routes (no hash)
      if (href === "/" || !href.includes("#")) {
        setIsMobileMenuOpen(false);
        return;
      }

      e.preventDefault();

      // If not on home page, navigate via full reload to land at anchor
      if (location.pathname !== "/") {
        window.location.href = href;
        return;
      }

      const selector = href.replace("/#", "#");
      const target   = document.querySelector(selector);
      if (target) {
        const top = target.getBoundingClientRect().top + window.pageYOffset - SCROLL_OFFSET;
        window.scrollTo({ top, behavior: "smooth" });
      }

      setIsMobileMenuOpen(false);
    },
    [location.pathname],
  );

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        isScrolled
          ? "py-2 bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
          : "py-4 bg-transparent",
      )}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">

        {/* ── Brand logo ── */}
        <Link
          to="/"
          aria-label="Sohila Khaled Abbas — Home"
          className="flex items-center gap-2.5 group"
        >
          <Logo size={34} className="transition-transform duration-300 group-hover:scale-105" />
          <span className="font-mono font-bold text-sm tracking-widest gradient-text select-none">
            S.K.A
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden md:flex items-center gap-5" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className={cn(
                "relative text-sm font-medium text-muted-foreground transition-colors duration-200",
                "hover:text-foreground",
                "after:absolute after:bottom-[-3px] after:left-0 after:h-[2px] after:w-0",
                "after:rounded-full after:bg-gradient-to-r after:from-[hsl(12,52%,56%)] after:to-[hsl(38,65%,52%)]",
                "after:transition-[width] after:duration-300 hover:after:w-full",
              )}
            >
              {link.name}
            </a>
          ))}

          {/* Dark-mode toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
              "border border-border hover:border-[hsl(var(--accent))]",
              "bg-secondary hover:bg-[hsl(var(--accent)/0.08)] text-muted-foreground hover:text-foreground",
            )}
          >
            {isDarkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
        </nav>

        {/* ── Mobile controls ── */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-border bg-secondary text-muted-foreground"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <Button
            variant="ghost"
            size="icon"
            className="text-foreground"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-b border-border py-5 md:hidden">
          <nav className="flex flex-col gap-1 px-5" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="py-2.5 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

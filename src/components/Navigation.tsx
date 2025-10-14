import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Moon, Sun, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemeMode = "dark" | "light";

const sectionLinks = [
  { label: "Home", hash: "#home" },
  { label: "Layanan", hash: "#services" },
  { label: "Tentang", hash: "#about" },
  { label: "Kontak", hash: "#contact" },
];

export const Navigation = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const navigate = useNavigate();
  const location = useLocation();
  const isLight = theme === "light";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("ekal-theme");
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const initial = (stored as ThemeMode | null) ?? (prefersLight ? "light" : "dark");
    setTheme(initial);
    document.body.classList.toggle("light", initial === "light");
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleHashNavigation = useCallback(
    (hash: string) => {
      const id = hash.replace("#", "");
      const currentPath = location.pathname;

      const scrollToSection = () => {
        const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

      if (currentPath !== "/") {
        navigate(`/${hash}`);
        setTimeout(scrollToSection, 150);
      } else {
        scrollToSection();
      }
      setMenuOpen(false);
    },
    [location.pathname, navigate],
  );

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      document.body.classList.toggle("light", nextTheme === "light");
      window.localStorage.setItem("ekal-theme", nextTheme);
    }
  };

  const desktopLinks = useMemo(
    () => (
      <>
        {sectionLinks.map((item) => (
          <button
            key={item.hash}
            type="button"
            onClick={() => handleHashNavigation(item.hash)}
            className="cursor-interactive rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-foreground/10 hover:text-foreground"
          >
            {item.label}
          </button>
        ))}
      </>
    ),
    [handleHashNavigation],
  );

  return (
    <>
      <header className="pointer-events-none fixed left-1/2 top-1 z-40 w-full max-w-4xl -translate-x-1/2 px-4 sm:top-2">
        <div
          className={cn(
            "glass-panel pointer-events-auto flex items-center justify-between rounded-full px-5 py-3 transition-all",
            scrolled ? "bg-card/20 shadow-lg shadow-primary/10" : "bg-card/10",
          )}
        >
          <button
            type="button"
            onClick={() => handleHashNavigation("#home")}
            className={cn(
              "cursor-interactive flex items-center space-x-3 rounded-full px-4 py-2 font-semibold uppercase tracking-[0.2em] transition",
              isLight
                ? "bg-card text-primary shadow-[0_16px_32px_-22px_hsl(221_83%_56%/0.3)] hover:bg-card/90"
                : "bg-white/5 text-white/90 hover:bg-white/10",
            )}
          >
            <span>єкαℓℓιρтuѕ</span>
          </button>

          <nav className="hidden items-center gap-1 md:flex">{desktopLinks}</nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="cursor-interactive hidden h-10 w-10 rounded-full transition md:flex"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            <Button
              variant="glass"
              size="icon"
              className="cursor-interactive flex h-10 w-10 items-center justify-center rounded-full transition md:hidden"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <Button
              variant="hero"
              size="sm"
              className="cursor-interactive hidden rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-wide md:inline-flex"
              onClick={() => navigate("/order")}
            >
              Hubungi Kami
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-background/70 backdrop-blur-md md:hidden" onClick={() => setMenuOpen(false)} />
          <div className="glass-panel fixed inset-x-4 top-16 z-40 space-y-4 rounded-3xl p-6 text-card-foreground md:hidden">
            <div className="flex items-center justify-between">
              <span className="text-sm uppercase tracking-[0.35em] text-muted-foreground">Navigasi</span>
              <Button variant="ghost" size="icon" className="cursor-interactive h-9 w-9 rounded-full hover:border-border/30" onClick={() => setMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              {sectionLinks.map((item) => (
                <button
                  key={item.hash}
                  type="button"
                  onClick={() => handleHashNavigation(item.hash)}
                  className="cursor-interactive rounded-2xl bg-card/10 px-4 py-3 text-left text-base font-medium text-foreground/80 transition hover:bg-card/20 hover:text-foreground"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <Button
              variant="hero"
              size="lg"
              className="cursor-interactive w-full rounded-2xl py-4 text-base font-semibold uppercase tracking-wide"
              onClick={() => {
                navigate("/order");
                setMenuOpen(false);
              }}
            >
              Konsultasi Sekarang
              <ArrowUpRight className="h-5 w-5" />
            </Button>

            <Button
              variant="glass"
              size="lg"
              className="cursor-interactive w-full rounded-2xl py-4 text-base font-semibold"
              onClick={toggleTheme}
            >
              {theme === "light" ? (
                <>
                  <Moon className="mr-2 h-5 w-5" /> Mode Gelap
                </>
              ) : (
                <>
                  <Sun className="mr-2 h-5 w-5" /> Mode Terang
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </>
  );
};

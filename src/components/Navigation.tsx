import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Moon, Sun, ArrowUpRight, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type ThemeMode = "dark" | "light";

const sectionLinks = [
  { label: "Home", hash: "#home" },
  { label: "Layanan", hash: "#services" },
  { label: "Tentang", hash: "#about" },
  { label: "Kontak", hash: "#contact" },
];

export const Navigation = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const navigate = useNavigate();
  const location = useLocation();
  const isLight = theme === "light";
  const { t, i18n } = useTranslation();

  const languages = [
    { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩', nativeName: 'Indonesia' },
    { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
    { code: 'ja', name: '日本語', flag: '🇯🇵', nativeName: '日本語' },
    { code: 'ko', name: '한국어', flag: '🇰🇷', nativeName: '한국어' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺', nativeName: 'Русский' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', nativeName: 'العربية' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷', nativeName: 'Türkçe' },
  ];

  const changeLanguage = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      localStorage.setItem('i18nextLng', languageCode);
      setLanguageModalOpen(false);
      setMenuOpen(false);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const coarseQuery = window.matchMedia("(pointer: coarse)");
    const widthQuery = window.matchMedia("(max-width: 767px)");

    const updateTouchMode = () => {
      const shouldEnable = coarseQuery.matches || widthQuery.matches;
      document.body.classList.toggle("is-touch", shouldEnable);
    };

    updateTouchMode();
    const handleCoarseChange = () => updateTouchMode();
    const handleWidthChange = () => updateTouchMode();

    coarseQuery.addEventListener("change", handleCoarseChange);
    widthQuery.addEventListener("change", handleWidthChange);

    // Keyboard navigation for language modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && languageModalOpen) {
        setLanguageModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      coarseQuery.removeEventListener("change", handleCoarseChange);
      widthQuery.removeEventListener("change", handleWidthChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove("is-touch");
    };
  }, [languageModalOpen]);

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
            {t(`nav.${item.hash.replace('#', '')}`)}
          </button>
        ))}
      </>
    ),
    [handleHashNavigation, t],
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

            {/* Language Switcher Button - Desktop */}
            <Button
              variant="ghost"
              size="sm"
              className="cursor-interactive hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition hover:bg-card/20 md:flex"
              onClick={() => setLanguageModalOpen(true)}
              aria-label="Change language"
            >
              <span className="text-base">{currentLanguage.flag}</span>
              <span className="hidden lg:inline text-xs">{currentLanguage.nativeName}</span>
              <Languages className="h-4 w-4" />
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
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-background/70 backdrop-blur-md md:hidden" onClick={() => setMenuOpen(false)} />
          <div className="glass-panel fixed inset-x-4 top-16 z-40 space-y-4 rounded-3xl p-6 text-card-foreground md:hidden">
            <div className="flex items-center justify-between">
              <span className="text-sm uppercase tracking-[0.35em] text-muted-foreground">{t('nav.navigation')}</span>
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
                  {t(`nav.${item.hash.replace('#', '')}`)}
                </button>
              ))}
            </div>

            {/* Language Selector */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground/60">{t('nav.language')}</span>
              <div className="grid grid-cols-2 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-card/20",
                      i18n.language === lang.code
                        ? "bg-card/30 text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span className="text-xs">{lang.name}</span>
                  </button>
                ))}
              </div>
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
              {t('nav.consultation')}
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

      {/* Language Selection Modal */}
      {languageModalOpen && (
        <>
          {/* Full Screen Backdrop */}
          <div
            className="fixed inset-0 z-50 modal-backdrop cursor-crosshair modal-backdrop-enter"
            onClick={() => setLanguageModalOpen(false)}
            role="presentation"
            aria-hidden="true"
          />

          {/* Centered Modal */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-enter"
            role="dialog"
            aria-modal="true"
            aria-labelledby="language-modal-title"
            aria-describedby="language-modal-description"
            tabIndex={-1}
          >
            <div className="w-full max-w-sm rounded-2xl language-modal p-6 shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3
                  id="language-modal-title"
                  className="text-lg font-semibold text-foreground"
                >
                  {t('nav.selectLanguage')}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full cursor-pointer hover:bg-card/20"
                  onClick={() => setLanguageModalOpen(false)}
                  aria-label={t('nav.closeModal', 'Close language selection')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Hidden description for screen readers */}
              <div id="language-modal-description" className="sr-only">
                Select your preferred language from the available options below
              </div>

              {/* Language Grid */}
              <div
                className="grid grid-cols-2 gap-3"
                role="radiogroup"
                aria-labelledby="language-modal-title"
              >
                {languages.map((lang, index) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={cn(
                      "language-button group flex flex-col items-center gap-2 rounded-xl px-3 py-4 text-center transition-all duration-300",
                      i18n.language === lang.code
                        ? "language-active text-primary"
                        : "text-foreground hover:bg-card/30 border-2 border-transparent hover:border-primary/20"
                    )}
                    role="radio"
                    aria-checked={i18n.language === lang.code}
                    tabIndex={languageModalOpen ? 0 : -1}
                    aria-label={`Select ${lang.name} language`}
                    autoFocus={index === 0 && languageModalOpen}
                  >
                    <span className="language-flag text-3xl group-hover:scale-110 transition-transform duration-300" role="img" aria-label={`${lang.name} flag`}>
                      {lang.flag}
                    </span>
                    <div className="flex flex-col items-center">
                      <span className="language-text text-sm font-medium leading-tight">{lang.nativeName}</span>
                      <span className="text-xs text-muted-foreground leading-tight">{lang.name}</span>
                    </div>
                    {i18n.language === lang.code && (
                      <div className="mt-1" aria-hidden="true">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Footer hint */}
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  {t('nav.languageHint', 'Language preference will be saved automatically')}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

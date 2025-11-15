import { useMemo } from "react";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/use-in-view";
import { useTypewriter } from "@/hooks/use-typewriter";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export const Hero = () => {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.35 });
  const { t, i18n } = useTranslation();
  const typewriterWords = useMemo(
    () => [
      t("hero.uiUxDesign"),
      t("hero.digitalExperience"),
      t("hero.web3d"),
      t("hero.branding"),
    ],
    [t, i18n.language],
  );
  const typed = useTypewriter(typewriterWords, { typingSpeed: 80, deletingSpeed: 40, pauseTime: 1400 });

  const base =
    "transition-all duration-700 ease-smooth will-change-transform motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100";
  const show = inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8";

  return (
    <section id="home" className="relative flex min-h-[calc(100vh-6rem)] items-center overflow-hidden px-4 scroll-mt-28 lg:scroll-mt-32">
      {/* Enhanced Background with Multiple Layers */}
      <div className="absolute inset-0">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background/50" />

        {/* Animated Blobs */}
        <div className="pointer-events-none fx-bubble floating absolute left-[12%] top-[12%] h-32 w-32 rounded-full border border-border/20 bg-primary/10 blur-3xl" />
        <div className="pointer-events-none fx-bubble absolute right-[18%] top-[18%] h-24 w-24 rounded-full border border-border/20 bg-secondary/10 blur-3xl" />
        <div className="pointer-events-none fx-bubble floating absolute bottom-[10%] right-[10%] h-36 w-36 rounded-full border border-border/20 bg-accent/10 blur-[70px]" />

        {/* Additional Accent Blobs */}
        <div className="pointer-events-none fx-bubble absolute left-[25%] bottom-[25%] h-28 w-28 rounded-full bg-primary/8 blur-[60px]" style={{ animationDelay: '2s' }} />
        <div className="pointer-events-none fx-bubble floating absolute right-[35%] top-[35%] h-20 w-20 rounded-full bg-secondary/12 blur-[50px]" style={{ animationDelay: '4s' }} />

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)]" />

        {/* Radial Gradient Spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_50%)]" />
      </div>

      <div ref={ref} className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-12 py-16">
        <div className={cn("w-full text-center", base, show)} style={{ transitionDelay: "120ms" }}>
          <div className="inline-flex items-center gap-2 rounded-full bg-card/20 px-5 py-2 text-xs uppercase tracking-[0.35em] text-foreground/70 shadow-lg shadow-primary/10">
            <Sparkles className="h-4 w-4" />
            <span>{t("hero.solusiDigital")}</span>
          </div>

          <p className="mt-6 text-lg leading-relaxed text-foreground/70 md:text-xl">
            {t("hero.description")}
          </p>

          <p className="mt-4 text-sm font-medium uppercase tracking-[0.4em] text-foreground/50">
            {t("hero.fokus")}
            <span className="ml-3 rounded-full bg-card/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
              {typed || t("hero.uiUxDesign")}
            </span>
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button variant="hero" size="lg" className="cursor-interactive rounded-full px-8 py-6 text-base font-semibold uppercase tracking-wide" asChild>
              <Link to="/order" onMouseEnter={() => import("../pages/Order")}>
                {t("hero.startProject")}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="cursor-interactive rounded-full border-border/15 bg-card/20 px-6 py-6 text-base font-semibold text-foreground/80 transition hover:border-border/30 hover:bg-card/30"
              asChild
            >
              <a href="https://itsme.ekalliptus.id/" target="_blank" rel="noopener noreferrer">
                <Play className="mr-2 h-4 w-4" />
                {t("hero.profile")}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

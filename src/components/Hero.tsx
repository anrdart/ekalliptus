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
    <section id="home" className="relative flex min-h-[calc(100vh-6rem)] items-center overflow-hidden px-4">
      <div className="absolute inset-0">
        <div className="pointer-events-none fx-bubble absolute left-[12%] top-[12%] h-32 w-32 rounded-full border border-border/20 bg-card/20 blur-3xl" />
        <div className="pointer-events-none fx-bubble absolute right-[18%] top-[18%] h-24 w-24 rounded-full border border-border/20 bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none fx-bubble floating absolute bottom-[10%] right-[10%] h-36 w-36 rounded-full border border-border/20 bg-indigo-400/20 blur-[70px]" />
      </div>

      <div ref={ref} className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-12 py-16 lg:flex-row lg:items-start lg:gap-16">
        <div className={cn("w-full max-w-2xl text-center lg:text-left", base, show)} style={{ transitionDelay: "120ms" }}>
          <div className="inline-flex items-center gap-2 rounded-full bg-card/20 px-5 py-2 text-xs uppercase tracking-[0.35em] text-foreground/70 shadow-lg shadow-primary/10">
            <Sparkles className="h-4 w-4" />
            <span>{t("hero.solusiDigital")}</span>
          </div>

          <h1 className="mt-6 text-4xl font-medium text-foreground/80 md:text-6xl lg:text-7xl">
                      <span className="mt-4 block bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-300 bg-clip-text text-5xl font-bold text-transparent md:text-6xl lg:text-[4.2rem]">
              єкαℓℓιρтuѕ
            </span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-foreground/70 md:text-xl">
            {t("hero.description")}
          </p>

          <p className="mt-4 text-sm font-medium uppercase tracking-[0.4em] text-foreground/50">
            {t("hero.fokus")}
            <span className="ml-3 rounded-full bg-card/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
              {typed || t("hero.uiUxDesign")}
            </span>
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-start">
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

        <div className="w-full max-w-sm lg:max-w-md">
          <div className={cn("glass-panel neon-border rounded-3xl p-8 text-card-foreground shadow-elegant", base, show)} style={{ transitionDelay: "260ms" }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{t("contact.insights")}</p>
                <h2 className="mt-2 text-3xl font-semibold text-foreground">{t("contact.customerJourney")}</h2>
              </div>
              <div className="rounded-2xl bg-card/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("contact.statusActive")}
              </div>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              {t("contact.insightsDesc")}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 text-foreground">
              <div className="rounded-2xl bg-card/10 p-4 text-center">
                <div className="text-3xl font-bold">+120</div>
                <div className="mt-2 text-xs uppercase tracking-[0.35em] text-muted-foreground">{t("contact.experience")}</div>
              </div>
              <div className="rounded-2xl bg-card/10 p-4 text-center">
                <div className="text-3xl font-bold">4.9★</div>
                <div className="mt-2 text-xs uppercase tracking-[0.35em] text-muted-foreground">{t("contact.rating")}</div>
              </div>
              <div className="rounded-2xl bg-card/10 p-4 text-center">
                <div className="text-3xl font-bold">3D</div>
                <div className="mt-2 text-xs uppercase tracking-[0.35em] text-muted-foreground">{t("contact.interactive")}</div>
              </div>
              <div className="rounded-2xl bg-card/10 p-4 text-center">
                <div className="text-3xl font-bold">24/7</div>
                <div className="mt-2 text-xs uppercase tracking-[0.35em] text-muted-foreground">{t("contact.support")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

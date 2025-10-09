import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/use-in-view";
import { useTypewriter } from "@/hooks/use-typewriter";
import { cn } from "@/lib/utils";

export const Hero = () => {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.35 });
  const typed = useTypewriter(
    ["UI/UX Design Futuristik", "Pengalaman Digital Imersif", "Website dengan Sentuhan 3D", "Strategi Branding Holistik"],
    { typingSpeed: 80, deletingSpeed: 40, pauseTime: 1400 },
  );

  const base =
    "transition-all duration-700 ease-smooth will-change-transform motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100";
  const show = inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8";

  return (
    <section id="home" className="relative flex min-h-[calc(100vh-8rem)] items-center overflow-hidden px-4">
      <div className="absolute inset-0">
        <div className="pointer-events-none absolute left-[12%] top-[12%] h-32 w-32 rounded-full border border-white/10 bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[18%] top-[18%] h-24 w-24 rounded-full border border-white/10 bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none floating absolute bottom-[10%] right-[10%] h-36 w-36 rounded-full border border-white/10 bg-indigo-400/20 blur-[70px]" />
      </div>

      <div ref={ref} className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-12 py-24 lg:flex-row lg:items-start lg:gap-16">
        <div className={cn("w-full max-w-2xl text-center lg:text-left", base, show)} style={{ transitionDelay: "120ms" }}>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-2 text-xs uppercase tracking-[0.35em] text-white/70 shadow-lg shadow-sky-500/10">
            <Sparkles className="h-4 w-4" />
            <span>Solusi Digital</span>
          </div>

          <h1 className="mt-6 text-4xl font-medium text-white/80 md:text-6xl lg:text-7xl">
                     <span className="mt-4 block bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-300 bg-clip-text text-5xl font-bold text-transparent md:text-6xl lg:text-[4.2rem]">
              єкαℓℓιρтuѕ
            </span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-white/70 md:text-xl">
            Kami hadir untuk menghadirkan produk digital yang terasa futuristik namun tetap humanis. Menggabungkan micro-interaction, elemen glassmorphism, dan animasi halus untuk menciptakan pengalaman yang melekat di ingatan.
          </p>

          <p className="mt-4 text-sm font-medium uppercase tracking-[0.4em] text-white/50">
            Fokus kami saat ini:
            <span className="ml-3 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              {typed || "UI/UX Design Futuristik"}
            </span>
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-start">
            <Button variant="hero" size="lg" className="cursor-interactive rounded-full px-8 py-6 text-base font-semibold uppercase tracking-wide" asChild>
              <Link to="/order" onMouseEnter={() => import("../pages/Order")}>
                Mulai Proyek Anda
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="cursor-interactive rounded-full border-white/15 bg-white/5 px-6 py-6 text-base font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10"
              asChild
            >
              <a href="https://ekalliptus.my.id/" target="_blank" rel="noopener noreferrer">
                <Play className="mr-2 h-4 w-4" />
                PROFIL KAMI
              </a>
            </Button>
          </div>
        </div>

        <div className="w-full max-w-sm lg:max-w-md">
          <div className={cn("glass-panel neon-border rounded-3xl border-white/10 p-8 text-white shadow-elegant", base, show)} style={{ transitionDelay: "260ms" }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">Wawasan</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">Perjalanan Pelanggan</h2>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/70">Aktif</div>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-white/70">
              Dari landing page interaktif hingga dashboard dinamis, kami merancang tiap detail agar terasa immersif dan menonjol dari kompetitor Anda.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 text-white">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <div className="text-3xl font-bold">+120</div>
                <div className="mt-2 text-xs uppercase tracking-[0.35em] text-white/50">Pengalaman</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <div className="text-3xl font-bold">4.9★</div>
                <div className="mt-2 text-xs uppercase tracking-[0.35em] text-white/50">Skor Klien</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <div className="text-3xl font-bold">3D</div>
                <div className="mt-2 text-xs uppercase tracking-[0.35em] text-white/50">Interaktif</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <div className="text-3xl font-bold">24/7</div>
                <div className="mt-2 text-xs uppercase tracking-[0.35em] text-white/50">Dukungan</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

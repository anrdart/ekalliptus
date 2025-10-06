import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import heroBackground from "@/assets/hero-bg.jpg";
import { useInView } from "@/hooks/use-in-view";
import { Link } from "react-router-dom";

export const Hero = () => {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });

  const base = "transition-transform transition-opacity duration-700 ease-smooth will-change-transform motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100";
  const show = inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-hero-gradient/90"></div>
      </div>

      {/* Content */}
      <div ref={ref} className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <div
          className={`mb-6 inline-flex items-center space-x-2 bg-card/20 backdrop-blur-sm border border-border/30 rounded-full px-4 py-2 text-primary-foreground ${base} ${show}`}
          style={{ transitionDelay: "100ms" }}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Solusi Digital Terdepan</span>
        </div>

        <h1
          className={`text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight ${base} ${show}`}
          style={{ transitionDelay: "200ms" }}
        >
          <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            єкαℓℓιρтuѕ
          </span>
        </h1>

        <p
          className={`text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto leading-relaxed ${base} ${show}`}
          style={{ transitionDelay: "300ms" }}
        >
          Wujudkan visi digital Anda dengan layanan profesional kami.
          Dari website hingga aplikasi mobile, kami siap membantu bisnis Anda berkembang.
        </p>

        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center items-center ${base} ${show}`}
          style={{ transitionDelay: "400ms" }}
        >
          <Button variant="hero" size="lg" className="text-lg px-8 py-6" asChild>
            <Link to="/order" onMouseEnter={() => import("../pages/Order")}>
              Mulai Proyek Anda
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>

          <Button variant="glass" size="lg" className="text-lg px-8 py-6" asChild>
            <a href="https://ekalliptus.my.id/" target="_blank" rel="noopener noreferrer">
              Lihat Portofolio
            </a>
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
          <div className={`text-center ${base} ${show}`} style={{ transitionDelay: "600ms" }}>
            <div className="text-2xl font-bold text-primary-foreground mb-2">100+</div>
            <div className="text-sm text-primary-foreground/80">Proyek Selesai</div>
          </div>
          <div className={`text-center ${base} ${show}`} style={{ transitionDelay: "700ms" }}>
            <div className="text-2xl font-bold text-primary-foreground mb-2">50+</div>
            <div className="text-sm text-primary-foreground/80">Klien Puas</div>
          </div>
          <div className={`text-center ${base} ${show}`} style={{ transitionDelay: "800ms" }}>
            <div className="text-2xl font-bold text-primary-foreground mb-2">24/7</div>
            <div className="text-sm text-primary-foreground/80">Support</div>
          </div>
          <div className={`text-center ${base} ${show}`} style={{ transitionDelay: "900ms" }}>
            <div className="text-2xl font-bold text-primary-foreground mb-2">5★</div>
            <div className="text-sm text-primary-foreground/80">Rating</div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent"></div>
    </section>
  );
};
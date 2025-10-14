import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Compass, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <section className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">

      <div className="glass-panel neon-border relative z-10 flex max-w-xl flex-col items-center gap-6 rounded-3xl px-10 py-14 text-center text-card-foreground shadow-elegant">
        <div className="flex items-center gap-3 text-sm uppercase tracking-[0.4em] text-muted-foreground">
          <Compass className="h-4 w-4" />
          <span>Halaman tidak ditemukan</span>
        </div>
        <h1 className="text-6xl font-semibold text-foreground">404</h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Maaf, destinasi digital yang Anda tuju belum tersedia. Mari kembali ke halaman utama dan temukan pengalaman yang sudah kami siapkan.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button variant="hero" size="lg" className="w-full rounded-full px-8 py-5 text-sm font-semibold uppercase tracking-wide" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full rounded-full px-8 py-5 text-sm font-semibold uppercase tracking-wide"
            asChild
          >
            <Link to="/order">
              Lihat Layanan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NotFound;

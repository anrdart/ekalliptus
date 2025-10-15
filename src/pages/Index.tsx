import { lazy, Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Hero } from "@/components/Hero";
import { SEO_CONFIG, getCanonicalUrl, getOgUrl, PAGE_SEO } from "@/config/seo.config";

// Optimized lazy loading with preload hints
const ServicesLazy = lazy(() =>
  import("@/components/Services").then((m) => ({ default: m.Services }))
);
const ContactCTALazy = lazy(() =>
  import("@/components/ContactCTA").then((m) => ({ default: m.ContactCTA }))
);
const FAQLazy = lazy(() =>
  import("@/components/FAQ").then((m) => ({ default: m.FAQ }))
);

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");
    const target = document.getElementById(id);
    if (target) {
      setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }
  }, [location.hash]);

  return (
    <>
      <Helmet>
        <title>{PAGE_SEO.home.title}</title>
        <meta name="description" content={PAGE_SEO.home.description} />
        <meta name="keywords" content={PAGE_SEO.home.keywords} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        
        { /* SEO Tags */}
        <meta name="seobility" content="657264fb7c12fc1e19a558b469308911"></meta>
        
        {/* Canonical URL */}
        <link rel="canonical" href={getCanonicalUrl(PAGE_SEO.home.path)} />
        
        {/* hreflang Tags */}
        <link rel="alternate" hrefLang="id" href={getCanonicalUrl(PAGE_SEO.home.path)} />
        <link rel="alternate" hrefLang="x-default" href={getCanonicalUrl(PAGE_SEO.home.path)} />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={SEO_CONFIG.SITE_TITLE} />
        <meta property="og:description" content="Digital agency Indonesia spesialis website development, WordPress, mobile app, dan multimedia editing. Transformasi bisnis Anda dengan teknologi terdepan." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getOgUrl(PAGE_SEO.home.path)} />
        <meta property="og:image" content={SEO_CONFIG.IMAGES.heroImage} />
        <meta property="og:image:alt" content="ekalliptus - Digital Agency Indonesia" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content={SEO_CONFIG.LOCALE} />
        <meta property="og:site_name" content={SEO_CONFIG.SITE_NAME} />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={SEO_CONFIG.SOCIAL.twitter} />
        <meta name="twitter:creator" content={SEO_CONFIG.SOCIAL.twitter} />
        <meta name="twitter:title" content={SEO_CONFIG.SITE_TITLE} />
        <meta name="twitter:description" content="Digital agency Indonesia untuk website, WordPress, mobile app, dan editing profesional. Solusi digital terdepan untuk bisnis modern." />
        <meta name="twitter:image" content={SEO_CONFIG.IMAGES.heroImage} />
        <meta name="twitter:image:alt" content="ekalliptus - Digital Agency Indonesia" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": getCanonicalUrl("/")
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Services",
                "item": getCanonicalUrl("/#services")
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "About",
                "item": getCanonicalUrl("/#about")
              }
            ]
          })}
        </script>
      </Helmet>
      <div className="relative flex flex-col gap-24 pb-24">
        <Hero />
        <div className="text-center py-8 px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ekalliptus - Solusi Digital Terdepan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transformasi bisnis Anda dengan website development Indonesia, WordPress custom, mobile app development, dan layanan digital profesional lainnya.
          </p>
        </div>
        <Suspense fallback={<div className="content-vis py-20" />}>
          <ServicesLazy />
        </Suspense>

        <Suspense fallback={<div className="content-vis py-20" />}>
          <FAQLazy />
        </Suspense>

        <section id="about" className="content-vis relative px-4 py-24">
          <div className="absolute inset-0">
            <div className="pointer-events-none fx-bubble absolute left-[10%] top-[15%] h-40 w-40 rounded-full border border-border/20 bg-card/10 blur-3xl" />
            <div className="pointer-events-none fx-bubble absolute right-[15%] top-[25%] h-32 w-32 rounded-full border border-border/20 bg-emerald-400/10 blur-3xl" />
            <div className="pointer-events-none fx-bubble floating absolute bottom-[20%] left-[20%] h-36 w-36 rounded-full border border-border/20 bg-sky-400/10 blur-[70px]" />
          </div>
          
          <div className="relative z-10 mx-auto max-w-6xl">
            <div className="mx-auto mb-16 max-w-4xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-card/20 px-5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.6em] text-muted-foreground mb-6">
                <span>Tentang Kami</span>
              </div>
              <h2 className="text-4xl font-semibold text-foreground md:text-5xl mb-8">
                Transformasi Digital <span className="bg-gradient-to-r from-sky-400 to-emerald-300 bg-clip-text text-transparent">Terdepan</span>
              </h2>
              
              <div className="glass-panel neon-border rounded-3xl p-8 md:p-12 shadow-elegant mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 p-3 mt-1">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">Inovasi Berkelanjutan</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          ekalliptus adalah <strong className="text-foreground">digital agency berbasis di Indonesia</strong> yang spesialis dalam transformasi digital untuk bisnis modern. Dengan pengalaman lebih dari 5 tahun di industri, kami telah membantu ratusan klien dari UMKM hingga enterprise mencapai visi digital mereka.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-gradient-to-r from-emerald-500 to-sky-400 p-3 mt-1">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">Kualitas Terjamin</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Layanan kami mencakup <a href="/order" className="text-sky-400 hover:text-sky-300 transition-colors font-medium underline decoration-sky-400/30 hover:decoration-sky-400">website development</a> yang responsif dan SEO-friendly, custom WordPress dengan plugin integrasi lengkap, pengembangan aplikasi mobile cross-platform menggunakan React Native dan Flutter.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 p-3 mt-1">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">Tim Profesional</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Service perbaikan HP dan laptop dengan teknisi bersertifikat, serta editing foto dan video profesional untuk konten marketing yang impactful menggunakan software seperti Adobe Premiere, After Effects, dan Photoshop.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="glass-panel rounded-2xl p-6 bg-card/10">
                      <div className="text-center">
                        <div className="text-4xl font-bold bg-gradient-to-r from-sky-400 to-emerald-300 bg-clip-text text-transparent mb-2">5+</div>
                        <div className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Tahun Pengalaman</div>
                      </div>
                    </div>

                    <div className="glass-panel rounded-2xl p-6 bg-card/10">
                      <div className="text-center">
                        <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-sky-300 bg-clip-text text-transparent mb-2">200+</div>
                        <div className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Klien Terpusat</div>
                      </div>
                    </div>

                    <div className="glass-panel rounded-2xl p-6 bg-card/10">
                      <div className="text-center">
                        <div className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-300 bg-clip-text text-transparent mb-2">24/7</div>
                        <div className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Dukungan Penuh</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="glass-panel neon-border rounded-2xl p-6 text-left">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Filosofi Kami</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Kami percaya bahwa setiap bisnis memiliki cerita unik yang perlu disampaikan melalui digital presence yang kuat. Oleh karena itu, pendekatan kami selalu berfokus pada user experience yang intuitif, performance tinggi, dan strategi SEO yang berkelanjutan.
                  </p>
                </div>

                <div className="glass-panel neon-border rounded-2xl p-6 text-left">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Komitmen Kualitas</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Tim ekalliptus terdiri dari developer berpengalaman, designer kreatif, dan project manager yang siap mendampingi proyek Anda dari konsep hingga launch. Sebagai solusi digital terdepan, ekalliptus memastikan setiap proyek dioptimalkan untuk search engine Google.
                  </p>
                </div>
              </div>
              
              <div className="glass-panel neon-border rounded-2xl p-8 mb-12">
                <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">Mengapa Memilih ekalliptus?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">Teknologi Terdepan</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Kami menyediakan <strong className="text-foreground">jasa pembuatan website Indonesia</strong> yang terjangkau namun berkualitas tinggi dengan teknologi modern.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="rounded-full bg-gradient-to-r from-emerald-500 to-sky-400 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">Fokus Lokal</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Spesialis <strong className="text-foreground">WordPress custom</strong> untuk kebutuhan bisnis lokal dan <strong className="text-foreground">mobile app development</strong> untuk startup hingga enterprise.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.818-4.364A9 9 0 1112 21c1.052 0 2.062-.18 3-.512" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">Hasil Terjamin</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Dengan fokus pada digital agency yang profesional, ekalliptus telah menjadi pilihan utama untuk <strong className="text-foreground">Service HP dan laptop</strong> di Tegal dan sekitarnya.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-center mb-8">
                <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl mx-auto">
                  Kami mengutamakan kepuasan klien dengan memberikan hasil yang tidak hanya estetis namun juga fungsional. Setiap proyek <strong className="text-foreground">website development Indonesia</strong> yang kami kerjakan selalu mengikuti best practices SEO terbaru untuk memastikan visibilitas maksimal di mesin pencari Google.
                </p>
              </div>
              
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-6 justify-center">
                <a href="/order" className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-8 py-4 text-lg font-semibold text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/25 hover:scale-105 text-center">
                  <span>Mulai Proyek Digital Anda</span>
                  <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
                <a href="#services" className="group inline-flex items-center gap-3 rounded-full border-2 border-sky-400 text-sky-400 px-8 py-4 text-lg font-semibold hover:bg-sky-400 hover:text-white transition-all duration-300 text-center">
                  <span>Lihat Layanan Kami</span>
                  <svg className="h-5 w-5 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </a>
                <a href="#contact" className="group inline-flex items-center gap-3 rounded-full border-2 border-emerald-400 text-emerald-400 px-8 py-4 text-lg font-semibold hover:bg-emerald-400 hover:text-white transition-all duration-300 text-center">
                  <span>Hubungi Kami</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </a>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-muted-foreground/80 text-xs uppercase tracking-[0.3em]">
                  Hubungi kami melalui <a href="/order" className="text-sky-400 hover:text-sky-300 transition-colors font-medium underline decoration-sky-400/30 hover:decoration-sky-400">form order</a> untuk konsultasi gratis dan dapatkan proposal custom sesuai kebutuhan bisnis Anda di Indonesia.
                </p>
              </div>
            </div>
          </div>
        </section>
        <Suspense fallback={<div className="content-vis py-20" />}>
          <ContactCTALazy />
        </Suspense>
      </div>
    </>
  );
};

export default Index;

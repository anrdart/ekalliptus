import { lazy, Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Hero } from "@/components/Hero";

const ServicesLazy = lazy(() => import("@/components/Services").then((m) => ({ default: m.Services })));
const ContactCTALazy = lazy(() => import("@/components/ContactCTA").then((m) => ({ default: m.ContactCTA })));

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
        <title>ekalliptus - Solusi Digital Terdepan | Website, WordPress, Mobile App, Editing Profesional</title>
        <meta name="description" content="Ekalliptus adalah digital agency terdepan di Indonesia yang menyediakan layanan website development, WordPress custom, aplikasi mobile Android iOS, service HP laptop, dan editing foto video berkualitas tinggi. Transformasi digital bisnis Anda dengan solusi teknologi modern." />
        <meta name="keywords" content="jasa pembuatan website Indonesia, WordPress custom Jakarta, mobile app development, service HP laptop, editing foto video profesional, digital agency, UI UX design, ekalliptus" />
        <link rel="canonical" href="https://ekalliptus.my.id/" />
        <meta property="og:title" content="ekalliptus - Solusi Digital Terdepan" />
        <meta property="og:description" content="Digital agency Indonesia spesialis website development, WordPress, mobile app, dan multimedia editing. Transformasi bisnis Anda dengan teknologi terdepan." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ekalliptus.my.id/" />
        <meta property="og:image" content="/assets/hero-bg.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ekalliptus - Solusi Digital Terdepan" />
        <meta name="twitter:description" content="Digital agency Indonesia untuk website, WordPress, mobile app, dan editing profesional. Solusi digital terdepan untuk bisnis modern." />
        <meta name="twitter:image" content="/assets/hero-bg.jpg" />
      </Helmet>
      <div className="relative flex flex-col gap-24 pb-24">
        <Hero />
        <div className="text-center py-8 px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ekalliptus - Solusi Digital Terdepan
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Transformasi bisnis Anda dengan website development Indonesia, WordPress custom Jakarta, mobile app development, dan layanan digital profesional lainnya.
          </p>
        </div>
        <Suspense fallback={<div className="content-vis py-20" />}>
          <ServicesLazy />
        </Suspense>
        <section id="about" className="content-vis relative px-4 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-12 max-w-4xl text-center">
              <h2 className="text-4xl font-semibold text-white md:text-5xl">Tentang ekalliptus</h2>
              <p className="mt-6 text-lg leading-relaxed text-white/70 md:text-xl">
                ekalliptus adalah digital agency berbasis di Indonesia yang spesialis dalam transformasi digital untuk bisnis modern. Dengan pengalaman lebih dari 5 tahun di industri, kami telah membantu ratusan klien dari UMKM hingga enterprise mencapai visi digital mereka. Layanan kami mencakup <a href="/order" className="text-sky-400 hover:underline">website development</a> yang responsif dan SEO-friendly, custom WordPress dengan plugin integrasi lengkap, pengembangan aplikasi mobile cross-platform menggunakan React Native dan Flutter, service perbaikan HP dan laptop dengan teknisi bersertifikat, serta editing foto dan video profesional untuk konten marketing yang impactful.
              </p>
              <p className="mt-4 text-base leading-relaxed text-white/60">
                Kami percaya bahwa setiap bisnis memiliki cerita unik yang perlu disampaikan melalui digital presence yang kuat. Oleh karena itu, pendekatan kami selalu berfokus pada user experience yang intuitif, performance tinggi, dan strategi SEO yang berkelanjutan. Tim ekalliptus terdiri dari developer berpengalaman, designer kreatif, dan project manager yang siap mendampingi proyek Anda dari konsep hingga launch. Sebagai solusi digital terdepan, ekalliptus memastikan setiap proyek website development, WordPress custom, atau mobile app development dioptimalkan untuk search engine Google dengan meta tags lengkap, structured data, dan konten berkualitas tinggi.
              </p>
              <p className="mt-4 text-base leading-relaxed text-white/60">
                Untuk layanan editing foto dan video, kami menggunakan software profesional seperti Adobe Premiere, After Effects, dan Photoshop untuk menghasilkan konten visual yang menarik dan sesuai brand. Service HP dan laptop kami melayani berbagai merek dengan garansi resmi dan teknisi terlatih. Kami juga menyediakan jasa pembuatan website Indonesia yang terjangkau namun berkualitas tinggi, WordPress custom Jakarta untuk kebutuhan bisnis lokal, dan mobile app development untuk startup dan perusahaan besar. Hubungi kami melalui <a href="/order" className="text-sky-400 hover:underline">form order</a> untuk konsultasi gratis dan dapatkan proposal custom sesuai kebutuhan bisnis Anda di Indonesia.
              </p>
              <p className="mt-4 text-base leading-relaxed text-white/60">
                Dengan fokus pada digital agency yang profesional, ekalliptus telah menjadi pilihan utama untuk service HP laptop di Jakarta dan sekitarnya. Kami mengutamakan kepuasan klien dengan memberikan hasil yang tidak hanya estetis namun juga fungsional. Setiap proyek website development Indonesia yang kami kerjakan selalu mengikuti best practices SEO terbaru untuk memastikan visibilitas maksimal di mesin pencari Google.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-6">
                <a href="/order" className="inline-block rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-8 py-4 text-lg font-semibold text-white transition hover:shadow-lg text-center">
                  Mulai Proyek Digital Anda
                </a>
                <a href="#services" className="inline-block rounded-full border-2 border-sky-400 text-sky-400 px-8 py-4 text-lg font-semibold hover:bg-sky-400 hover:text-white transition text-center">
                  Lihat Layanan Kami
                </a>
                <a href="#contact" className="inline-block rounded-full border-2 border-emerald-400 text-emerald-400 px-8 py-4 text-lg font-semibold hover:bg-emerald-400 hover:text-white transition text-center">
                  Hubungi Kami
                </a>
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

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
        <meta name="description" content="Ekalliptus menyediakan layanan website development, WordPress custom, aplikasi mobile Android iOS, service HP laptop, dan editing foto video berkualitas tinggi di Indonesia. Transformasi digital bisnis Anda dengan tim ahli kami." />
        <meta name="keywords" content="jasa pembuatan website Indonesia, WordPress custom Jakarta, mobile app development, service HP laptop, editing foto video profesional, digital agency, UI UX design" />
        <link rel="canonical" href="https://ekalliptus.my.id/" />
        <meta property="og:title" content="ekalliptus - Solusi Digital Terdepan" />
        <meta property="og:description" content="Layanan website development, WordPress, aplikasi mobile, dan editing foto/video profesional untuk bisnis modern di Indonesia" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ekalliptus.my.id/" />
        <meta property="og:image" content="/assets/hero-bg.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ekalliptus - Solusi Digital Terdepan" />
        <meta name="twitter:description" content="Transformasi digital dengan layanan website, WordPress, mobile app, dan multimedia editing profesional" />
        <meta name="twitter:image" content="/assets/hero-bg.jpg" />
      </Helmet>
      <div className="relative flex flex-col gap-24 pb-24">
        <Hero />
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
                Untuk layanan editing foto dan video, kami menggunakan software profesional seperti Adobe Premiere, After Effects, dan Photoshop untuk menghasilkan konten visual yang menarik dan sesuai brand. Service HP dan laptop kami melayani berbagai merek dengan garansi resmi dan teknisi terlatih. Hubungi kami melalui <a href="/order" className="text-sky-400 hover:underline">form order</a> untuk konsultasi gratis dan dapatkan proposal custom sesuai kebutuhan bisnis Anda di Indonesia.
              </p>
              <a href="/order" className="mt-8 inline-block rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-8 py-4 text-lg font-semibold text-white transition hover:shadow-lg">
                Mulai Proyek Digital Anda
              </a>
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

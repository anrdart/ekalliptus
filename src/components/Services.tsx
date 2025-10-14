import { ServiceCard } from "./ServiceCard";
import { Globe, Smartphone, Video, Code, Laptop } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

const services = [
  {
    icon: Globe,
    title: "Website Development",
    description: "Buat website profesional yang responsif dan user-friendly untuk bisnis Anda.",
    features: ["Responsive Design", "SEO Optimized", "Fast Loading", "Custom Domain"],
    url: "/order",
    category: "Development",
  },
  {
    icon: Code,
    title: "WordPress Development",
    description: "Kustomisasi WordPress sesuai kebutuhan dengan tema dan plugin terbaik.",
    features: ["Custom Theme", "Plugin Integration", "E-commerce Ready", "Content Management"],
    url: "/order",
    category: "Development",
  },
  {
    icon: Globe,
    title: "Berdu Platform",
    description: "Solusi platform berdu yang powerful untuk kebutuhan bisnis modern.",
    features: ["Admin Dashboard", "User Management", "Data Analytics", "Cloud Hosting"],
    url: "/order",
    category: "Platform",
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    description: "Aplikasi mobile Android & iOS yang inovatif dan mudah digunakan.",
    features: ["Cross Platform", "Native Performance", "Push Notifications", "App Store Ready"],
    url: "/order",
    category: "Development",
  },
  {
    icon: Laptop,
    title: "Service HP & Laptop",
    description:
      "Perbaikan perangkat oleh teknisi berpengalaman dengan dukungan suku cadang original.",
    features: [
      "Diagnosa Cepat",
      "Sparepart Original",
      "Perbaikan Software & Hardware",
      "Garansi Layanan",
    ],
    url: "/order",
    category: "Service",
  },
  {
    icon: Video,
    title: "Photo & Video Editing",
    description:
      "Editing profesional untuk foto dan video dengan hasil berkualitas tinggi.",
    features: ["Color Grading", "Motion Graphics", "Audio Mixing", "4K Quality"],
    url: "/order",
    category: "Multimedia",
  },
];

export const Services = () => {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });
  const base = "transition-all duration-700 ease-smooth will-change-transform motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100";
  const show = inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6";

  return (
    <section id="services" className="relative content-vis px-4 py-24">

      <div ref={ref} className="relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className={`inline-flex items-center gap-2 rounded-full border border-border/40 bg-card/25 px-5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.6em] text-muted-foreground ${base} ${show}`} style={{ transitionDelay: "80ms" }}>
            <span>Layanan Utama</span>
          </div>
          <h2 className={`text-4xl font-semibold text-foreground md:text-5xl ${base} ${show}`} style={{ transitionDelay: "150ms" }}>
            Transformasi digital dengan sentuhan berkelas
          </h2>
          <p className={`max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg ${base} ${show}`} style={{ transitionDelay: "220ms" }}>
            Kreasikan pengalaman digital yang berbeda dengan elemen 3D, glassmorphism, dan interaksi halus yang menjaga pengguna tetap terlibat di setiap langkah perjalanan mereka.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3" itemScope itemType="https://schema.org/OfferCatalog">
          {services.map((service, index) => (
            <article
              key={index}
              className={`${base} ${show}`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
              itemScope
              itemType="https://schema.org/Service"
            >
              <link itemProp="url" href={service.url} />
              <meta itemProp="serviceType" content={service.category} />
              <ServiceCard
                icon={service.icon}
                title={service.title}
                description={service.description}
                features={service.features}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

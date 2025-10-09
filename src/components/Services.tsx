import { ServiceCard } from "./ServiceCard";
import { Globe, Smartphone, Video, Code, Laptop } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

const services = [
  {
    icon: Globe,
    title: "Website Development",
    description: "Buat website profesional yang responsif dan user-friendly untuk bisnis Anda.",
    features: ["Responsive Design", "SEO Optimized", "Fast Loading", "Custom Domain"],
  },
  {
    icon: Code,
    title: "WordPress Development",
    description: "Kustomisasi WordPress sesuai kebutuhan dengan tema dan plugin terbaik.",
    features: ["Custom Theme", "Plugin Integration", "E-commerce Ready", "Content Management"],
  },
  {
    icon: Globe,
    title: "Berdu Platform",
    description: "Solusi platform berdu yang powerful untuk kebutuhan bisnis modern.",
    features: ["Admin Dashboard", "User Management", "Data Analytics", "Cloud Hosting"],
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    description: "Aplikasi mobile Android & iOS yang inovatif dan mudah digunakan.",
    features: ["Cross Platform", "Native Performance", "Push Notifications", "App Store Ready"],
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
  },
  {
    icon: Video,
    title: "Photo & Video Editing",
    description:
      "Editing profesional untuk foto dan video dengan hasil berkualitas tinggi.",
    features: ["Color Grading", "Motion Graphics", "Audio Mixing", "4K Quality"],
  },
];

export const Services = () => {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });
  const base = "transition-all duration-700 ease-smooth will-change-transform motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100";
  const show = inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6";

  return (
    <section id="services" className="relative content-vis px-4 py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#1d1b3f_0%,transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-40" />

      <div ref={ref} className="relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.6em] text-white/60 ${base} ${show}`} style={{ transitionDelay: "80ms" }}>
            <span>Layanan Utama</span>
          </div>
          <h2 className={`text-4xl font-semibold text-white md:text-5xl ${base} ${show}`} style={{ transitionDelay: "150ms" }}>
            Transformasi digital dengan sentuhan berkelas
          </h2>
          <p className={`max-w-3xl text-base leading-relaxed text-white/70 md:text-lg ${base} ${show}`} style={{ transitionDelay: "220ms" }}>
            Kreasikan pengalaman digital yang berbeda dengan elemen 3D, glassmorphism, dan interaksi halus yang menjaga pengguna tetap terlibat di setiap langkah perjalanan mereka.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <div
              key={index}
              className={`${base} ${show}`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
              <ServiceCard
                icon={service.icon}
                title={service.title}
                description={service.description}
                features={service.features}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

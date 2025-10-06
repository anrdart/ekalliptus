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
    <section className="py-20 px-4 bg-background content-vis">
      <div ref={ref} className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className={`text-4xl md:text-5xl font-bold text-foreground mb-6 ${base} ${show}`}
            style={{ transitionDelay: "100ms" }}
          >
            Layanan Kami
          </h2>
          <p
            className={`text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed ${base} ${show}`}
            style={{ transitionDelay: "200ms" }}
          >
            Kami menyediakan berbagai layanan digital yang komprehensif untuk membantu
            bisnis Anda berkembang di era digital
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

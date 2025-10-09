import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
}

export const ServiceCard = ({ icon: Icon, title, description, features }: ServiceCardProps) => {
  return (
    <Card className="group relative overflow-hidden p-8 text-left transition duration-500 hover:-translate-y-1.5">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 via-transparent to-emerald-400/20 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-6">
        <div className="inline-flex w-max items-center gap-3 rounded-full border border-white/10 bg-white/10 px-5 py-3">
          <div className="rounded-full bg-primary-gradient p-3 text-white shadow-glow transition duration-500 group-hover:scale-110">
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-xs uppercase tracking-[0.4em] text-white/60">Specialized</span>
        </div>

        <h3 className="text-2xl font-semibold text-white transition-colors duration-500 group-hover:text-sky-200">
          {title}
        </h3>

        <p className="text-base leading-relaxed text-white/65 transition-colors duration-500 group-hover:text-white/80">
          {description}
        </p>

        <ul className="mt-2 flex flex-col gap-3 text-sm text-white/70">
          {features.map((feature, index) => (
            <li
              key={index}
              className="flex items-center gap-3 rounded-full border border-white/5 bg-white/5 px-4 py-2 transition group-hover:border-white/15 group-hover:bg-white/8 group-hover:text-white"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-sky-400 to-emerald-300 transition group-hover:scale-125" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

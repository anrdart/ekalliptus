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
    <Card className="group relative overflow-hidden p-6 bg-card-gradient border border-border/50 transform-gpu will-change-transform transition-transform duration-300 ease-smooth hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-card">
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 ease-smooth group-hover:opacity-100 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      <div className="relative flex flex-col items-center text-center space-y-4">
        <div className="p-4 rounded-full bg-primary-gradient shadow-elegant transform-gpu will-change-transform transition-transform duration-300 ease-smooth group-hover:shadow-glow group-hover:-translate-y-1">
          <Icon className="h-8 w-8 text-primary-foreground transform-gpu will-change-transform transition-transform duration-300 ease-smooth group-hover:scale-110" />
        </div>

        <h3 className="text-xl font-bold text-foreground transition-colors duration-500 ease-smooth group-hover:text-primary">
          {title}
        </h3>

        <p className="text-muted-foreground leading-relaxed transition-colors duration-500 ease-smooth group-hover:text-foreground/90">
          {description}
        </p>

        <ul className="space-y-2 w-full">
          {features.map((feature, index) => (
            <li
              key={index}
              className="flex items-center justify-center space-x-2 text-sm text-muted-foreground transition-colors duration-500 ease-smooth group-hover:text-foreground"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-accent transform-gpu will-change-transform transition-transform duration-300 ease-smooth group-hover:scale-125" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

      </div>
    </Card>
  );
};

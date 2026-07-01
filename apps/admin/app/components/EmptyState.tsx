import React from "react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  ctaLabel, 
  ctaHref 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      {Icon && (
        <div className="h-12 w-12 rounded-full bg-muted/40 flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
      {ctaLabel && ctaHref && (
        <Link to={ctaHref} className="mt-4 inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}

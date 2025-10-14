import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-2xl border border-border/50 bg-card/30 px-4 py-3 text-sm text-foreground shadow-[0_20px_55px_-24px_rgba(56,189,248,0.3)] backdrop-blur-3xl placeholder:text-muted-foreground focus-visible:border-primary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0 hover:border-primary/30 disabled:cursor-not-allowed disabled:opacity-50",
        "supports-[backdrop-filter]:bg-card/40 supports-[backdrop-filter]:backdrop-blur-[36px]",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };

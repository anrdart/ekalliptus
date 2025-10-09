import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white shadow-[0_20px_55px_-24px_rgba(56,189,248,0.45)] backdrop-blur-3xl placeholder:text-white/60 focus-visible:border-sky-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-0 hover:border-sky-400/30 disabled:cursor-not-allowed disabled:opacity-50",
        "supports-[backdrop-filter]:bg-white/10 supports-[backdrop-filter]:backdrop-blur-[36px]",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };

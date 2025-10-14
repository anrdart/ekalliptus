import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full appearance-none rounded-2xl border border-border/50 bg-card/30 px-4 py-2.5 text-base text-foreground shadow-[0_18px_45px_-22px_rgba(56,189,248,0.28)] backdrop-blur-3xl transition placeholder:text-muted-foreground hover:border-primary/30 focus-visible:border-primary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0 md:text-sm",
          "file:mr-4 file:flex file:h-full file:items-center file:justify-center file:rounded-2xl file:border file:border-border/50 file:bg-card/40 file:px-6 file:py-2.5 file:text-xs file:font-semibold file:uppercase file:tracking-[0.32em] file:text-foreground file:leading-none file:transition file:cursor-pointer file:hover:bg-card/50",
          "supports-[backdrop-filter]:bg-card/40 supports-[backdrop-filter]:backdrop-blur-[36px]",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };

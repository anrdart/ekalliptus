import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full appearance-none rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-base text-white shadow-[0_18px_45px_-22px_rgba(56,189,248,0.42)] backdrop-blur-3xl transition focus-visible:border-sky-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-0 placeholder:text-white/60 hover:border-sky-400/30 md:text-sm",
          "file:mr-4 file:rounded-2xl file:border file:border-white/30 file:bg-white/15 file:px-6 file:py-2.5 file:text-xs file:font-semibold file:uppercase file:tracking-[0.32em] file:text-white file:leading-none file:h-full file:flex file:items-center file:justify-center file:hover:bg-white/25 file:cursor-pointer",
          "supports-[backdrop-filter]:bg-white/10 supports-[backdrop-filter]:backdrop-blur-[36px]",
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

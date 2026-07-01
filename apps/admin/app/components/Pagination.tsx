import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router";

interface PaginationProps {
  page: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({ page, totalPages, baseUrl }: PaginationProps) {
  const sep = baseUrl.includes("?") ? "&" : "?";
  
  // Strip out any existing page query param from baseUrl to avoid duplications
  const urlObj = new URL(baseUrl, "http://localhost");
  urlObj.searchParams.delete("page");
  const cleanBaseUrl = urlObj.pathname + urlObj.search;
  const cleanSep = cleanBaseUrl.includes("?") ? "&" : "?";

  const prevUrl = page > 1 ? `${cleanBaseUrl}${cleanSep}page=${page - 1}` : null;
  const nextUrl = page < totalPages ? `${cleanBaseUrl}${cleanSep}page=${page + 1}` : null;

  return (
    <nav className="flex items-center justify-between mt-4 text-sm" aria-label="Pagination">
      <p className="text-muted-foreground">Halaman {page} dari {totalPages}</p>
      <div className="flex gap-2">
        {prevUrl ? (
          <Link to={prevUrl} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 hover:bg-accent">
            <ChevronLeft className="h-4 w-4" /> Sebelumnya
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-muted-foreground opacity-50">
            <ChevronLeft className="h-4 w-4" /> Sebelumnya
          </span>
        )}
        {nextUrl ? (
          <Link to={nextUrl} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 hover:bg-accent">
            Selanjutnya <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-muted-foreground opacity-50">
            Selanjutnya <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </nav>
  );
}

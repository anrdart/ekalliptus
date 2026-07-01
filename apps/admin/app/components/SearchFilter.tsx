import React from "react";
import { Form, useSearchParams } from "react-router";
import { Search } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroup {
  name: string;
  label: string;
  selected: string;
  options: FilterOption[];
}

interface SearchFilterProps {
  placeholder?: string;
  value?: string;
  name?: string;
  action?: string;
  filters?: FilterGroup[];
}

export default function SearchFilter({
  placeholder = "Cari...",
  value = "",
  name = "search",
  action = "",
  filters = []
}: SearchFilterProps) {
  const [searchParams] = useSearchParams();

  return (
    <Form method="get" action={action} className="glass-panel rounded-2xl p-4 sm:p-5 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative w-full md:w-80">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="search"
          name={name}
          defaultValue={searchParams.get(name) || value}
          placeholder={placeholder}
          className="block w-full pl-9 pr-3 py-2 text-sm bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
        />
      </div>

      <div className="flex flex-wrap gap-3 w-full md:w-auto md:justify-end">
        {filters.map((filter) => (
          <label key={filter.name} className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide hidden sm:inline">{filter.label}</span>
            <select
              name={filter.name}
              defaultValue={searchParams.get(filter.name) || filter.selected}
              className="block rounded-xl border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        ))}
        
        <button
          type="submit"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition shadow-sm cursor-pointer"
        >
          Terapkan
        </button>
      </div>
    </Form>
  );
}

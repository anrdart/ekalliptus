import React from "react";

interface DataTableProps {
  headers: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function DataTable({ headers, children, className = "" }: DataTableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground [&>th]:pb-3">
            {headers}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
}

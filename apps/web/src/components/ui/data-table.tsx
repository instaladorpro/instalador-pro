'use client';

import type { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string;
}

function DataTable<T>({ columns, data, loading, emptyMessage = 'Nenhum registro encontrado', onRowClick, keyExtractor }: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface/50">
              {columns.map((col) => (
                <th key={col.key} className="text-left text-[11px] font-semibold text-muted uppercase tracking-wider px-5 py-3">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-3.5">
                    <div className="h-4 bg-surface rounded-lg animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white border border-border rounded-2xl p-10 text-center shadow-card">
        <p className="text-sm text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-2xl overflow-x-auto shadow-card">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-surface/50">
            {columns.map((col) => (
              <th key={col.key} className={`text-left text-[11px] font-semibold text-muted uppercase tracking-wider px-5 py-3 ${col.className || ''}`}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={`border-b border-border last:border-0 transition-colors duration-100 ${onRowClick ? 'cursor-pointer hover:bg-primary/[0.02] active:bg-primary/[0.04]' : ''}`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-5 py-3.5 text-sm text-foreground ${col.className || ''}`}>
                  {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { DataTable, type DataTableProps, type Column };

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
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="text-left text-xs font-medium text-secondary px-4 py-3">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t border-border">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 bg-surface rounded animate-pulse" />
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
      <div className="border border-border rounded-xl p-8 text-center">
        <p className="text-sm text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl overflow-x-auto">
      <table className="w-full">
        <thead className="bg-surface">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`text-left text-xs font-medium text-secondary px-4 py-3 ${col.className || ''}`}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={`border-t border-border transition-colors ${onRowClick ? 'cursor-pointer hover:bg-surface/50' : ''}`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 text-sm text-foreground ${col.className || ''}`}>
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

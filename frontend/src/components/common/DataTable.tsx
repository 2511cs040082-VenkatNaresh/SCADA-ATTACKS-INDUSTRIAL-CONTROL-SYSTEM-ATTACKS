import React from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  isMono?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  emptyMessage = 'No records found',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-soc-textMuted font-mono bg-soc-bg/40 rounded border border-soc-panelBorder">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded border border-soc-panelBorder">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-soc-header/80 text-soc-textSecondary uppercase font-mono text-[10px] tracking-wider border-b border-soc-panelBorder">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={`px-3 py-2.5 font-semibold ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-soc-panelBorder bg-soc-panel/60">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-slate-800/50 transition-colors">
              {columns.map((col, idx) => {
                const cellContent =
                  typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as React.ReactNode);

                return (
                  <td
                    key={idx}
                    className={`px-3 py-2 text-soc-textPrimary whitespace-nowrap ${
                      col.isMono ? 'font-mono text-soc-telemetry' : ''
                    } ${col.className || ''}`}
                  >
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

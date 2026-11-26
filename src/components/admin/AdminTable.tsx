import type { ReactNode } from "react";

export default function AdminTable({ label, columns, rows }: { label: string; columns: string[]; rows: { id: string; cells: ReactNode[] }[] }) {
  if (!rows.length) return <p role="status" className="w-full rounded-xl border border-navy/15 bg-white p-6 text-slate">No records to display.</p>;
  return (
    <div role="region" aria-label={label} tabIndex={0} className="w-full min-w-0 overflow-x-auto rounded-xl border border-navy/15 bg-white shadow-sm shadow-navy/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{label}</caption>
        <thead className="bg-navy text-white"><tr>{columns.map((column) => <th key={column} scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">{column}</th>)}</tr></thead>
        <tbody className="divide-y divide-navy/10">{rows.map((row) => <tr key={row.id} className="even:bg-paper/70 transition-colors hover:bg-gold/10 motion-reduce:transition-none">{row.cells.map((cell, index) => <td key={index} className="min-w-32 px-5 py-5 align-top leading-6 whitespace-pre-wrap wrap-anywhere">{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function adminDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(date) + " UTC";
}

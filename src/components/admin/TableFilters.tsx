import Link from "next/link";

const control = "mt-2 min-h-12 w-full rounded-md border border-navy/20 bg-paper/40 px-4 py-3 text-sm text-navy focus-visible:outline-2 focus-visible:outline-gold";
export default function TableFilters({ kind, q, status, type = "all", invalid = false }: { kind: "certificates" | "requests"; q: string; status: string; type?: string; invalid?: boolean }) {
  const certificates = kind === "certificates";
  const statuses = certificates ? ["VALID", "REVOKED", "EXPIRED"] : ["NEW", "IN_PROGRESS", "CLOSED"];
  return <form method="get" action={`/admin/${kind}`} aria-label={`Filter ${kind}`} className="my-6 w-full rounded-xl border border-navy/15 bg-white p-5 shadow-sm shadow-navy/5 sm:p-6">
    <div className="flex flex-wrap items-end gap-4">
      <label className="min-w-0 flex-[2_1_16rem] text-sm font-semibold">{certificates ? "Recipient name or certificate number" : "Name or email"}<input type="search" name="q" defaultValue={q} maxLength={191} placeholder={certificates ? "Search certificates…" : "Search enquiries…"} className={control} /></label>
      <label className="min-w-0 flex-[1_1_11rem] text-sm font-semibold">Status<select name="status" defaultValue={status} className={control}><option value="">All statuses</option>{statuses.map(value => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select></label>
      {!certificates && <fieldset className="min-w-0 flex-[1_1_16rem]"><legend className="text-sm font-semibold">Request type</legend><div className="mt-2 flex min-h-12 flex-wrap items-center gap-1 rounded-md border border-navy/20 bg-paper/40 p-1">{["all", "training", "quote"].map(value => <label key={value} className="relative flex-1 cursor-pointer text-center text-sm"><input type="radio" name="type" value={value} defaultChecked={type === value} className="peer sr-only" /><span className="block rounded-sm px-3 py-2 capitalize text-slate peer-checked:bg-navy peer-checked:font-semibold peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-gold">{value}</span></label>)}</div></fieldset>}
      <div className="flex min-h-12 items-center gap-4"><button type="submit" className="min-h-12 rounded-md bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-navy/85 focus-visible:outline-2 focus-visible:outline-gold">Apply filters</button><Link href={`/admin/${kind}`} className="rounded-sm py-3 text-sm font-semibold text-slate underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-gold">Reset</Link></div>
    </div>
    {invalid && <p role="alert" className="mt-4 text-sm text-red-700">Invalid filters. Use one search value of up to 191 characters and the available status/type choices, or reset the filters.</p>}
  </form>;
}

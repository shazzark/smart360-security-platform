export function ContentNotice({ children }: { children: React.ReactNode }) {
  return <p role="status" className="rounded-sm border border-navy/15 bg-white p-6 leading-7 text-slate">{children}</p>;
}

export function LoadingContent() {
  return <ContentNotice>Loading content…</ContentNotice>;
}

export function UnavailableContent() {
  return <ContentNotice>Content is temporarily unavailable. Please try again later.</ContentNotice>;
}

export function MockContentNotice() {
  return <p className="mb-8 border-l-2 border-gold pl-4 text-sm leading-6 text-slate">Preview content may include mock records and illustrations. Services, programme durations, fees, and company photographs require approval.</p>;
}

import Link from "next/link";

const links = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Training", href: "/programmes" },
  { label: "Blog", href: "/blog" },
  { label: "Gallery", href: "/gallery" },
  { label: "Verify Certificate", href: "/verify" },
  { label: "Contact", href: "/contact" },
  { label: "Request Quote", href: "/request-quote" },
];

export default function Footer() {
  return (
    <footer className="bg-navy-deep text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr] lg:py-16">
        <div>
          <Link href="/" className="inline-block rounded-sm text-2xl font-extrabold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">SMART360<span className="text-gold">.</span></Link>
          <p className="mt-2 text-sm text-white/75">Security Consultancy</p>
          <p className="mt-6 max-w-xs text-sm leading-7 text-white/65">A considered approach to security, training, and preparedness.</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Explore Smart360</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1">{links.map(({ label, href }) => <li key={href}><Link href={href} className="inline-flex min-h-11 items-center rounded-sm text-sm text-white/70 underline-offset-4 hover:text-gold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">{label}</Link></li>)}</ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Contact information</h2>
          <p className="mt-5 text-sm leading-7 text-white/65">Email: to be confirmed<br />Phone: to be confirmed<br />Office address: to be confirmed</p>
          <p className="mt-4 text-xs leading-5 text-white/55">Contact details will be published after approval.</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 text-xs leading-6 text-white/60 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© 2026 Smart360 Security Consultancy. All rights reserved.</p>
          <Link href="/privacy" className="w-fit rounded-sm underline-offset-4 hover:text-gold hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">Privacy notice</Link>
        </div>
      </div>
    </footer>
  );
}

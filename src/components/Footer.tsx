import Link from "next/link";

const footerLinks = [
  { label: "Services", href: "/#services" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Contact", href: "/#contact" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-ambuhub-100 bg-ambuhub-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <p className="text-lg font-semibold text-ambuhub-brand">Ambuhub</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">
              A marketplace to book ambulance standby, hire personnel, and buy or
              sell equipment—with clear profiles and straightforward coordination.
            </p>
          </div>
          <nav
            className="flex flex-wrap gap-x-8 gap-y-3"
            aria-label="Footer navigation"
          >
            {footerLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-ambuhub-brand"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-10 border-t border-ambuhub-200 pt-8 text-xs leading-relaxed text-foreground/55">
          Ambuhub is a booking and marketplace platform. If someone needs
          immediate professional medical care, contact your local medical helpline
          or public ambulance service right away.
        </p>
        <p className="mt-4 text-center text-sm text-foreground/50 md:text-left">
          &copy; {new Date().getFullYear()} Ambuhub. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

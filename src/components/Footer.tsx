import Link from "next/link";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  X,
} from "lucide-react";

const quickLinks = [
  { label: "Home", href: "/#top" },
  { label: "Services", href: "/#services" },
  { label: "How to use", href: "/#how-to-use" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Contact", href: "/#contact" },
] as const;

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Cookie Policy", href: "/cookie-policy" },
] as const;

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    icon: Facebook,
  },
  {
    label: "X (Twitter)",
    href: "https://twitter.com/",
    icon: X,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    icon: Instagram,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    icon: Linkedin,
  },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="lg:pr-4">
            <p className="text-lg font-bold tracking-tight">Ambuhub</p>
            <p className="mt-4 text-sm leading-relaxed text-white/75">
              Connecting organizers and patients to emergency medical coverage
              and equipment through one marketplace. We are building a clearer way
              to list, compare, and book standby, transport, personnel, and kit.
            </p>
          </div>

          <div>
            <p className="text-sm font-bold tracking-wide text-white">Quick Links</p>
            <nav className="mt-4 flex flex-col gap-3" aria-label="Footer quick links">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-white/80 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-sm font-bold tracking-wide text-white">Contact Us</p>
            <ul className="mt-4 flex flex-col gap-4 text-sm text-white/80">
              <li className="flex gap-3">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-white/60"
                  aria-hidden
                />
                <span>Lagos, Nigeria</span>
              </li>
              <li className="flex gap-3">
                <Phone
                  className="mt-0.5 h-4 w-4 shrink-0 text-white/60"
                  aria-hidden
                />
                <a
                  href="tel:+2348000000000"
                  className="transition-colors hover:text-white"
                >
                  +234 800 000 0000
                </a>
              </li>
              <li className="flex gap-3">
                <Mail
                  className="mt-0.5 h-4 w-4 shrink-0 text-white/60"
                  aria-hidden
                />
                <a
                  href="mailto:hello@ambuhub.example"
                  className="break-all transition-colors hover:text-white"
                >
                  hello@ambuhub.example
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold tracking-wide text-white">Follow Us</p>
            <ul className="mt-4 flex flex-wrap gap-3">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:border-white/30 hover:bg-white/10"
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/55 sm:text-sm">
              &copy; {year} Ambuhub. All rights reserved.
            </p>
            <nav
              className="flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm"
              aria-label="Legal"
            >
              {legalLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-white/70 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <p className="mt-6 max-w-3xl text-xs leading-relaxed text-white/45">
            Ambuhub is a booking and marketplace platform. If someone needs immediate
            professional medical care, contact your local medical helpline or public
            ambulance service right away.
          </p>
        </div>
      </div>
    </footer>
  );
}

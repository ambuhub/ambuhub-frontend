"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Home", href: "#top" },
  { label: "Services", href: "#services" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ambuhub-100 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.25rem] sm:px-6 lg:px-8">
        <Link
          href="#top"
          className="flex shrink-0 items-center gap-3 rounded-lg outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ambuhub-brand"
          onClick={() => setOpen(false)}
        >
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-ambuhub-200 bg-white sm:h-11 sm:w-11">
            <Image
              src="/logo.svg"
              alt="Ambuhub"
              width={44}
              height={44}
              className="object-contain p-1"
              priority
            />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            Ambuhub
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-ambuhub-50 hover:text-ambuhub-brand"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="#contact"
            className="ml-2 rounded-lg bg-ambuhub-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ambuhub-brand-dark"
          >
            Get started
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-foreground md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-ambuhub-100 bg-white md:hidden"
          >
            <motion.nav
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="flex flex-col gap-1 px-4 py-4"
              aria-label="Mobile navigation"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-3 text-base font-medium text-foreground/90 hover:bg-ambuhub-50"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="#contact"
                className="mt-2 rounded-lg bg-ambuhub-brand px-3 py-3 text-center text-base font-semibold text-white"
                onClick={() => setOpen(false)}
              >
                Get started
              </Link>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

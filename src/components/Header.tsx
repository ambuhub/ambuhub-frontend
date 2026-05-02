"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useSessionAndCart } from "@/components/session-cart/SessionCartProvider";
import { postAuthPath } from "@/lib/auth-redirect";

function authHrefWithReturnTo(pathname: string | null): string {
  if (
    pathname &&
    pathname.startsWith("/services/") &&
    !pathname.startsWith("/auth")
  ) {
    return `/auth?next=${encodeURIComponent(pathname)}`;
  }
  return `/auth?next=${encodeURIComponent("/checkout")}`;
}

const navItems = [
  { label: "Home", href: "/#top" },
  { label: "Services", href: "/#services" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Contact", href: "/#contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, itemCount } = useSessionAndCart();
  const accountHref = user ? postAuthPath(user.role) : "/auth";
  const accountLabel = user ? "Dashboard" : "Log in";
  const cartHref = user ? "/checkout" : authHrefWithReturnTo(pathname);
  const cartTitle = user
    ? itemCount > 0
      ? `Cart, ${itemCount} items`
      : "Cart"
    : "Log in to use your cart";

  return (
    <header className="sticky top-0 z-50 border-b border-ambuhub-100 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.25rem] sm:px-6 lg:px-8">
        <Link
          href="/"
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
            href={cartHref}
            title={cartTitle}
            aria-label={cartTitle}
            className="relative inline-flex items-center gap-1.5 rounded-lg px-3 py-2 pr-4 text-sm font-medium text-foreground/80 transition-colors hover:bg-ambuhub-50 hover:text-ambuhub-brand"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden />
            Cart
            {user && itemCount > 0 ? (
              <span className="absolute -right-0.5 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-ambuhub-brand px-1 text-xs font-bold tabular-nums text-white ring-2 ring-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </Link>
          <Link
            href={accountHref}
            className="ml-1 rounded-lg border border-ambuhub-200 bg-white px-4 py-2 text-sm font-semibold text-ambuhub-brand transition-colors hover:bg-ambuhub-50"
          >
            {accountLabel}
          </Link>
          <Link
            href="/#contact"
            className="ml-2 rounded-lg bg-ambuhub-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ambuhub-brand-dark"
          >
            Get started
          </Link>
        </nav>

        <div className="flex items-center gap-0.5 md:hidden">
          <Link
            href={cartHref}
            title={cartTitle}
            aria-label={cartTitle}
            className="relative inline-flex items-center justify-center rounded-lg p-2 text-foreground hover:bg-ambuhub-50"
          >
            <ShoppingCart className="h-6 w-6" aria-hidden />
            {user && itemCount > 0 ? (
              <span className="absolute right-0.5 top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-ambuhub-brand px-0.5 text-[10px] font-bold tabular-nums text-white ring-2 ring-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-foreground"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
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
                href={cartHref}
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-semibold text-ambuhub-brand hover:bg-ambuhub-50"
                onClick={() => setOpen(false)}
              >
                <ShoppingCart className="h-5 w-5" aria-hidden />
                {user ? "Cart" : "Cart (log in)"}
                {user && itemCount > 0 ? (
                  <span className="rounded-full bg-ambuhub-brand px-2 py-0.5 text-xs font-bold text-white">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                ) : null}
              </Link>
              <Link
                href={accountHref}
                className="mt-1 rounded-lg border border-ambuhub-200 px-3 py-3 text-center text-base font-semibold text-ambuhub-brand hover:bg-ambuhub-50"
                onClick={() => setOpen(false)}
              >
                {accountLabel}
              </Link>
              <Link
                href="/#contact"
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

"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

type Props = {
  receiptNumber: string;
  marketplaceHref: string;
  message?: string;
};

export function CheckoutSuccessPanel({
  receiptNumber,
  marketplaceHref,
  message = "Your payment was completed successfully.",
}: Props) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <div className="mt-10 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white p-8 text-center shadow-sm sm:p-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <CheckCircle2 className="h-8 w-8" aria-hidden />
      </div>
      <h2 className="mt-5 text-xl font-bold text-foreground sm:text-2xl">
        Payment complete
      </h2>
      <p className="mt-2 text-sm text-foreground/70 sm:text-base">{message}</p>
      <p className="mt-4 font-mono text-xs text-foreground/50">
        Receipt {receiptNumber}
      </p>
      <Link
        href={marketplaceHref}
        className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-ambuhub-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-ambuhub-brand-dark sm:w-auto"
      >
        Go back to marketplace
      </Link>
    </div>
  );
}

"use client";

import Link from "next/link";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ServiceCategoryError({ error, reset }: ErrorProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-slate-900">
        Could not load this category
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        The service may be temporarily unavailable. Please try again in a
        moment.
      </p>
      {process.env.NODE_ENV === "development" && error.message ? (
        <p className="mt-4 max-w-lg text-xs text-slate-500">{error.message}</p>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

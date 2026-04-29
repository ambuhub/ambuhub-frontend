import Link from "next/link";

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-foreground">Cookie Policy</h1>
      <p className="mt-4 text-sm leading-relaxed text-foreground/70">
        How Ambuhub uses cookies and similar technologies will be described here.
        Content is not yet published.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block text-sm font-semibold text-ambuhub-brand hover:underline"
      >
        Back to home
      </Link>
    </div>
  );
}

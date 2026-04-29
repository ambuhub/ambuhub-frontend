import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
      <p className="mt-4 text-sm leading-relaxed text-foreground/70">
        This policy will describe how Ambuhub collects, uses, and protects your
        information. Content is not yet published.
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

"use client";

import {
  BookOpen,
  Check,
  Copy,
  Gift,
  Loader2,
  Share2,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { fetchMyReferral, type MyReferral } from "@/lib/referrals";

export default function ClientReferralPage() {
  const [referral, setReferral] = useState<MyReferral | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyReferral();
      setReferral(data);
    } catch (err) {
      setReferral(null);
      setError(
        err instanceof Error ? err.message : "Could not load referral details.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCopy() {
    if (!referral?.referralUrl) return;
    try {
      await navigator.clipboard.writeText(referral.referralUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy the link. Select and copy it manually.");
    }
  }

  async function handleShare() {
    if (!referral?.referralUrl) return;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Join Ambuhub",
          text: "Sign up on Ambuhub with my referral link.",
          url: referral.referralUrl,
        });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    await handleCopy();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Referral
        </h1>
        <p className="mt-2 text-foreground/70">
          Share your link. When someone creates a client account with it, you
          unlock a free Ambuhub e-book.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-ambuhub-100 bg-white py-20">
          <Loader2
            className="h-8 w-8 animate-spin text-ambuhub-brand"
            aria-label="Loading referral"
          />
        </div>
      ) : error ? (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800"
          role="alert"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-3 text-sm font-semibold text-red-900 underline"
          >
            Try again
          </button>
        </div>
      ) : referral ? (
        <>
          <section className="rounded-2xl border border-ambuhub-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-800">
                <Share2 className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-foreground">
                  Your referral link
                </h2>
                <p className="mt-1 text-sm text-foreground/65">
                  Code{" "}
                  <span className="font-mono font-semibold tracking-wide text-foreground">
                    {referral.referralCode}
                  </span>
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    readOnly
                    value={referral.referralUrl}
                    className="w-full min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs text-slate-800 sm:text-sm"
                    aria-label="Referral link"
                    onFocus={(e) => e.currentTarget.select()}
                  />
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => void handleCopy()}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-ambuhub-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-ambuhub-brand-dark sm:flex-none"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" aria-hidden />
                      ) : (
                        <Copy className="h-4 w-4" aria-hidden />
                      )}
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleShare()}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 sm:flex-none"
                    >
                      <Share2 className="h-4 w-4" aria-hidden />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-2xl border border-ambuhub-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground/70">
                <Users className="h-4 w-4 text-ambuhub-brand" aria-hidden />
                Successful referrals
              </div>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                {referral.successfulReferralCount}
              </p>
              <p className="mt-1 text-sm text-foreground/60">
                Client accounts created with your link
              </p>
            </section>

            <section className="rounded-2xl border border-ambuhub-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground/70">
                <Gift className="h-4 w-4 text-ambuhub-brand" aria-hidden />
                E-book reward
              </div>
              {referral.ebookRewardUnlocked ? (
                <div className="mt-3 space-y-3">
                  <p className="text-sm font-medium text-emerald-800">
                    Unlocked — thanks for referring Ambuhub.
                  </p>
                  {referral.ebookUrl ? (
                    <a
                      href={referral.ebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                      <BookOpen className="h-4 w-4" aria-hidden />
                      Download e-book
                    </a>
                  ) : (
                    <p className="text-sm text-foreground/65">
                      Your reward is unlocked. The download link will appear here
                      once the e-book file is configured.
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm text-foreground/65">
                  Invite one friend with your link to unlock the free e-book.
                </p>
              )}
            </section>
          </div>

          <section className="rounded-2xl border border-dashed border-ambuhub-200 bg-ambuhub-50/50 px-5 py-5 text-sm text-foreground/70">
            <ol className="list-decimal space-y-2 pl-5">
              <li>Copy or share your referral link.</li>
              <li>They open it and create a client account.</li>
              <li>Your free e-book unlocks on this page.</li>
            </ol>
          </section>
        </>
      ) : null}
    </div>
  );
}

"use client";

import { Loader2, Star } from "lucide-react";
import { useState } from "react";
import { postReview } from "@/lib/reviews";

type Props = {
  orderId: string;
  serviceId: string;
  serviceTitle: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  compact?: boolean;
};

export function ReviewForm({
  orderId,
  serviceId,
  serviceTitle,
  onSuccess,
  onCancel,
  compact = false,
}: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const display = hover || rating;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError("Choose a star rating from 1 to 5.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await postReview({ orderId, serviceId, rating, body });
      setRating(0);
      setBody("");
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit review.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className={
        compact
          ? "space-y-3"
          : "rounded-2xl border border-ambuhub-100 bg-white p-5 shadow-sm sm:p-6"
      }
    >
      {!compact ? (
        <p className="text-sm font-semibold text-foreground">{serviceTitle}</p>
      ) : null}

      <fieldset className="border-0 p-0">
        <legend className="sr-only">Rating</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className="rounded p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ambuhub-brand"
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
            >
              <Star
                className={`h-8 w-8 ${
                  n <= display
                    ? "fill-amber-400 text-amber-400"
                    : "text-ambuhub-200"
                }`}
                aria-hidden
              />
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor={`review-body-${serviceId}`}
          className="block text-sm font-medium text-foreground"
        >
          Your review
        </label>
        <textarea
          id={`review-body-${serviceId}`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={compact ? 3 : 4}
          maxLength={2000}
          placeholder="Share what went well or what could improve (min. 10 characters)."
          className="mt-1.5 w-full resize-y rounded-xl border border-ambuhub-200 px-4 py-3 text-sm text-foreground outline-none focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25"
        />
        <p className="mt-1 text-xs text-foreground/55">{body.length} / 2000</p>
      </div>

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className={`flex flex-wrap gap-2 ${compact ? "" : "pt-1"}`}>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-ambuhub-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ambuhub-brand-dark disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          Submit review
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-xl border border-ambuhub-200 bg-white px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-ambuhub-50 disabled:opacity-60"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

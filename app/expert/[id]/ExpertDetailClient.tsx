"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  business: { name: string };
};

export function ExpertDetailClient({
  expertId,
  reviews,
}: {
  expertId: string;
  reviews: Review[];
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  async function handleQuoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) {
      router.push(`/login?callbackUrl=/expert/${expertId}`);
      return;
    }
    setQuoteError("");
    setQuoteLoading(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expertId,
          description,
          budget: budget ? parseFloat(budget) : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setQuoteError(data.error ?? "Failed to send quote request");
        setQuoteLoading(false);
        return;
      }
      setQuoteSuccess(true);
      setDescription("");
      setBudget("");
      router.refresh();
    } catch {
      setQuoteError("Something went wrong");
    }
    setQuoteLoading(false);
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) {
      router.push(`/login?callbackUrl=/expert/${expertId}`);
      return;
    }
    setReviewError("");
    setReviewLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expertId,
          rating: reviewRating,
          comment: reviewComment.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setReviewError(data.error ?? "Failed to submit review");
        setReviewLoading(false);
        return;
      }
      setReviewSuccess(true);
      setReviewComment("");
      setReviewRating(5);
      router.refresh();
    } catch {
      setReviewError("Something went wrong");
    }
    setReviewLoading(false);
  }

  const isBusiness = (session?.user as { id?: string; role?: string })?.role !== "EXPERT";
  // We don't have role in session - assume any logged-in user can request quote; API will enforce business-only
  const canRequestQuote = session && status === "authenticated";
  const canLeaveReview = session && status === "authenticated";

  return (
    <div className="space-y-10">
      {/* Quote request */}
      <section className="rounded-xl border border-amber-200/50 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-stone-800">
          Request a quote
        </h2>
        {!session ? (
          <p className="text-stone-600">
            <Link
              href={`/login?callbackUrl=/expert/${expertId}`}
              className="font-medium text-teal-600 hover:underline"
            >
              Sign in
            </Link>{" "}
            as a business to request a quote from this expert.
          </p>
        ) : quoteSuccess ? (
          <p className="rounded-lg bg-teal-50 px-4 py-2 text-sm text-teal-800">
            Quote request sent. The expert will get back to you soon.
          </p>
        ) : (
          <form onSubmit={handleQuoteSubmit} className="flex flex-col gap-4">
            {quoteError && (
              <div className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
                {quoteError}
              </div>
            )}
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-stone-700">
                Describe your needs
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="rounded-lg border border-stone-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="e.g. Monthly bookkeeping, year-end tax prep, AR process review..."
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-stone-700">
                Budget (optional)
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-40 rounded-lg border border-stone-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="e.g. 500"
              />
            </label>
            <button
              type="submit"
              disabled={quoteLoading}
              className="w-fit rounded-full bg-teal-600 px-6 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {quoteLoading ? "Sending…" : "Send quote request"}
            </button>
          </form>
        )}
      </section>

      {/* Reviews */}
      <section className="rounded-xl border border-amber-200/50 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-stone-800">Reviews</h2>

        {reviews.length === 0 && !reviewSuccess ? (
          <p className="text-stone-500">No reviews yet. Be the first to leave one.</p>
        ) : (
          <ul className="mb-8 space-y-4">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="border-b border-stone-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-800">{r.business.name}</span>
                  <span className="text-amber-600">
                    {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                  </span>
                  <span className="text-xs text-stone-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {r.comment && (
                  <p className="mt-1 text-sm text-stone-600">{r.comment}</p>
                )}
              </li>
            ))}
          </ul>
        )}

        {canLeaveReview && (
          <>
            <h3 className="mb-3 text-sm font-semibold text-stone-700">
              Leave a review
            </h3>
            {reviewSuccess ? (
              <p className="rounded-lg bg-teal-50 px-4 py-2 text-sm text-teal-800">
                Thank you! Your review has been posted.
              </p>
            ) : (
              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                {reviewError && (
                  <div className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
                    {reviewError}
                  </div>
                )}
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-stone-700">Rating</span>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-24 rounded-lg border border-stone-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} ★
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-stone-700">
                    Comment (optional)
                  </span>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                    className="rounded-lg border border-stone-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="Share your experience..."
                  />
                </label>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="w-fit rounded-full bg-amber-500 px-6 py-2 font-medium text-white hover:bg-amber-600 disabled:opacity-60"
                >
                  {reviewLoading ? "Submitting…" : "Submit review"}
                </button>
              </form>
            )}
          </>
        )}

        {!session && (
          <p className="text-stone-600">
            <Link
              href={`/login?callbackUrl=/expert/${expertId}`}
              className="font-medium text-teal-600 hover:underline"
            >
              Sign in
            </Link>{" "}
            to leave a review.
          </p>
        )}
      </section>
    </div>
  );
}

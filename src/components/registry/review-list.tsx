"use client";

import StarRating from "./star-rating";

export interface Review {
  /** Reviewer name. */
  name: string;
  /** Rating 1-5. */
  rating: number;
  /** Review title. */
  title: string;
  /** Review body. */
  body: string;
  /** Review date (ISO string). */
  date: string;
}

export interface ReviewListProps {
  /** Reviews to display. */
  reviews: Review[];
  /** Message shown when there are no reviews. */
  emptyMessage?: string;
  /** Heading rendered above the list. */
  heading?: string;
}

export default function ReviewList({
  reviews,
  emptyMessage = "No reviews yet. Be the first to share your thoughts.",
  heading = "Customer reviews",
}: ReviewListProps) {
  if (!reviews.length) {
    return (
      <section aria-label="Customer reviews" className="mt-6">
        <h2 className="text-sm font-semibold text-smoke uppercase tracking-[0.1em]">
          {heading}
        </h2>
        <p className="mt-1 text-sm text-ash">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section aria-label="Customer reviews" className="mt-6 space-y-4">
      <h2 className="text-sm font-semibold text-smoke uppercase tracking-[0.1em]">
        {heading} ({reviews.length})
      </h2>
      <div className="mt-2 space-y-4">
        {reviews.map((review, i) => (
          <article
            key={`${review.name}-${review.date}-${i}`}
            className="rounded-xl border border-white/10 bg-[var(--color-paper)]/5 p-4"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex items-baseline gap-1.5">
                  <StarRating
                    value={Math.max(0, Math.min(5, Math.round(review.rating)))}
                    readOnly
                    size="md"
                    aria-label={`Rated ${review.rating} out of 5 stars`}
                  />
                  <span className="text-sm font-medium text-gold">
                    {review.rating}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-smoke">{review.title}</h3>
              </div>
              <p className="text-xs text-ash text-right sm:text-left">
                {review.date}
              </p>
            </div>
            <p className="mt-3 text-sm text-smoke leading-relaxed">
              {review.body}
            </p>
            <p className="mt-2 text-xs text-ash">{review.name}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

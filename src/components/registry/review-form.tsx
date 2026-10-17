"use client";

import { useState, type FormEvent } from "react";
import StarRating from "./star-rating";

export interface ReviewFormProps {
  /** Callback fired when the review is submitted. */
  onSubmit?: (review: { rating: number; title: string; body: string }) => void;
  /** Pre-selected rating (0 = none). */
  initialRating?: number;
  /** Disabled state (e.g. while submitting or when not logged in). */
  disabled?: boolean;
  /** Label shown above the star input. */
  ratingLabel?: string;
  /** Submit button label. */
  submitLabel?: string;
}

export default function ReviewForm({
  onSubmit,
  initialRating = 0,
  disabled = false,
  ratingLabel = "Rating",
  submitLabel = "Submit review",
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    if (!title.trim() && !body.trim()) return;
    setSubmitting(true);
    onSubmit?.({ rating, title: title.trim(), body: body.trim() });
    setSubmitting(false);
    setTitle("");
    setBody("");
    setRating(0);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      noValidate
    >
      <div className="space-y-2">
        <label htmlFor="review-rating" className="block text-sm font-medium text-smoke">
          {ratingLabel}
        </label>
        <div className="flex items-center gap-2">
          <StarRating
            value={rating}
            onChange={setRating}
            readOnly={disabled}
            size="lg"
            aria-label="Rate this product 1 to 5 stars"
          />
          {!rating && !disabled && (
            <span className="text-xs text-ash">Select a rating</span>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="review-title" className="block text-sm font-medium text-smoke">
          Title
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your review a title"
          maxLength={80}
          disabled={disabled}
          className="w-full rounded border border-white/20 bg-[#FBF6F3]/10 px-3 py-2 text-sm text-smoke placeholder:text-ash/60 focus:ring-2 focus:ring-gold outline-none disabled:opacity-50 disabled:pointer-events-none"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="review-body" className="block text-sm font-medium text-smoke">
          Review
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Fit, fabric, delivery…"
          rows={4}
          maxLength={1000}
          disabled={disabled}
          className="w-full rounded border border-white/20 bg-[#FBF6F3]/10 px-3 py-2 text-sm text-smoke placeholder:text-ash/60 focus:ring-2 focus:ring-gold outline-none disabled:opacity-50 disabled:pointer-events-none"
        />
      </div>

      <button
        type="submit"
        disabled={!rating || disabled || submitting}
        className="w-full md:w-auto rounded-full bg-gold px-5 py-2 text-sm font-medium text-black uppercase tracking-[0.1em] hover:bg-gold-dark disabled:opacity-50 disabled:pointer-events-none"
      >
        {submitting ? "Submitting…" : submitLabel}
      </button>
    </form>
  );
}

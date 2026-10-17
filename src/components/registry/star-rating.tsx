"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/format";

export type StarSize = "sm" | "md" | "lg";

export interface StarRatingProps {
  /** Currently selected rating (0 = none, 1-5 = stars filled). */
  value?: number;
  /** Callback fired when the user selects a rating. */
  onChange?: (rating: number) => void;
  /** Read-only display mode (no interaction). */
  readOnly?: boolean;
  /** Accessible label for the rating group. */
  ariaLabel?: string;
  /** Star size. */
  size?: StarSize;
  /** Clicking the currently selected value clears it (back to 0). */
  clearable?: boolean;
  /** Disabled state. */
  disabled?: boolean;
}

const STAR_SIZE: Record<StarSize, { width: string; height: string }> = {
  sm: { width: "16px", height: "16px" },
  md: { width: "20px", height: "20px" },
  lg: { width: "24px", height: "24px" },
};

function Star({
  filled,
  size,
  hovered,
}: {
  filled: boolean;
  size: StarSize;
  hovered: boolean;
}) {
  const { width, height } = STAR_SIZE[size];
  const active = filled || hovered;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      className={cn(
        "transition-colors duration-150 shrink-0",
        active
          ? "text-gold fill-gold stroke-gold"
          : "text-ash fill-transparent stroke-ash",
      )}
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  ariaLabel = "Rate this product",
  size = "md",
  clearable = false,
  disabled = false,
}: StarRatingProps) {
  const [hover, setHover] = useState(0);

  const handleClick = useCallback(
    (rating: number) => {
      if (readOnly || disabled || !onChange) return;
      onChange(rating === value && clearable ? 0 : rating);
    },
    [readOnly, disabled, onChange, value, clearable],
  );

  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1"
    >
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value >= star ? "true" : "false"}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          disabled={readOnly || disabled}
          onClick={() => handleClick(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          tabIndex={0}
          className={cn(
            "p-1 outline-none",
            "focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black",
            "active:scale-90 transition-transform duration-100",
            disabled ? "opacity-40 pointer-events-none" : "",
          )}
        >
          <Star
            filled={star <= value}
            size={size}
            hovered={star <= hover && !readOnly && !disabled}
          />
        </button>
      ))}
    </div>
  );
}

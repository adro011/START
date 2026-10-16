"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "../lib/format";

type RevealProps = {
  children: ReactNode;
  /** fade-up | fade | scale | blur */
  variant?: "fade-up" | "fade" | "scale" | "blur";
  /** stagger delay in ms */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "section" | "span" | "li";
};

/**
 * Scroll reveal (skill: premium-frontend-ui §3, plan §5).
 * - SSR renders content VISIBLE (SEO/no-JS safe); hidden state applies only
 *   after client mount, then IntersectionObserver reveals once.
 * - transform/opacity only, brand ease, reduced-motion renders final state.
 */
export default function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  className,
  style,
  as = "div",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as as "div";

  return (
    <Tag
      ref={ref}
      style={{ ...style, transitionDelay: `${delay}ms` }}
      className={cn("reveal", `reveal-${variant}`, shown && "reveal-shown", className)}
    >
      {children}
    </Tag>
  );
}

"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "../lib/format";
import { motionNumber, motionValue } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

type RevealProps = {
  children: ReactNode;
  /** fade-up | fade | scale | blur */
  variant?: "fade-up" | "fade" | "scale" | "blur";
  /** stagger delay in ms */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "section" | "span" | "li";
  /** unique composition id for timeline registration */
  compositionId?: string;
};

const VARIANT_DEFAULTS: Record<
  "fade-up" | "fade" | "scale" | "blur",
  { from: gsap.TweenVars; to: gsap.TweenVars }
> = {
  "fade-up": {
    from: { scale: 0.95, opacity: 0, y: 24 },
    to: { scale: 1, opacity: 1, y: 0 },
  },
  fade: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  scale: {
    from: { scale: 0.95, opacity: 0 },
    to: { scale: 1, opacity: 1 },
  },
  blur: {
    from: { opacity: 0, filter: "blur(12px)" },
    to: { opacity: 1, filter: "blur(0px)" },
  },
};

export default function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  className,
  style,
  as = "div",
  compositionId,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(el, { opacity: 1, scale: 1, y: 0, filter: "none" });
      return;
    }

    const { from, to } = VARIANT_DEFAULTS[variant];
    const stagger = Number(el.dataset.stagger ?? delay);
    const distance = motionNumber("effects", "reveal.distance", 24);
    const fromVars = "y" in from ? { ...from, y: distance } : from;

    const tl = gsap.timeline({
      paused: true,
      defaults: {
        ease: motionValue("global", "gsap.ease", "power3.out"),
        duration: motionNumber("effects", "reveal.duration", 0.7),
      },
    });

    tl.fromTo(el, fromVars, {
      ...to,
      delay: stagger / 1000,
      immediateRender: true,
    });

    const id = compositionId ?? `reveal-${Math.random().toString(36).slice(2, 9)}`;
    el.dataset.compositionId = id;

    ScrollTrigger.create({
      trigger: el,
      start: motionValue("effects", "reveal.start", "top 88%"),
      end: "bottom 12%",
      onEnter: () => tl.play(),
      onLeaveBack: () => tl.reverse(),
      once: false,
      id,
    });

    if (!window.__timelines) window.__timelines = {};
    window.__timelines[id] = tl;

    ctxRef.current = gsap.context(() => {}, el);

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.id === id) st.kill();
      });
      tl.kill();
      delete window.__timelines?.[id];
      ctxRef.current?.revert();
    };
  }, [variant, delay, compositionId]);

  const Tag = as as "div";

  return (
    <Tag
      ref={ref}
      style={style}
      className={cn("reveal", `reveal-${variant}`, className)}
      data-stagger={delay}
    >
      {children}
    </Tag>
  );
}

declare global {
  interface Window {
    __timelines: Record<string, gsap.core.Timeline>;
    __lenis?: unknown;
  }
}
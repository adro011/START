"use client";

import { useEffect, useRef, useState } from "react";

type OccasionEffectsProps = {
  /** Number of cards in the section */
  cardCount: number;
};

const createObserver = (
  root: Element,
  onEnter: (index: number) => void
) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const target = entry.target as HTMLElement;
        if (target.dataset.occasionCardIndex) {
          if (entry.isIntersecting) {
            onEnter(Number(target.dataset.occasionCardIndex));
          }
        }
      });
    },
    {
      root,
      rootMargin: "0px",
      threshold: 0.5,
    }
  );

  return observer;
};

export default function OccasionEffects({
  cardCount,
}: OccasionEffectsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(-1);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      if (sectionRef.current) {
        sectionRef.current.style.setProperty(
          "--burgundy-glow-opacity",
          "0"
        );
        sectionRef.current.style.setProperty(
          "--champagne-sweep-opacity",
          "0"
        );
        setActiveCardIndex(-1);
      }
      return;
    }

    if (!sectionRef.current) return;

    const section = sectionRef.current;

    cardRefs.current = Array.from({ length: cardCount }, (_, i) => null);

    const cardObservers = cardRefs.current.map((ref, _i) => {
      if (!ref) return null;
      return createObserver(
        section,
        (index) => {
          setActiveCardIndex(index);
        }
      );
    });

    return () => {
      cardObservers.forEach((obs) => obs && obs.disconnect());
      if (section) {
        section.style.setProperty("--burgundy-glow-opacity", "0");
        section.style.setProperty("--champagne-sweep-opacity", "0");
      }
    };
  }, [reducedMotion, cardCount]);

  useEffect(() => {
    if (reducedMotion) {
      if (sectionRef.current) {
        sectionRef.current.style.setProperty("--burgundy-glow-opacity", "0");
        sectionRef.current.style.setProperty("--champagne-sweep-opacity", "0");
      }
      return;
    }

    if (!sectionRef.current) return;

    const section = sectionRef.current;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced && activeCardIndex >= 0) {
      const card = section.querySelector<HTMLElement>(
        `.occasion-card[data-occasion-card-index="${activeCardIndex}"]`
      );
      if (card) {
        card.classList.add("occasion-card--active");
      }
    }

    const cleanup = () => {
      section.querySelectorAll<HTMLElement>(`.occasion-card`).forEach((card) => {
        card.classList.remove("occasion-card--active");
      });
    };

    return () => {
      cleanup();
    };
  }, [reducedMotion, activeCardIndex]);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const updateGlow = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const sectionTop = rect.top;
      const sectionBottom = rect.bottom;

      const visibleTop = Math.max(sectionTop, 0);
      const visibleBottom = Math.min(sectionBottom, viewportHeight);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const sectionHeight = rect.height;

      const progress = sectionHeight > 0 ? visibleHeight / sectionHeight : 0;

      const clampedProgress = Math.max(0, Math.min(1, progress));

      const illumination = parseFloat(
        (section.style.getPropertyValue("--illumination") || "0")
      );

      const blended = (clampedProgress + illumination) / 2;

      const glowOpacity = blended;
      const sweepOpacity = blended * 0.3;

      if (section.style) {
        section.style.setProperty("--burgundy-glow-opacity", `${glowOpacity}`);
        section.style.setProperty("--champagne-sweep-opacity", `${sweepOpacity}`);
      }
    };

    updateGlow();
    window.addEventListener("scroll", updateGlow, { passive: true });
    window.addEventListener("resize", updateGlow);

    return () => {
      window.removeEventListener("scroll", updateGlow);
      window.removeEventListener("resize", updateGlow);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.style.setProperty("--burgundy-glow-opacity", "0");
      sectionRef.current.style.setProperty("--champagne-sweep-opacity", "0");
      setActiveCardIndex(-1);
    }
  }, [reducedMotion]);
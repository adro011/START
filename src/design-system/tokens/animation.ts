export const animations = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    standard: '250ms',
    slow: '350ms',
    slower: '500ms',
    slowest: '800ms',
    hero: '1200ms',
  },
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    lamborghini: 'cubic-bezier(0.22, 1, 0.36, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  stagger: {
    tight: 0.04,
    standard: 0.08,
    loose: 0.12,
    section: 0.16,
  },
  scroll: {
    scrub: 1,
    scrubFast: 0.5,
    scrubSlow: 2,
  },
} as const;

export type Animations = typeof animations;
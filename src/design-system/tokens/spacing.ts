export const spacing = {
  base: 8,
  scale: {
    0: 0,
    1: 2,
    2: 4,
    3: 5,
    4: 8,
    5: 10,
    6: 12,
    7: 15,
    8: 16,
    9: 20,
    10: 24,
    11: 32,
    12: 40,
    13: 48,
    14: 56,
  },
  component: {
    buttonPadding: { large: 24, standard: 16, small: 12 },
    cardPadding: 24,
    sectionPadding: { mobile: 24, tablet: 40, desktop: 48, large: 56 },
    containerPadding: { mobile: 16, tablet: 24, desktop: 40 },
    navHeight: 64,
    heroMinHeight: '100vh',
  },
} as const;

export type Spacing = typeof spacing;
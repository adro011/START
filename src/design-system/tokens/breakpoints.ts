export const breakpoints = {
  mobileS: '320px',
  mobile: '425px',
  mobileL: '576px',
  tablet: '768px',
  tabletL: '1024px',
  desktop: '1280px',
  desktopL: '1440px',
  wide: '1600px',
} as const;

export const mediaQueries = {
  mobileS: `@media (min-width: ${breakpoints.mobileS})`,
  mobile: `@media (min-width: ${breakpoints.mobile})`,
  mobileL: `@media (min-width: ${breakpoints.mobileL})`,
  tablet: `@media (min-width: ${breakpoints.tablet})`,
  tabletL: `@media (min-width: ${breakpoints.tabletL})`,
  desktop: `@media (min-width: ${breakpoints.desktop})`,
  desktopL: `@media (min-width: ${breakpoints.desktopL})`,
  wide: `@media (min-width: ${breakpoints.wide})`,
  reduceMotion: '@media (prefers-reduced-motion: reduce)',
  darkMode: '@media (prefers-color-scheme: dark)',
  lightMode: '@media (prefers-color-scheme: light)',
} as const;

export type Breakpoints = typeof breakpoints;
export type MediaQueries = typeof mediaQueries;
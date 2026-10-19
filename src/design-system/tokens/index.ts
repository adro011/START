export * from './colors';
export * from './typography';
export * from './spacing';
export * from './borders';
export * from './breakpoints';
export * from './animation';

export const designTokens = {
  colors: require('./colors').colors,
  typography: require('./typography').typography,
  spacing: require('./spacing').spacing,
  borderRadius: require('./borders').borderRadius,
  shadows: require('./borders').shadows,
  breakpoints: require('./breakpoints').breakpoints,
  mediaQueries: require('./breakpoints').mediaQueries,
  animations: require('./animation').animations,
} as const;

export type DesignTokens = typeof designTokens;
export const borderRadius = {
  none: 0,
  hairline: 1,
  subtle: 2,
  badge: 2,
  switch: 20,
  card: 0,
  button: 0,
  container: 0,
  image: 0,
} as const;

export const shadows = {
  none: 'none',
  overlay: '0 0 0 1px rgba(255,255,255,0.05)',
  elevation1: '0 4px 24px rgba(0,0,0,0.4)',
  elevation2: '0 8px 48px rgba(0,0,0,0.5)',
  elevation3: '0 16px 64px rgba(0,0,0,0.6)',
  focus: '0 0 0 2px #000000, 0 0 0 4px #FFC000',
  goldGlow: '0 0 32px rgba(255, 192, 0, 0.3)',
  cyanGlow: '0 0 24px rgba(41, 171, 226, 0.25)',
} as const;

export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
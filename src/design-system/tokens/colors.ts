export const colors = {
  primary: {
    gold: '#FFC000',
    goldHover: '#917300',
    goldText: '#FFCE3E',
  },
  neutral: {
    white: '#FFFFFF',
    smoke: '#F5F5F5',
    nearWhite: '#F8F8F8',
    mist: '#E6E6E6',
    ash: '#7D7D7D',
    steel: '#969696',
    slate: '#666666',
    iron: '#555555',
    graphite: '#494949',
    shadow: '#313131',
    darkIron: '#181818',
    charcoal: '#202020',
    absoluteBlack: '#000000',
  },
  accent: {
    cyan: '#29ABE2',
    linkBlue: '#3860BE',
    tealAction: '#1EAEDB',
  },
  semantic: {
    success: '#1EAEDB',
    error: '#FF3B30',
    warning: '#FF9500',
    info: '#29ABE2',
  },
  surfaces: {
    level0: '#000000',
    level1: '#181818',
    level2: '#202020',
    level3: 'rgba(0,0,0,0.7)',
    level4: 'rgba(0,0,0,0.5)',
    level5: 'rgba(0,0,0,0.25)',
  },
  borders: {
    primary: 'rgba(255,255,255,0.5)',
    secondary: '#202020',
    focus: '#000000',
  },
  overlay: {
    dark: 'rgba(0,0,0,0.7)',
    medium: 'rgba(0,0,0,0.5)',
    light: 'rgba(0,0,0,0.25)',
  },
} as const;

export type Colors = typeof colors;
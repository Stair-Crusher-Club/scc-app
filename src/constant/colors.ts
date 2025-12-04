import baseColors from 'tailwindcss/colors';

// Tailwind 기본 colors에 커스텀 색상 덮어쓰기
export const colors = {
  ...baseColors,
  // Custom colors from tailwind.config.js
  gray: {
    10: '#F7F7F9',
    15: '#F2F2F5',
    20: '#EBEBEF',
    25: '#DEDEE3',
    30: '#C5C5CE',
    40: '#A1A1AF',
    45: '#9797A6',
    50: '#7A7A88',
    60: '#555562',
    70: '#383841',
    80: '#232328',
    90: '#141418',
    100: '#000000',
  },
  brand: {
    5: '#EBF5FF',
    10: '#D6EBFF',
    15: '#B2D7FF',
    20: '#67AEFFCC',
    25: '#67AEFF',
    30: '#1D85FF',
    40: '#0C76F7',
    50: '#0E64D3',
    60: '#0950BD',
    70: '#073C8B',
  },
  blue: {
    1: '#F1F5F9',
    5: '#EFF0F2',
    10: '#C7E0FF',
    20: '#8EC2FF',
    30: '#67AEFF',
    '30a15': '#67AEFF26',
    40: '#3491FF',
    50: '#1D85FF',
    60: '#1067CD',
  },
  orange: {
    DEFAULT: '#F67600',
    10: '#FDDDBF',
    20: '#FBBB80',
    30: '#FF9D0A',
    40: '#F67600',
  },
  yellow: {
    DEFAULT: '#FFD900',
    70: '#FF9D0A',
  },
  success: {
    DEFAULT: '#00E794',
    10: '#E1FCF2',
    30: '#12AC74',
  },
  blacka: {
    10: '#0000001A',
    20: '#00000033',
    30: '#0000004D',
    40: '#00000066',
    50: '#00000080',
    60: '#00000099',
    70: '#000000B3',
    80: '#000000CC',
    90: '#000000E6',
  },
  // Utility colors
  white: '#ffffff',
  black: '#000000',
  red: '#DB0B24',
  link: '#1067CD',
  'light-orange': '#FFA14B',
};

export type Color = keyof typeof colors;

export default colors;

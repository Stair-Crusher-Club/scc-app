import baseColors from 'tailwindcss/colors';
import {color} from './color';

// Tailwind 기본 colors에 커스텀 색상 덮어쓰기
export const tailwindColor = {
  ...baseColors,
  // Custom colors from tailwind.config.js
  gray: {
    10: color.gray10,
    15: color.gray15,
    20: color.gray20,
    25: color.gray25,
    30: color.gray30,
    40: color.gray40,
    45: color.gray45,
    50: color.gray50,
    60: color.gray60,
    70: color.gray70,
    80: color.gray80,
    90: color.gray90,
    100: color.gray100,
  },
  brand: {
    5: color.brand5,
    10: color.brand10,
    15: color.brand15,
    20: color.brand20,
    25: color.brand25,
    30: color.brand30,
    40: color.brand40,
    50: color.brand50,
    60: color.brand60,
    70: color.brand70,
  },
  blue: {
    1: color.blue1,
    5: color.blue5,
    10: color.blue10,
    20: color.blue20,
    30: color.blue30,
    '30a15': color.blue30a15,
    40: color.blue40,
    50: color.blue50,
    60: color.blue60,
  },
  orange: {
    DEFAULT: color.orange,
    10: color.orange10,
    20: color.orange20,
    30: color.orange30,
    40: color.orange40,
  },
  yellow: {
    DEFAULT: color.yellow,
    70: color.yellow70,
  },
  success: {
    DEFAULT: color.success,
    10: color.success10,
    30: color.success30,
  },
  blacka: {
    10: color.blacka10,
    20: color.blacka20,
    30: color.blacka30,
    40: color.blacka40,
    50: color.blacka50,
    60: color.blacka60,
    70: color.blacka70,
    80: color.blacka80,
    90: color.blacka90,
  },
  // Utility colors
  white: color.white,
  black: color.black,
  red: color.red,
  link: color.link,
  'light-orange': color.lightOrange,
};

export type Color = keyof typeof tailwindColor;

export default tailwindColor;

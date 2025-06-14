export const color = {
  white: '#fff',
  black: '#000',
  blacka10: '#0000001A',
  blacka20: '#00000033',
  blacka30: '#0000004D',
  blacka40: '#00000066',
  blacka50: '#00000080',
  blacka60: '#00000099',
  blacka70: '#000000B3',
  blacka80: '#000000CC',
  blacka90: '#000000E6',

  brandColor: '#3491FF',
  brand5: '#EFF6FF',
  brand10: '#E5F1FF',
  brand20: '#80BBFF',
  blue5: '#EFF0F2',
  blue10: '#C7E0FF',
  blue20: '#8EC2FF',
  blue30: '#67AEFF',
  blue30a15: '#67AEFF26',
  blue40: '#3491FF',
  blue50: '#1D85FF',
  blue60: '#1067CD',

  gray10: '#F2F2F5',
  gray20: '#EAEAEF',
  gray30: '#D0D0D9',
  gray40: '#BBBBBB',
  gray50: '#B5B5C0',
  gray70: '#9797A6',
  gray80: '#6A6A73',
  gray90: '#3F3F45',
  gray100: '#24262B',

  red: '#DB0B24',

  brand: '#0E64D3',

  link: '#1067CD',
  lightOrange: '#FFA14B',
  orange: '#F67600',
  orange10: '#FDDDBF',
  orange20: '#FBBB80',
  orange30: '#FF9D0A',
  orange40: '#F67600',

  yellow: '#FFD900',

  success: '#00E794',
  success10: '#E1FCF2',
  success30: '#12AC74',
} as const;

export type Color = keyof typeof color;

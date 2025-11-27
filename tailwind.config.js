/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Base colors
        white: '#fff',
        black: '#000',

        // Black with alpha (transparency)
        blacka10: '#0000001A',
        blacka20: '#00000033',
        blacka30: '#0000004D',
        blacka40: '#00000066',
        blacka50: '#00000080',
        blacka60: '#00000099',
        blacka70: '#000000B3',
        blacka80: '#000000CC',
        blacka90: '#000000E6',

        // Brand colors
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

        // Blue colors
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

        // Gray scale
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

        // Utility colors
        red: '#DB0B24',
        link: '#1067CD',

        // Orange colors
        'light-orange': '#FFA14B',
        orange: {
          DEFAULT: '#F67600',
          10: '#FDDDBF',
          20: '#FBBB80',
          30: '#FF9D0A',
          40: '#F67600',
        },

        // Yellow colors
        yellow: {
          DEFAULT: '#FFD900',
          70: '#FF9D0A',
        },

        // Success colors
        success: {
          DEFAULT: '#00E794',
          10: '#E1FCF2',
          30: '#12AC74',
        },
      },

      fontFamily: {
        // Pretendard font family (각 weight별로 별도 정의)
        'pretendard-extrabold': ['Pretendard-ExtraBold'], // 800
        'pretendard-bold': ['Pretendard-Bold'], // 700
        'pretendard-semibold': ['Pretendard-SemiBold'], // 600
        'pretendard-medium': ['Pretendard-Medium'], // 500
        'pretendard-regular': ['Pretendard-Regular'], // 400
        'pretendard-light': ['Pretendard-Light'], // 300
        'pretendard-thin': ['Pretendard-Thin'], // 200
        'pretendard-extralight': ['Pretendard-ExtraLight'], // 100

        // GumiRomance font
        'gumi-romance': ['GumiRomanceTTF'],
      },
    },
  },
  plugins: [],
};

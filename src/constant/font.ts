export const font = {
  pretendardExtraBold: 'Pretendard-ExtraBold', // 800
  pretendardBold: 'Pretendard-Bold', // 700
  pretendardSemibold: 'Pretendard-SemiBold', // 600
  pretendardMedium: 'Pretendard-Medium', // 500
  pretendardRegular: 'Pretendard-Regular', // 400
  pretendardLight: 'Pretendard-Light', // 300
  pretendardThin: 'Pretendard-Thin', // 200
  pretendardExtraLight: 'Pretendard-ExtraLight', // 100
} as const;

export type Font = keyof typeof font;

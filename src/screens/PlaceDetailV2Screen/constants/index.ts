export const BUILDING_REGISTRATION_CONTENT = {
  'registration-force': {
    title: '건물 입구정보가 필요해요!',
    description:
      '매장에 가기 위해 건물 입구 정보가 필요해요.\n등록해주실 수 있나요?',
    imagePath: require('@/assets/img/form/building_suggest_strong.png'),
    confirmButtonText: '지금 등록하기',
    cancelButtonText: '나중에 등록하기',
  },
  'registration-suggest': {
    title: '건물정보도 등록해보세요!',
    description:
      '1층이 아닌 다른층에 있는 장소네요?\n건물 정보도 등록해보시는거 어때요?',
    imagePath: require('@/assets/img/form/building_suggest_weak.png'),
    confirmButtonText: '지금 등록하기',
    cancelButtonText: '나중에 등록하기',
  },
} as const;

export type BuildingRegistrationEvent =
  keyof typeof BUILDING_REGISTRATION_CONTENT;

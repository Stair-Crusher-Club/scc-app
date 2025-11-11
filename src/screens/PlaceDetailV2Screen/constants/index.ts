export const BUILDING_REGISTRATION_CONTENT = {
  'registration-force': {
    title: '건물 안쪽에 있는 가게라면,\n건물 입구 정보가 꼭 필요해요.',
    imagePath: require('@/assets/img/img_building_registration_suggesst.png'),
    confirmButtonText: '당장 등록할게요',
    cancelButtonText: '아쉽지만 다음에 등록할게요',
  },
  'registration-suggest': {
    title: '건물 정보도 등록할까요?',
    imagePath: require('@/assets/img/img_building_registration_suggesst.png'),
    confirmButtonText: '좋아요',
    cancelButtonText: '다음에 할게요',
  },
} as const;

export type BuildingRegistrationEvent =
  keyof typeof BUILDING_REGISTRATION_CONTENT;

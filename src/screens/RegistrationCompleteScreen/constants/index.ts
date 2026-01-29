export const REGISTRATION_COMPLETE_CONTENT = {
  place: {
    title: '정보를 등록해주셔서\n감사합니다!',
    description: (nickname?: string) =>
      `이 장소의 계단정보,\n${nickname ?? ''}크러셔님 덕분에 찾을 수 있게 되었어요!`,
    imagePath: require('@/assets/img/form/thank_you.png'),
  },
  building: {
    title: '정보를 등록해주셔서\n감사합니다!',
    description: () => '이 장소의 건물 정보를 처음으로 밝혀주셨어요',
    imagePath: require('@/assets/img/form/thank_you.png'),
  },
};

import {describe, expect, it} from '@jest/globals';

import {
  TutorialMissionTypeDto,
  type UserTutorialMissionDto,
} from '@/generated-sources/openapi';
import {
  allMainMissionsCompletedIn,
  mainMissionTypesOf,
  objectParticle,
} from '@/screens/TutorialMissionScreen/constants';

const missions = (
  ...types: TutorialMissionTypeDto[]
): UserTutorialMissionDto[] =>
  types.map(missionType => ({missionType, completedAt: null}));

const completed = (
  ...types: TutorialMissionTypeDto[]
): UserTutorialMissionDto[] =>
  types.map(missionType => ({
    missionType,
    completedAt: {value: 1_700_000_000_000},
  }));

describe('mainMissionTypesOf', () => {
  // 미션 순서는 서버 응답 배열 순서가 유일한 정답이다. 앱이 순서를 하드코딩하면
  // v1/v2 중 한쪽 유저의 미션 순서가 깨진다.
  it('v1 셋의 순서를 그대로 유지한다 (기존 가입자 회귀)', () => {
    expect(
      mainMissionTypesOf(
        missions(
          TutorialMissionTypeDto.RegisterInterestedRegionsAndThemes,
          TutorialMissionTypeDto.SavePlaceList,
          TutorialMissionTypeDto.UpvoteAccessibility,
          TutorialMissionTypeDto.HiddenAppSurvey,
        ),
      ),
    ).toEqual([
      TutorialMissionTypeDto.RegisterInterestedRegionsAndThemes,
      TutorialMissionTypeDto.SavePlaceList,
      TutorialMissionTypeDto.UpvoteAccessibility,
    ]);
  });

  it('v2 셋의 순서를 그대로 유지한다 (신규 가입자)', () => {
    expect(
      mainMissionTypesOf(
        missions(
          TutorialMissionTypeDto.ViewTutorialImages,
          TutorialMissionTypeDto.RegisterInterestedRegionsAndThemes,
          TutorialMissionTypeDto.SavePlaceList,
          TutorialMissionTypeDto.HiddenAppSurvey,
        ),
      ),
    ).toEqual([
      TutorialMissionTypeDto.ViewTutorialImages,
      TutorialMissionTypeDto.RegisterInterestedRegionsAndThemes,
      TutorialMissionTypeDto.SavePlaceList,
    ]);
  });

  it('히든 미션은 배열 어디에 있어도 제외한다', () => {
    expect(
      mainMissionTypesOf(
        missions(
          TutorialMissionTypeDto.HiddenAppSurvey,
          TutorialMissionTypeDto.SavePlaceList,
        ),
      ),
    ).toEqual([TutorialMissionTypeDto.SavePlaceList]);
  });

  it('빈 배열이면 빈 배열', () => {
    expect(mainMissionTypesOf([])).toEqual([]);
  });
});

describe('allMainMissionsCompletedIn', () => {
  // 회귀 가드: [].every() === true 함정. 서버는 USER_TUTORIAL flag 미대상(익명 포함)
  // 에게 missions: [] 를 내려준다. 여기서 true 가 나오면 HomeScreenV2 가
  // hasShownTutorialIntroPopup 을 영구 마킹해 인트로 팝업이 다시 안 뜨고,
  // TutorialMissionScreen 은 외출템 수집 완료 팝업/히든 CTA 를 헛발사한다.
  it('빈 미션 배열은 "전부 완료"가 아니라 false 다', () => {
    expect(allMainMissionsCompletedIn([])).toBe(false);
  });

  it('히든 미션만 있는 배열도 false 다 (메인 미션 0개)', () => {
    expect(
      allMainMissionsCompletedIn(
        missions(TutorialMissionTypeDto.HiddenAppSurvey),
      ),
    ).toBe(false);
  });

  it('메인 미션이 하나라도 미완료면 false', () => {
    expect(
      allMainMissionsCompletedIn([
        ...completed(TutorialMissionTypeDto.ViewTutorialImages),
        ...missions(TutorialMissionTypeDto.RegisterInterestedRegionsAndThemes),
        ...missions(TutorialMissionTypeDto.SavePlaceList),
      ]),
    ).toBe(false);
  });

  it('v2 메인 3개가 모두 완료면 true (UPVOTE_ACCESSIBILITY 미완료여도)', () => {
    expect(
      allMainMissionsCompletedIn([
        ...completed(
          TutorialMissionTypeDto.ViewTutorialImages,
          TutorialMissionTypeDto.RegisterInterestedRegionsAndThemes,
          TutorialMissionTypeDto.SavePlaceList,
        ),
        ...missions(TutorialMissionTypeDto.HiddenAppSurvey),
      ]),
    ).toBe(true);
  });

  it('v1 메인 3개가 모두 완료면 true (기존 가입자 회귀)', () => {
    expect(
      allMainMissionsCompletedIn([
        ...completed(
          TutorialMissionTypeDto.RegisterInterestedRegionsAndThemes,
          TutorialMissionTypeDto.SavePlaceList,
          TutorialMissionTypeDto.UpvoteAccessibility,
        ),
        ...missions(TutorialMissionTypeDto.HiddenAppSurvey),
      ]),
    ).toBe(true);
  });
});

describe('objectParticle', () => {
  // Figma 잠금 카드 카피: "외출템 2를 모으면, 세 번째 미션이 열려요!"
  it.each([
    [1, '을'],
    [2, '를'],
    [3, '을'],
    [4, '를'],
    [5, '를'],
    [9, '를'],
    [10, '을'],
  ])('%i 뒤에는 "%s"', (n, expected) => {
    expect(objectParticle(n)).toBe(expected);
  });
});

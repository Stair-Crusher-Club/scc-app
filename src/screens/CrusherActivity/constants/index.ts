import {
  CrusherClubCrewTypeDto,
  CrusherClubQuestCompleteStampTypeDto,
} from '@/generated-sources/openapi';
import {ImageSourcePropType} from 'react-native';
import {CrusherActivityTab} from '../types';

export const tabItems = [
  {
    value: 'current' as CrusherActivityTab,
    label: '현재시즌',
  },
  {
    value: 'history' as CrusherActivityTab,
    label: '히스토리',
  },
];

export type Asset = {
  label: string;
  source: ImageSourcePropType;
  questMap: Partial<
    Record<
      CrusherClubQuestCompleteStampTypeDto,
      {
        empty: ImageSourcePropType;
        success: ImageSourcePropType;
      }
    >
  >;
};

const crewInfoAssetsBase: Record<CrusherClubCrewTypeDto, Asset> = {
  EDITOR_CREW: {
    label: '에디터',
    source: require('@/assets/img/img_crusher_history_editor.png'),
    questMap: {
      STARTING_DAY: {
        empty: require('@/assets/img/crusher_history_quest/empty/star.png'),
        success: require('@/assets/img/crusher_history_quest/2025autumn/success/starting.png'),
      },
      SHORT_REVIEW_1: {
        empty: require('@/assets/img/crusher_history_quest/empty/camera.png'),
        success: require('@/assets/img/crusher_history_quest/2025autumn/success/camera.png'),
      },
      SHORT_REVIEW_2: {
        empty: require('@/assets/img/crusher_history_quest/empty/pen.png'),
        success: require('@/assets/img/crusher_history_quest/2025autumn/success/pen.png'),
      },
      SHORT_REVIEW_3: {
        empty: require('@/assets/img/crusher_history_quest/empty/camera.png'),
        success: require('@/assets/img/crusher_history_quest/2025autumn/success/camera.png'),
      },
      SHORT_REVIEW_4: {
        empty: require('@/assets/img/crusher_history_quest/empty/pen.png'),
        success: require('@/assets/img/crusher_history_quest/2025autumn/success/pen.png'),
      },
      SHORT_REVIEW_5: {
        empty: require('@/assets/img/crusher_history_quest/empty/camera.png'),
        success: require('@/assets/img/crusher_history_quest/2025autumn/success/camera.png'),
      },
      SHORT_REVIEW_6: {
        empty: require('@/assets/img/crusher_history_quest/empty/pen.png'),
        success: require('@/assets/img/crusher_history_quest/2025autumn/success/pen.png'),
      },
      SHORT_REVIEW_7: {
        empty: require('@/assets/img/crusher_history_quest/empty/camera.png'),
        success: require('@/assets/img/crusher_history_quest/2025autumn/success/camera.png'),
      },
      SHORT_REVIEW_8: {
        empty: require('@/assets/img/crusher_history_quest/empty/pen.png'),
        success: require('@/assets/img/crusher_history_quest/2025autumn/success/pen.png'),
      },
      LONG_REVIEW_1: {
        empty: require('@/assets/img/crusher_history_quest/empty/star2.png'),
        success: require('@/assets/img/crusher_history_quest/2025autumn/success/medal_red.png'),
      },
      LONG_REVIEW_2: {
        empty: require('@/assets/img/crusher_history_quest/empty/star2.png'),
        success: require('@/assets/img/crusher_history_quest/2025autumn/success/medal_blue.png'),
      },
      APP_USAGE_REVIEW: {
        empty: require('@/assets/img/crusher_history_quest/empty/review.png'),
        success: require('@/assets/img/crusher_history_quest/2025autumn/success/review.png'),
      },
      CONQUER_QUEST: {
        empty: require('@/assets/img/crusher_history_quest/empty/flag.png'),
        success: require('@/assets/img/crusher_history_quest/2025autumn/success/quest1.png'),
      },
      SAVED_PLACE_LIST: {
        empty: require('@/assets/img/crusher_history_quest/empty/savelist.png'),
        success: require('@/assets/img/crusher_history_quest/empty/savelist.png'),
      },
      // 26 가을 신규. success 는 시즌 오버라이드가 채운다.
      LONG_REVIEW_CORE_MISSION: {
        empty: require('@/assets/img/crusher_history_quest/empty/star2.png'),
        success: require('@/assets/img/crusher_history_quest/empty/star2.png'),
      },
      EDITOR_TIME_1: {
        empty: require('@/assets/img/crusher_history_quest/empty/star.png'),
        success: require('@/assets/img/crusher_history_quest/empty/star.png'),
      },
      EDITOR_TIME_2: {
        empty: require('@/assets/img/crusher_history_quest/empty/star.png'),
        success: require('@/assets/img/crusher_history_quest/empty/star.png'),
      },
      TEAM_OUTING: {
        empty: require('@/assets/img/crusher_history_quest/empty/star.png'),
        success: require('@/assets/img/crusher_history_quest/empty/star.png'),
      },
    },
  },
  CONQUER_CREW: {
    label: '정복',
    source: require('@/assets/img/img_crusher_history_conqueror.png'),
    questMap: {
      STARTING_DAY: {
        empty: require('@/assets/img/crusher_history_quest/empty/star.png'),
        success: require('@/assets/img/crusher_history_quest/2025autumn/success/starting.png'),
      },
      WARMING_UP_CONQUER: {
        empty: require('@/assets/img/crusher_history_quest/empty/flag.png'),
        success: require('@/assets/img/crusher_history_quest/2025autumn/success/warming_up.png'),
      },
      CONQUER_1: {
        empty: require('@/assets/img/crusher_history_quest/empty/flag.png'),
        success: require('@/assets/img/crusher_history_quest/2025autumn/success/quest1.png'),
      },
      CONQUER_2: {
        empty: require('@/assets/img/crusher_history_quest/empty/flag.png'),
        success: require('@/assets/img/crusher_history_quest/2025autumn/success/quest2.png'),
      },
      CONQUER_3: {
        empty: require('@/assets/img/crusher_history_quest/empty/flag.png'),
        success: require('@/assets/img/crusher_history_quest/2025autumn/success/quest3.png'),
      },
      CONQUER_4: {
        empty: require('@/assets/img/crusher_history_quest/empty/flag.png'),
        success: require('@/assets/img/crusher_history_quest/2025autumn/success/quest4.png'),
      },
      DAILY_LIFE_QUEST: {
        empty: require('@/assets/img/crusher_history_quest/empty/life.png'),
        success: require('@/assets/img/crusher_history_quest/2025autumn/success/life.png'),
      },
      // 26 가을 신규. success 는 시즌 오버라이드가 채운다.
      CONQUER_5: {
        empty: require('@/assets/img/crusher_history_quest/empty/flag.png'),
        success: require('@/assets/img/crusher_history_quest/empty/flag.png'),
      },
      CONQUER_6: {
        empty: require('@/assets/img/crusher_history_quest/empty/flag.png'),
        success: require('@/assets/img/crusher_history_quest/empty/flag.png'),
      },
      CONQUER_CORE_MISSION: {
        empty: require('@/assets/img/crusher_history_quest/empty/flag.png'),
        success: require('@/assets/img/crusher_history_quest/empty/flag.png'),
      },
    },
  },
};

type StampImageMap = Partial<
  Record<CrusherClubQuestCompleteStampTypeDto, ImageSourcePropType>
>;

/**
 * 시즌별 success 이미지 오버라이드.
 *
 * `all` 은 두 크루 공통, crewType 키는 그 크루에만 적용된다(같은 stampType 도안이 크루별로
 * 다른 경우 — 26 가을 스타팅데이). 여기에 없는 stampType은 base 이미지로 fallback.
 */
type SeasonSuccessOverride = {all?: StampImageMap} & Partial<
  Record<CrusherClubCrewTypeDto, StampImageMap>
>;

const seasonSuccessOverrides: Record<string, SeasonSuccessOverride> = {
  '2026spring': {
    all: {
      STARTING_DAY: require('@/assets/img/crusher_history_quest/2026spring/success/starting.png'),
      SHORT_REVIEW_1: require('@/assets/img/crusher_history_quest/2026spring/success/short_review1.png'),
      SHORT_REVIEW_2: require('@/assets/img/crusher_history_quest/2026spring/success/short_review2.png'),
      SHORT_REVIEW_3: require('@/assets/img/crusher_history_quest/2026spring/success/short_review3.png'),
      SHORT_REVIEW_4: require('@/assets/img/crusher_history_quest/2026spring/success/short_review4.png'),
      SHORT_REVIEW_5: require('@/assets/img/crusher_history_quest/2026spring/success/short_review5.png'),
      SHORT_REVIEW_6: require('@/assets/img/crusher_history_quest/2026spring/success/short_review6.png'),
      SHORT_REVIEW_7: require('@/assets/img/crusher_history_quest/2026spring/success/short_review7.png'),
      SHORT_REVIEW_8: require('@/assets/img/crusher_history_quest/2026spring/success/short_review8.png'),
      LONG_REVIEW_1: require('@/assets/img/crusher_history_quest/2026spring/success/long_review1.png'),
      LONG_REVIEW_2: require('@/assets/img/crusher_history_quest/2026spring/success/long_review2.png'),
      WARMING_UP_CONQUER: require('@/assets/img/crusher_history_quest/2026spring/success/warming_up_conquer.png'),
      CONQUER_1: require('@/assets/img/crusher_history_quest/2026spring/success/conquer1.png'),
      CONQUER_2: require('@/assets/img/crusher_history_quest/2026spring/success/conquer2.png'),
      CONQUER_3: require('@/assets/img/crusher_history_quest/2026spring/success/conquer3.png'),
      CONQUER_4: require('@/assets/img/crusher_history_quest/2026spring/success/conquer4.png'),
      DAILY_LIFE_QUEST: require('@/assets/img/crusher_history_quest/2026spring/success/daily_life_quest.png'),
      SAVED_PLACE_LIST: require('@/assets/img/crusher_history_quest/2026spring/success/saved_place_list.png'),
    },
  },
  '2026fall': {
    all: {
      WARMING_UP_CONQUER: require('@/assets/img/crusher_history_quest/2026fall/success/warming_up_conquer.png'),
      CONQUER_1: require('@/assets/img/crusher_history_quest/2026fall/success/conquer1.png'),
      CONQUER_2: require('@/assets/img/crusher_history_quest/2026fall/success/conquer2.png'),
      CONQUER_3: require('@/assets/img/crusher_history_quest/2026fall/success/conquer3.png'),
      CONQUER_4: require('@/assets/img/crusher_history_quest/2026fall/success/conquer4.png'),
      CONQUER_5: require('@/assets/img/crusher_history_quest/2026fall/success/conquer5.png'),
      CONQUER_6: require('@/assets/img/crusher_history_quest/2026fall/success/conquer6.png'),
      CONQUER_CORE_MISSION: require('@/assets/img/crusher_history_quest/2026fall/success/conquer_core_mission.png'),
      LONG_REVIEW_CORE_MISSION: require('@/assets/img/crusher_history_quest/2026fall/success/long_review_core_mission.png'),
      LONG_REVIEW_1: require('@/assets/img/crusher_history_quest/2026fall/success/long_review1.png'),
      EDITOR_TIME_1: require('@/assets/img/crusher_history_quest/2026fall/success/editor_time1.png'),
      EDITOR_TIME_2: require('@/assets/img/crusher_history_quest/2026fall/success/editor_time2.png'),
      TEAM_OUTING: require('@/assets/img/crusher_history_quest/2026fall/success/team_outing.png'),
    },
    // 26 가을은 스타팅데이 도안이 크루별로 다르다.
    CONQUER_CREW: {
      STARTING_DAY: require('@/assets/img/crusher_history_quest/2026fall/success/starting_conquer.png'),
    },
    EDITOR_CREW: {
      STARTING_DAY: require('@/assets/img/crusher_history_quest/2026fall/success/starting_editor.png'),
    },
  },
};

/**
 * 시즌 시작일 → 에셋 시즌 키. 최신 시즌이 위에 온다.
 *
 * 하한만 쓰고 상한을 두지 않는다 — 상한을 쓰면 새 시즌이 열릴 때마다 위 구간의 상한을
 * 같이 올려야 하고, 빠뜨리면 새 시즌이 옛 시즌 도안으로 조용히 렌더된다
 * (실제로 `>= '2026-01-01' ? '2026spring'` 이 26 가을을 봄 도안으로 보냈다).
 * 새 시즌은 이 목록 맨 위에 한 줄만 추가하면 된다.
 */
const SEASON_KEYS: ReadonlyArray<readonly [string, string]> = [
  ['2026-09-01', '2026fall'],
  ['2026-01-01', '2026spring'],
];

function getSeasonKey(startDate?: string): string {
  if (!startDate) {
    return '2025autumn';
  }
  return SEASON_KEYS.find(([from]) => startDate >= from)?.[1] ?? '2025autumn';
}

export function getCrewAssets(
  crewType: CrusherClubCrewTypeDto,
  startDate?: string,
): Asset {
  const base = crewInfoAssetsBase[crewType];
  const override = seasonSuccessOverrides[getSeasonKey(startDate)];
  if (!override) {
    return base;
  }

  const mergedQuestMap = {...base.questMap};
  // 공통(all) 먼저, 크루별 도안이 있으면 그걸로 덮는다.
  for (const stampMap of [override.all, override[crewType]]) {
    for (const [stampType, successImage] of Object.entries(stampMap ?? {})) {
      const key = stampType as CrusherClubQuestCompleteStampTypeDto;
      const existing = mergedQuestMap[key];
      if (existing && successImage) {
        mergedQuestMap[key] = {
          ...existing,
          success: successImage,
        };
      }
    }
  }

  return {...base, questMap: mergedQuestMap};
}

/** @deprecated Use getCrewAssets(crewType, startDate) instead */
export const crewInfoAssets = crewInfoAssetsBase;

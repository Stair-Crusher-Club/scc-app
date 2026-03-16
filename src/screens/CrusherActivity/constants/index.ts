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
        success: require('@/assets/img/crusher_history_quest/2025autumn/success/savelist.png'),
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
    },
  },
};

/**
 * 시즌별 success 이미지 오버라이드.
 * 여기에 없는 stampType은 base(2025autumn) 이미지로 fallback.
 */
const seasonSuccessOverrides: Record<
  string,
  Partial<Record<CrusherClubQuestCompleteStampTypeDto, ImageSourcePropType>>
> = {
  '2026spring': {
    STARTING_DAY: require('@/assets/img/crusher_history_quest/2026spring/success/starting.png'),
  },
};

function getSeasonKey(startDate?: string): string {
  if (!startDate) {
    return '2025autumn';
  }
  return startDate >= '2026-01-01' ? '2026spring' : '2025autumn';
}

export function getCrewAssets(
  crewType: CrusherClubCrewTypeDto,
  startDate?: string,
): Asset {
  const base = crewInfoAssetsBase[crewType];
  const seasonKey = getSeasonKey(startDate);

  const overrides = seasonSuccessOverrides[seasonKey];
  if (!overrides) {
    return base;
  }

  const mergedQuestMap = {...base.questMap};
  for (const [stampType, successImage] of Object.entries(overrides)) {
    const key = stampType as CrusherClubQuestCompleteStampTypeDto;
    const existing = mergedQuestMap[key];
    if (existing && successImage) {
      mergedQuestMap[key] = {
        ...existing,
        success: successImage,
      };
    }
  }

  return {...base, questMap: mergedQuestMap};
}

/** @deprecated Use getCrewAssets(crewType, startDate) instead */
export const crewInfoAssets = crewInfoAssetsBase;

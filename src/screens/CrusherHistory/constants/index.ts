import {
  CrusherClubCrewTypeDto,
  CrusherClubQuestCompleteStampTypeDto,
} from '@/generated-sources/openapi';
import {ImageSourcePropType} from 'react-native';

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

export const crewInfoAssets: Record<CrusherClubCrewTypeDto, Asset> = {
  EDITOR_CREW: {
    label: '에디터',
    source: require('@/assets/img/img_crusher_history_editor.png'),
    questMap: {
      STARTING_DAY: {
        empty: require('@/assets/img/crusher_history_quest/empty/star.png'),
        success: require('@/assets/img/crusher_history_quest/success/starting.png'),
      },
      SHORT_REVIEW_1: {
        empty: require('@/assets/img/crusher_history_quest/empty/camera.png'),
        success: require('@/assets/img/crusher_history_quest/success/camera.png'),
      },
      SHORT_REVIEW_2: {
        empty: require('@/assets/img/crusher_history_quest/empty/pen.png'),
        success: require('@/assets/img/crusher_history_quest/success/pen.png'),
      },
      SHORT_REVIEW_3: {
        empty: require('@/assets/img/crusher_history_quest/empty/camera.png'),
        success: require('@/assets/img/crusher_history_quest/success/camera.png'),
      },
      SHORT_REVIEW_4: {
        empty: require('@/assets/img/crusher_history_quest/empty/pen.png'),
        success: require('@/assets/img/crusher_history_quest/success/pen.png'),
      },
      SHORT_REVIEW_5: {
        empty: require('@/assets/img/crusher_history_quest/empty/camera.png'),
        success: require('@/assets/img/crusher_history_quest/success/camera.png'),
      },
      SHORT_REVIEW_6: {
        empty: require('@/assets/img/crusher_history_quest/empty/pen.png'),
        success: require('@/assets/img/crusher_history_quest/success/pen.png'),
      },
      LONG_REVIEW_1: {
        empty: require('@/assets/img/crusher_history_quest/empty/star2.png'),
        success: require('@/assets/img/crusher_history_quest/success/medal_red.png'),
      },
      LONG_REVIEW_2: {
        empty: require('@/assets/img/crusher_history_quest/empty/star2.png'),
        success: require('@/assets/img/crusher_history_quest/success/medal_blue.png'),
      },
      APP_USAGE_REVIEW: {
        empty: require('@/assets/img/crusher_history_quest/empty/review.png'),
        success: require('@/assets/img/crusher_history_quest/success/review.png'),
      },
      CONQUER_QUEST: {
        empty: require('@/assets/img/crusher_history_quest/empty/flag.png'),
        success: require('@/assets/img/crusher_history_quest/success/quest1.png'),
      },
    },
  },
  CRUSHER_CREW: {
    label: '정복',
    source: require('@/assets/img/img_crusher_history_conqueror.png'),
    questMap: {
      STARTING_DAY: {
        empty: require('@/assets/img/crusher_history_quest/empty/star.png'),
        success: require('@/assets/img/crusher_history_quest/success/starting.png'),
      },
      WARMING_UP_CONQUER: {
        empty: require('@/assets/img/crusher_history_quest/empty/flag.png'),
        success: require('@/assets/img/crusher_history_quest/success/warming_up.png'),
      },
      CONQUER_1: {
        empty: require('@/assets/img/crusher_history_quest/empty/flag.png'),
        success: require('@/assets/img/crusher_history_quest/success/quest1.png'),
      },
      CONQUER_2: {
        empty: require('@/assets/img/crusher_history_quest/empty/flag.png'),
        success: require('@/assets/img/crusher_history_quest/success/quest2.png'),
      },
      CONQUER_3: {
        empty: require('@/assets/img/crusher_history_quest/empty/flag.png'),
        success: require('@/assets/img/crusher_history_quest/success/quest3.png'),
      },
      CONQUER_4: {
        empty: require('@/assets/img/crusher_history_quest/empty/flag.png'),
        success: require('@/assets/img/crusher_history_quest/success/quest4.png'),
      },
      DAILY_LIFE_QUEST: {
        empty: require('@/assets/img/crusher_history_quest/empty/life.png'),
        success: require('@/assets/img/crusher_history_quest/success/life.png'),
      },
    },
  },
};

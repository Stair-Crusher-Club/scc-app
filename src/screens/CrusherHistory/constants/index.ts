import {ImageSourcePropType} from 'react-native';

export type CrewRole = 'editor' | 'conqueror';

export type Quest = {
  title: string;
  source: {
    empty: ImageSourcePropType;
    success: ImageSourcePropType;
  };
};

export type Asset = {
  label: string;
  source: ImageSourcePropType;
  quests: Quest[];
};

export const crewInfoAssets: Record<CrewRole, Asset> = {
  editor: {
    label: '에디터',
    source: require('@/assets/img/img_crusher_history_editor.png'),
    quests: [
      {
        title: '스타딩데이',
        source: {
          empty: require('@/assets/img/crusher_history_quest/empty/star.png'),
          success: require('@/assets/img/crusher_history_quest/success/starting.png'),
        },
      },
      {
        title: '숏리뷰 1',
        source: {
          empty: require('@/assets/img/crusher_history_quest/empty/camera.png'),
          success: require('@/assets/img/crusher_history_quest/success/camera.png'),
        },
      },
      {
        title: '숏리뷰 2',
        source: {
          empty: require('@/assets/img/crusher_history_quest/empty/pen.png'),
          success: require('@/assets/img/crusher_history_quest/success/pen.png'),
        },
      },
      {
        title: '숏리뷰 3',
        source: {
          empty: require('@/assets/img/crusher_history_quest/empty/camera.png'),
          success: require('@/assets/img/crusher_history_quest/success/camera.png'),
        },
      },
      {
        title: '숏리뷰 4',
        source: {
          empty: require('@/assets/img/crusher_history_quest/empty/pen.png'),
          success: require('@/assets/img/crusher_history_quest/success/pen.png'),
        },
      },
      {
        title: '숏리뷰 5',
        source: {
          empty: require('@/assets/img/crusher_history_quest/empty/camera.png'),
          success: require('@/assets/img/crusher_history_quest/success/camera.png'),
        },
      },
      {
        title: '숏리뷰 6',
        source: {
          empty: require('@/assets/img/crusher_history_quest/empty/pen.png'),
          success: require('@/assets/img/crusher_history_quest/success/pen.png'),
        },
      },
      {
        title: '롱리뷰 1',
        source: {
          empty: require('@/assets/img/crusher_history_quest/empty/star2.png'),
          success: require('@/assets/img/crusher_history_quest/success/medal_red.png'),
        },
      },
      {
        title: '롱리뷰 2',
        source: {
          empty: require('@/assets/img/crusher_history_quest/empty/star2.png'),
          success: require('@/assets/img/crusher_history_quest/success/medal_blue.png'),
        },
      },
      {
        title: '앱 사용리뷰',
        source: {
          empty: require('@/assets/img/crusher_history_quest/empty/review.png'),
          success: require('@/assets/img/crusher_history_quest/success/review.png'),
        },
      },
      {
        title: '정복 퀘스트',
        source: {
          empty: require('@/assets/img/crusher_history_quest/empty/flag.png'),
          success: require('@/assets/img/crusher_history_quest/success/quest1.png'),
        },
      },
    ],
  },
  conqueror: {
    label: '정복',
    source: require('@/assets/img/img_crusher_history_conqueror.png'),
    quests: [
      {
        title: '스타딩데이',
        source: {
          empty: require('@/assets/img/crusher_history_quest/empty/star.png'),
          success: require('@/assets/img/crusher_history_quest/success/starting.png'),
        },
      },
      {
        title: '워밍업 정복활동',
        source: {
          empty: require('@/assets/img/crusher_history_quest/empty/flag.png'),
          success: require('@/assets/img/crusher_history_quest/success/warming_up.png'),
        },
      },
      {
        title: '정복활동 1',
        source: {
          empty: require('@/assets/img/crusher_history_quest/empty/flag.png'),
          success: require('@/assets/img/crusher_history_quest/success/quest1.png'),
        },
      },
      {
        title: '정복활동 2',
        source: {
          empty: require('@/assets/img/crusher_history_quest/empty/flag.png'),
          success: require('@/assets/img/crusher_history_quest/success/quest2.png'),
        },
      },
      {
        title: '정복활동 3',
        source: {
          empty: require('@/assets/img/crusher_history_quest/empty/flag.png'),
          success: require('@/assets/img/crusher_history_quest/success/quest3.png'),
        },
      },
      {
        title: '정복활동 4',
        source: {
          empty: require('@/assets/img/crusher_history_quest/empty/flag.png'),
          success: require('@/assets/img/crusher_history_quest/success/quest4.png'),
        },
      },
      {
        title: '일상과 퀘스트',
        source: {
          empty: require('@/assets/img/crusher_history_quest/empty/life.png'),
          success: require('@/assets/img/crusher_history_quest/success/life.png'),
        },
      },
    ],
  },
};

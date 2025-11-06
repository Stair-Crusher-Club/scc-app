import {
  NativeStackNavigationOptions,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import AddCommentScreen, {
  AddCommentScreenParams,
} from '@/screens/AddCommentScreen';
import BuildingFormScreen, {
  BuildingFormScreenParams,
} from '@/screens/BuildingFormScreen';
import BuildingFormV2Screen, {
  BuildingFormV2ScreenParams,
} from '@/screens/BuildingFormV2Screen';
import {CameraScreenParams} from '@/screens/CameraScreen';
import CameraScreen from '@/screens/CameraScreen/CameraScreen';
import ChallengeDetailScreen, {
  ChallengeDetailScreenParams,
} from '@/screens/ChallengeDetailScreen';
import ConquererHistoryScreen from '@/screens/ConquererHistoryScreen';
import ConquererMonthlyScreen, {
  ConquererMonthlyScreenParams,
} from '@/screens/ConquererMonthlyScreen';
import ConquererScreen from '@/screens/ConquererScreen';
import ConquererUpVoteScreen from '@/screens/ConquererUpVoteScreen';
import CrusherActivityScreen, {
  CrusherActivityScreenParams,
} from '@/screens/CrusherActivity';
import ExternalAccessibilityDetailScreen, {
  ExternalAccessibilityDetailScreenParams,
} from '@/screens/ExternalAccessibilityDetailScreen';
import FavoritePlacesScreen from '@/screens/FavoritePlacesScreen';
import GuideForFirstVisitScreen from '@/screens/GuideForFirstVisitScreen';
import ImageZoomViewerScreen, {
  ImageZoomViewerScreenParams,
} from '@/screens/ImageZoomViewerScreen';
import IntroScreen from '@/screens/IntroScreen';
import LoginScreen, {LoginScreenParams} from '@/screens/LoginScreen';
import MainScreen from '@/screens/MainScreen';
import PlaceDetailScreen, {
  PlaceDetailScreenParams,
} from '@/screens/PlaceDetailScreen';
import PlaceDetailV2Screen, {
  PlaceDetailV2ScreenParams,
} from '@/screens/PlaceDetailV2Screen';
import PlaceFormScreen, {
  PlaceFormScreenParams,
} from '@/screens/PlaceFormScreen';
import PlaceFormV2Screen, {
  PlaceFormV2ScreenParams,
} from '@/screens/PlaceFormV2Screen';
import PlacePhotoGuideScreen from '@/screens/PlacePhotoGuideScreen';
import {PlacePhotoGuideScreenParams} from '@/screens/PlacePhotoGuideScreen/PlacePhotoGuideScreen';
import PlaceReviewFormScreen, {
  PlaceReviewFormScreenParams,
} from '@/screens/PlaceReviewFormScreen';
import {ProfileEditorDetailScreen} from '@/screens/ProfileEditorScreen';
import {ProfileEditorDetailScreenParams} from '@/screens/ProfileEditorScreen/ProfileEditorDetailScreen';
import ProfileEditorScreen from '@/screens/ProfileEditorScreen/ProfileEditorScreen';
import RegistrationCompleteScreen, {
  RegistrationCompleteScreenParams,
} from '@/screens/RegistrationCompleteScreen';
import ReviewHistoryScreen from '@/screens/ReviewHistoryScreen';
import ReviewScreen from '@/screens/ReviewScreen';
import ReviewUpVoteScreen from '@/screens/ReviewUpVoteScreen';
import SearchScreen, {SearchScreenParams} from '@/screens/SearchScreen';
import SettingScreen from '@/screens/SettingScreen';
import SignupScreen, {SignupScreenParams} from '@/screens/SignupScreen';
import ToiletMapScreen from '@/screens/ToiletMapScreen';
import ToiletReviewFormScreen, {
  ToiletReviewFormScreenParams,
} from '@/screens/ToiletReviewFormScreen';
import UpvoteAnalyticsScreen, {
  UpvoteAnalyticsScreenProps,
} from '@/screens/UpvoteAnalyticsScreen';
import WebViewScreen, {WebViewScreenParams} from '@/screens/WebViewScreen';

export type CustomNavigationOptions = NativeStackNavigationOptions & {
  variant?: 'back' | 'close';
};

export const MainNavigationScreens: {
  name: keyof ScreenParams;
  component: React.ComponentType<any>;
  options?: CustomNavigationOptions;
}[] = [
  {name: 'Intro', component: IntroScreen},
  {name: 'Main', component: MainScreen},
  {
    name: 'Search',
    component: SearchScreen,
    options: {headerShown: false},
  },
  {name: 'Login', component: LoginScreen},
  {
    name: 'Signup',
    component: SignupScreen,
    options: {headerShown: true, headerTitle: ''},
  },
  {
    name: 'Setting',
    component: SettingScreen,
    options: {headerShown: true, headerTitle: '설정'},
  },
  {
    name: 'Review',
    component: ReviewScreen,
    options: {headerShown: true, headerTitle: '내 리뷰'},
  },
  {
    name: 'Review/History',
    component: ReviewHistoryScreen,
    options: {headerShown: true, headerTitle: '내가 작성한 리뷰'},
  },
  {
    name: 'Review/Upvote',
    component: ReviewUpVoteScreen,
    options: {headerShown: true, headerTitle: '도움이 돼요'},
  },
  {
    name: 'Conquerer',
    component: ConquererScreen,
    options: {headerShown: true, headerTitle: '정복한 장소'},
  },
  {
    name: 'Conquerer/History',
    component: ConquererHistoryScreen,
    options: {headerShown: true, headerTitle: '내가 정복한 장소'},
  },
  {
    name: 'Conquerer/Upvote',
    component: ConquererUpVoteScreen,
    options: {headerShown: true, headerTitle: '도움이 돼요'},
  },
  {
    name: 'UpvoteAnalytics',
    component: UpvoteAnalyticsScreen,
    options: {headerShown: true, headerTitle: '도움돼요'},
  },
  {name: 'Camera', component: CameraScreen},
  {
    name: 'FavoritePlaces',
    component: FavoritePlacesScreen,
    options: {headerShown: true, headerTitle: '저장한 장소'},
  },
  {
    name: 'CrusherActivity',
    component: CrusherActivityScreen,
    options: {headerShown: true, headerTitle: '크러셔 활동'},
  },
  {
    name: 'PlaceForm',
    component: PlaceFormScreen,
    options: {headerShown: true, headerTitle: '장소 등록하기'},
  },
  {
    name: 'PlaceFormV2',
    component: PlaceFormV2Screen,
    options: {
      headerShown: true,
      headerTitle: '장소 접근성 입력하기',
      variant: 'close',
    },
  },
  {name: 'PlaceDetail', component: PlaceDetailScreen},
  {name: 'PlaceDetailV2', component: PlaceDetailV2Screen},
  {
    name: 'ExternalAccessibilityDetail',
    component: ExternalAccessibilityDetailScreen,
  },
  {
    name: 'BuildingForm',
    component: BuildingFormScreen,
    options: {headerShown: true, headerTitle: '건물 등록하기'},
  },
  {
    name: 'BuildingFormV2',
    component: BuildingFormV2Screen,
    options: {
      headerShown: true,
      headerTitle: '건물 정보 등록하기',
      variant: 'close',
    },
  },
  {
    name: 'AddComment',
    component: AddCommentScreen,
    options: {headerShown: true, headerTitle: '의견 추가하기'},
  },
  {
    name: 'ChallengeDetail',
    component: ChallengeDetailScreen,
    options: {headerShown: true, headerTitle: '계단뿌셔 챌린지'},
  },
  {
    name: 'ProfileEditor',
    component: ProfileEditorScreen,
    options: {headerShown: true, headerTitle: '프로필 수정'},
  },
  {
    name: 'ProfileEditor/Detail',
    component: ProfileEditorDetailScreen,
    options: {headerShown: true, headerTitle: ''},
  },

  // modals
  {
    name: 'Conquerer/Monthly',
    component: ConquererMonthlyScreen,
    options: {presentation: 'modal'},
  },

  // fullscreen modals
  {
    name: 'GuideForFirstVisit',
    component: GuideForFirstVisitScreen,
    options: {presentation: 'fullScreenModal'},
  },
  {
    name: 'PlacePhotoGuide',
    component: PlacePhotoGuideScreen,
    options: {
      presentation: 'fullScreenModal',
    },
  },
  {
    name: 'Webview',
    component: WebViewScreen,
    options: {presentation: 'fullScreenModal'},
  },
  {
    name: 'ToiletMap',
    component: ToiletMapScreen,
    options: {headerShown: false},
  },
  {
    name: 'ImageZoomViewer',
    component: ImageZoomViewerScreen,
    options: {presentation: 'fullScreenModal'},
  },
  {
    name: 'RegistrationComplete',
    component: RegistrationCompleteScreen,
    options: {presentation: 'fullScreenModal', headerShown: false},
  },
  {
    name: 'ReviewForm/Place',
    component: PlaceReviewFormScreen,
    options: {
      headerShown: true,
      headerTitle: '방문 후기 작성하기',
      variant: 'close',
      gestureEnabled: false,
    },
  },
  {
    name: 'ReviewForm/Toilet',
    component: ToiletReviewFormScreen,
    options: {
      headerShown: true,
      headerTitle: '화장실 정보 작성하기',
      variant: 'close',
      gestureEnabled: false,
    },
  },
];

export type ScreenParams = {
  Intro: undefined;
  Login?: LoginScreenParams;
  Signup: SignupScreenParams;

  // 홈 탭 - 장소 및 건물 등록
  Main: undefined;
  Search: SearchScreenParams;
  Camera: CameraScreenParams;
  PlaceForm: PlaceFormScreenParams;
  PlaceFormV2: PlaceFormV2ScreenParams;
  PlaceDetail: PlaceDetailScreenParams;
  PlaceDetailV2: PlaceDetailV2ScreenParams;
  ExternalAccessibilityDetail: ExternalAccessibilityDetailScreenParams;
  BuildingForm: BuildingFormScreenParams;
  BuildingFormV2: BuildingFormV2ScreenParams;
  AddComment: AddCommentScreenParams;

  // 챌린지 탭
  Challenge: undefined;
  ChallengeDetail: ChallengeDetailScreenParams;

  // 메뉴 탭
  Menu: undefined;
  ProfileEditor: undefined;
  'ProfileEditor/Detail': ProfileEditorDetailScreenParams;
  Review: undefined;
  'Review/History': undefined;
  'Review/Upvote': undefined;
  Conquerer: undefined;
  'Conquerer/History': undefined;
  'Conquerer/Monthly': ConquererMonthlyScreenParams;
  'Conquerer/Upvote': undefined;
  UpvoteAnalytics: UpvoteAnalyticsScreenProps;
  FavoritePlaces: undefined;
  CrusherActivity: CrusherActivityScreenParams;

  // 리뷰
  'ReviewForm/Place': PlaceReviewFormScreenParams;
  'ReviewForm/Toilet': ToiletReviewFormScreenParams;

  Setting: undefined;
  MapTest: undefined;
  ToiletMap: undefined;

  // fullscreen modals
  GuideForFirstVisit: undefined;
  PlacePhotoGuide: PlacePhotoGuideScreenParams;
  Webview: WebViewScreenParams;
  ImageZoomViewer: ImageZoomViewerScreenParams;
  RegistrationComplete: RegistrationCompleteScreenParams;
};

export type ScreenProps<Name extends keyof ScreenParams> =
  NativeStackScreenProps<ScreenParams, Name>;

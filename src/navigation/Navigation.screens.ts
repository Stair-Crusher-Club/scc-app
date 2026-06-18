import {
  NativeStackNavigationOptions,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import AddCommentScreen, {
  AddCommentScreenParams,
} from '@/screens/AddCommentScreen';
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
import ToiletDetailScreen, {
  ToiletDetailScreenParams,
} from '@/screens/ToiletDetailScreen';
import PlaceListDetailScreen, {
  PlaceListDetailScreenParams,
} from '@/screens/PlaceListDetailScreen';
import GuideForFirstVisitScreen from '@/screens/GuideForFirstVisitScreen';
import ImageZoomViewerScreen, {
  ImageZoomViewerScreenParams,
} from '@/screens/ImageZoomViewerScreen';
import IntroScreen from '@/screens/IntroScreen';
import LoginScreen, {LoginScreenParams} from '@/screens/LoginScreen';
import MainScreen from '@/screens/MainScreen';
import PastSeasonDetailScreen, {
  PastSeasonDetailScreenParams,
} from '@/screens/PastSeasonDetail';
import PlaceDetailV2Screen, {
  PlaceDetailV2ScreenParams,
} from '@/screens/PlaceDetailV2Screen';
import PlaceFormV2Screen, {
  PlaceFormV2ScreenParams,
} from '@/screens/PlaceFormV2Screen';
import FavoritePlacesScreen from '@/screens/FavoritePlacesScreen';
import MySavesScreen from '@/screens/MySavesScreen';
import PlacePhotoGuideScreen from '@/screens/PlacePhotoGuideScreen';
import {PlacePhotoGuideScreenParams} from '@/screens/PlacePhotoGuideScreen/PlacePhotoGuideScreen';
import PlaceReviewFormScreen, {
  PlaceReviewFormScreenParams,
} from '@/screens/PlaceReviewFormScreen';
import ReportCorrectionFormScreen, {
  ReportCorrectionFormScreenParams,
} from '@/screens/ReportCorrectionFormScreen';
import {ProfileEditorDetailScreen} from '@/screens/ProfileEditorScreen';
import {ProfileEditorDetailScreenParams} from '@/screens/ProfileEditorScreen/ProfileEditorDetailScreen';
import ProfileEditorScreen from '@/screens/ProfileEditorScreen/ProfileEditorScreen';
import RegistrationCompleteScreen, {
  RegistrationCompleteScreenParams,
} from '@/screens/RegistrationCompleteScreen';
import ReviewHistoryScreen from '@/screens/ReviewHistoryScreen';
import ReviewScreen from '@/screens/ReviewScreen';
import ReviewUpVoteScreen from '@/screens/ReviewUpVoteScreen';
import {SearchScreenParams} from '@/screens/SearchScreen';
import SearchUnconqueredPlacesScreen, {
  SearchUnconqueredPlacesScreenParams,
} from '@/screens/SearchUnconqueredPlacesScreen';
import SettingScreen from '@/screens/SettingScreen';
import SignupScreen, {SignupScreenParams} from '@/screens/SignupScreen';
import TutorialScreen from '@/screens/TutorialScreen';
import TutorialMissionScreen, {
  TutorialMissionScreenParams,
} from '@/screens/TutorialMissionScreen';
import TutorialUpvoteAccessibilityMissionScreen from '@/screens/TutorialUpvoteAccessibilityMissionScreen';
import EditInterestedRegionScreen, {
  EditInterestedRegionScreenParams,
} from '@/screens/EditInterestedRegionScreen';
import EditInterestedThemesScreen, {
  EditInterestedThemesScreenParams,
} from '@/screens/EditInterestedThemesScreen';
import InterestedRegionAndThemesFormScreen, {
  InterestedRegionAndThemesFormScreenParams,
} from '@/screens/InterestedRegionAndThemesFormScreen';
import PublicPlaceListsScreen, {
  PublicPlaceListsScreenParams,
} from '@/screens/PublicPlaceListsScreen';
import ToiletReviewFormScreen, {
  ToiletReviewFormScreenParams,
} from '@/screens/ToiletReviewFormScreen';
import UpvoteAnalyticsScreen, {
  UpvoteAnalyticsScreenProps,
} from '@/screens/UpvoteAnalyticsScreen';
import ResolvingSharedLinkScreen, {
  ResolvingSharedLinkScreenParams,
} from '@/screens/ResolvingSharedLinkScreen';
import WebViewScreen, {WebViewScreenParams} from '@/screens/WebViewScreen';

export type CustomNavigationOptions = NativeStackNavigationOptions & {
  variant?: 'back' | 'close';
  onBackPress?: () => void;
};

export const MainNavigationScreens: {
  name: keyof ScreenParams;
  component: React.ComponentType<any>;
  options?: CustomNavigationOptions;
}[] = [
  {name: 'Intro', component: IntroScreen},
  {name: 'Main', component: MainScreen},
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
  {name: 'Camera', component: CameraScreen, options: {freezeOnBlur: true}},
  {
    name: 'CrusherActivity',
    component: CrusherActivityScreen,
    options: {headerShown: true, headerTitle: '크러셔 활동'},
  },
  {
    name: 'PastSeasonDetail',
    component: PastSeasonDetailScreen,
    options: {headerShown: true, headerTitle: '크러셔 활동'},
  },
  {
    name: 'PlaceFormV2',
    component: PlaceFormV2Screen,
    options: {
      headerShown: true,
      headerTitle: '장소 접근성 입력하기',
      variant: 'close',
      gestureEnabled: false,
    },
  },
  {name: 'PlaceDetailV2', component: PlaceDetailV2Screen},
  {
    name: 'ToiletDetail',
    component: ToiletDetailScreen,
  },
  {
    name: 'BuildingFormV2',
    component: BuildingFormV2Screen,
    options: {
      headerShown: true,
      headerTitle: '건물 정보 등록하기',
      variant: 'close',
      gestureEnabled: false,
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
    name: 'MySaves',
    component: MySavesScreen,
    options: {headerShown: true, headerTitle: '내 저장'},
  },
  {
    name: 'FavoritePlaces',
    component: FavoritePlacesScreen,
    options: {headerShown: true, headerTitle: '내가 저장한 장소'},
  },
  {
    name: 'PlaceListDetail',
    component: PlaceListDetailScreen,
    options: {headerShown: false, freezeOnBlur: true},
  },
  {
    // deep link 하위호환: place-group/:id → PlaceListDetail
    name: 'PlaceGroupMap',
    component: PlaceListDetailScreen,
    options: {headerShown: false, freezeOnBlur: true},
  },
  {
    name: 'SearchUnconqueredPlaces',
    component: SearchUnconqueredPlacesScreen,
    options: {headerShown: false, freezeOnBlur: true},
  },
  {
    name: 'ImageZoomViewer',
    component: ImageZoomViewerScreen,
    options: {presentation: 'fullScreenModal'},
  },
  {
    name: 'RegistrationComplete',
    component: RegistrationCompleteScreen,
    // 기본 push/pop slide 애니메이션으로 통일 (fullScreenModal 사용 시 닫을 때
    // 모달 vertical dismiss → pop 애니메이션이 겹쳐 파란 배경이 노출됨).
    options: {headerShown: false, gestureEnabled: false},
  },
  {
    name: 'Tutorial',
    component: TutorialScreen,
    options: {
      headerShown: false,
      gestureEnabled: false,
    },
  },
  {
    name: 'TutorialMission',
    component: TutorialMissionScreen,
    options: {
      headerShown: true,
      headerTitle: '튜토리얼',
    },
  },
  {
    name: 'InterestedRegionAndThemes',
    component: InterestedRegionAndThemesFormScreen,
    options: {
      headerShown: true,
      headerTitle: '',
      variant: 'close',
    },
  },
  {
    name: 'EditInterestedRegion',
    component: EditInterestedRegionScreen,
    options: {
      headerShown: true,
      headerTitle: '',
    },
  },
  {
    name: 'EditInterestedThemes',
    component: EditInterestedThemesScreen,
    options: {
      headerShown: true,
      headerTitle: '',
    },
  },
  {
    name: 'PublicPlaceLists',
    component: PublicPlaceListsScreen,
    options: {
      headerShown: true,
      headerTitle: '저장리스트 모음',
      variant: 'close',
    },
  },
  {
    // 튜토리얼 미션 2 (SAVE_PLACE_LIST) 전용 라우트. PublicPlaceListsScreen 컴포넌트를
    // 그대로 재사용하지만 fromTutorial=true 컨텍스트가 라우트 이름으로 명시되어 일반
    // 진입 (홈에서 PublicPlaceLists 직접 진입) 과 분리된다. 진입 컨텍스트가 분명하니
    // 자식 PlaceListDetail 에서도 fromTutorial chain 으로 미션 완료 트리거 여부를 판단한다.
    name: 'TutorialMissionSavePlaceList',
    component: PublicPlaceListsScreen,
    options: {
      headerShown: true,
      headerTitle: '저장리스트 모음',
      variant: 'close',
    },
  },
  {
    name: 'TutorialUpvoteAccessibilityMission',
    component: TutorialUpvoteAccessibilityMissionScreen,
    options: {
      // 화면 내부에서 V2AppBar 를 직접 sticky 로 렌더하므로 native header 는 숨긴다.
      headerShown: false,
    },
  },
  {
    name: 'ReportCorrectionForm',
    component: ReportCorrectionFormScreen,
    options: {
      headerShown: true,
      headerTitle: '정보 수정 신고',
      variant: 'close',
      gestureEnabled: false,
    },
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
  {
    name: 'ResolvingSharedLink',
    component: ResolvingSharedLinkScreen,
    options: {headerShown: false},
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
  PlaceFormV2: PlaceFormV2ScreenParams;
  PlaceDetailV2: PlaceDetailV2ScreenParams;
  ToiletDetail: ToiletDetailScreenParams;
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
  MySaves: undefined;
  FavoritePlaces: undefined;
  PlaceListDetail: PlaceListDetailScreenParams;
  PlaceGroupMap: PlaceListDetailScreenParams;
  CrusherActivity: CrusherActivityScreenParams;
  PastSeasonDetail: PastSeasonDetailScreenParams;

  // 신고 교정
  ReportCorrectionForm: ReportCorrectionFormScreenParams;

  // 리뷰
  'ReviewForm/Place': PlaceReviewFormScreenParams;
  'ReviewForm/Toilet': ToiletReviewFormScreenParams;

  Setting: undefined;
  MapTest: undefined;
  SearchUnconqueredPlaces: SearchUnconqueredPlacesScreenParams;

  // fullscreen modals
  GuideForFirstVisit: undefined;
  PlacePhotoGuide: PlacePhotoGuideScreenParams;
  Webview: WebViewScreenParams;
  ImageZoomViewer: ImageZoomViewerScreenParams;
  RegistrationComplete: RegistrationCompleteScreenParams;
  Tutorial: undefined;
  TutorialMission: TutorialMissionScreenParams;
  InterestedRegionAndThemes: InterestedRegionAndThemesFormScreenParams;
  EditInterestedRegion: EditInterestedRegionScreenParams;
  EditInterestedThemes: EditInterestedThemesScreenParams;
  PublicPlaceLists: PublicPlaceListsScreenParams;
  TutorialMissionSavePlaceList: PublicPlaceListsScreenParams;
  TutorialUpvoteAccessibilityMission: undefined;
  ResolvingSharedLink: ResolvingSharedLinkScreenParams;

  // 웹 전용 화면 (Platform.OS === 'web' 에서만 등록됨; webScreens 참조)
  BbucleRoad: {bbucleRoadId: string};
  BbucleRoadList: undefined;
  KakaoCallback: undefined;
};

export type ScreenProps<Name extends keyof ScreenParams> =
  NativeStackScreenProps<ScreenParams, Name>;

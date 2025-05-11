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
import {
  BuildingCamera,
  CameraScreenParams,
  PlaceCamera,
} from '@/screens/CameraScreen';
import ChallengeDetailScreen, {
  ChallengeDetailScreenParams,
} from '@/screens/ChallengeDetailScreen';
import ConquererHistoryScreen from '@/screens/ConquererHistoryScreen';
import ConquererMonthlyScreen, {
  ConquererMonthlyScreenParams,
} from '@/screens/ConquererMonthlyScreen';
import ConquererScreen from '@/screens/ConquererScreen';
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
import PlaceFormScreen, {
  PlaceFormScreenParams,
} from '@/screens/PlaceFormScreen';
import PlacePhotoGuideScreen from '@/screens/PlacePhotoGuideScreen';
import {ProfileEditorDetailScreen} from '@/screens/ProfileEditorScreen';
import {ProfileEditorDetailScreenParams} from '@/screens/ProfileEditorScreen/ProfileEditorDetailScreen';
import ProfileEditorScreen from '@/screens/ProfileEditorScreen/ProfileEditorScreen';
import SearchScreen, {SearchScreenParams} from '@/screens/SearchScreen';
import SettingScreen from '@/screens/SettingScreen';
import SignupScreen, {SignupScreenParams} from '@/screens/SignupScreen';
import ToiletMapScreen from '@/screens/ToiletMapScreen';
import WebViewScreen, {WebViewScreenParams} from '@/screens/WebViewScreen';

export const MainNavigationScreens: {
  name: keyof ScreenParams;
  component: React.ComponentType<any>;
  options?: NativeStackNavigationOptions;
}[] = [
  {name: 'Intro', component: IntroScreen},
  {name: 'Main', component: MainScreen},
  {
    name: 'Search',
    component: SearchScreen,
    options: {headerShown: true, headerTitle: '장소 검색'},
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
    name: 'Conquerer',
    component: ConquererScreen,
    options: {headerShown: true, headerTitle: '정복활동 리포트'},
  },
  {
    name: 'Conquerer/History',
    component: ConquererHistoryScreen,
    options: {headerShown: true, headerTitle: '지금까지 내가 정복한 장소'},
  },
  {name: 'Camera/Building', component: BuildingCamera},
  {name: 'Camera/Place', component: PlaceCamera},
  {
    name: 'FavoritePlaces',
    component: FavoritePlacesScreen,
    options: {headerShown: true, headerTitle: '내가 저장한 장소'},
  },
  {
    name: 'PlaceForm',
    component: PlaceFormScreen,
    options: {headerShown: true, headerTitle: '장소 등록하기'},
  },
  {name: 'PlaceDetail', component: PlaceDetailScreen},
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
  },
  {
    name: 'ImageZoomViewer',
    component: ImageZoomViewerScreen,
    options: {presentation: 'fullScreenModal'},
  },
];

export type ScreenParams = {
  Intro: undefined;
  Login?: LoginScreenParams;
  Signup: SignupScreenParams;

  // 홈 탭 - 장소 및 건물 등록
  Main: undefined;
  Search: SearchScreenParams;
  'Camera/Building': CameraScreenParams;
  'Camera/Place': CameraScreenParams;
  PlaceForm: PlaceFormScreenParams;
  PlaceDetail: PlaceDetailScreenParams;
  ExternalAccessibilityDetail: ExternalAccessibilityDetailScreenParams;
  BuildingForm: BuildingFormScreenParams;
  AddComment: AddCommentScreenParams;

  // 챌린지 탭
  Challenge: undefined;
  ChallengeDetail: ChallengeDetailScreenParams;

  // 메뉴 탭
  Menu: undefined;
  ProfileEditor: undefined;
  'ProfileEditor/Detail': ProfileEditorDetailScreenParams;
  Conquerer: undefined;
  'Conquerer/History': undefined;
  'Conquerer/Monthly': ConquererMonthlyScreenParams;
  FavoritePlaces: undefined;

  Setting: undefined;
  MapTest: undefined;
  ToiletMap: undefined;

  // fullscreen modals
  GuideForFirstVisit: undefined;
  PlacePhotoGuide: undefined;
  Webview: WebViewScreenParams;
  ImageZoomViewer: ImageZoomViewerScreenParams;
};

export type ScreenProps<Name extends keyof ScreenParams> =
  NativeStackScreenProps<ScreenParams, Name>;

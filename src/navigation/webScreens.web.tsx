import BbucleRoadScreen from '../../web/screens/BbucleRoadScreen';
import BbucleRoadListScreen from '../../web/screens/BbucleRoadListScreen';
import KakaoCallbackScreen from '../../web/screens/KakaoCallbackScreen';

import {MainNavigationScreens} from './Navigation.screens';

// Web-only screens registered into the app navigator on web. bbucle-road is
// web-only content (viewable without a token); KakaoCallback handles the Kakao
// web OAuth redirect.
export const webOnlyScreens: typeof MainNavigationScreens = [
  {name: 'BbucleRoad', component: BbucleRoadScreen},
  {name: 'BbucleRoadList', component: BbucleRoadListScreen},
  {name: 'KakaoCallback', component: KakaoCallbackScreen},
];

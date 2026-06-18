export const DEEP_LINK_PREFIXES = [
  'stair-crusher://',
  'https://scc.airbridge.io/',
  'https://app.staircrusher.club/',
];

// PlaceDetailV2 path uses the placeId string directly as the URL segment.
const placeDetailV2Linking = {
  path: 'place/:placeInfo',
  parse: {
    placeInfo: (placeId: string) => {
      return {placeId};
    },
  },
  stringify: {
    placeInfo: (placeInfo: {placeId: string}) => {
      return placeInfo.placeId;
    },
  },
};

export const linkingScreensConfig = {
  initialRouteName: 'Main' as any,
  screens: {
    ProfileEditor: 'profile',
    Setting: 'setting',
    PlaceDetailV2: placeDetailV2Linking,
    ChallengeDetail: {
      path: 'challenge/:challengeId',
    },
    Webview: {
      path: 'webview',
    },
    Search: {
      path: 'search',
      parse: {
        searchQuery: (searchQuery?: string) => {
          return searchQuery || undefined;
        },
      },
    },
    PlaceGroupMap: {
      path: 'place-group/:placeListId',
    },
    CrusherActivity: {
      path: 'crusher-activity',
    },
    'Review/Upvote': {
      path: 'review/upvote',
    },
    'Conquerer/Upvote': {
      path: 'conquerer/upvote',
    },
    SearchUnconqueredPlaces: {
      path: 'search-unconquered-places',
    },
    PlaceListDetail: {
      path: 'place-list/:placeListId',
    },
    TutorialMission: {
      path: 'tutorial-mission',
    },
    InterestedRegionAndThemes: {
      path: 'interested-region-and-themes',
    },
    PublicPlaceLists: {
      path: 'public-place-lists',
    },
    TutorialUpvoteAccessibilityMission: {
      path: 'tutorial-mission-upvote-accessibility',
    },
  },
};

// Web-only linking config: drives browser URLs (NavigationContainer syncs with
// window.location on web). Kept beside the native config so URL ↔ screen mapping
// stays in one place. Adds web-only routes (bbucle-road, oauth/kakao) and nests
// the bottom-tab screens for clean /home, /search URLs.
export const webLinkingScreensConfig = {
  initialRouteName: 'Intro' as any,
  screens: {
    Intro: '',
    Login: 'login',
    Signup: 'signup',
    Main: {
      screens: {
        Home: 'home',
        Search: 'search',
        Challenge: 'challenge',
        Menu: 'menu',
      },
    },
    PlaceDetailV2: placeDetailV2Linking,
    ToiletDetail: {path: 'toilet/:toiletId'},
    PlaceListDetail: {path: 'place-list/:placeListId'},
    PlaceGroupMap: {path: 'place-group/:placeListId'},
    ChallengeDetail: {path: 'challenge/:challengeId'},
    ProfileEditor: 'profile',
    Setting: 'setting',
    CrusherActivity: 'crusher-activity',
    PublicPlaceLists: 'public-place-lists',
    SearchUnconqueredPlaces: 'search-unconquered-places',
    MySaves: 'my-saves',
    FavoritePlaces: 'favorite-places',
    // Web-only content (viewable without a token)
    BbucleRoadList: 'bbucle-road',
    BbucleRoad: 'bbucle-road/:bbucleRoadId',
    // Kakao web OAuth redirect target
    KakaoCallback: 'oauth/kakao',
  },
};

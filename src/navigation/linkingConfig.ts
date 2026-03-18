export const DEEP_LINK_PREFIXES = [
  'stair-crusher://',
  'https://scc.airbridge.io/',
  'https://app.staircrusher.club/',
];

export const linkingScreensConfig = {
  initialRouteName: 'Main' as any,
  screens: {
    ProfileEditor: 'profile',
    Setting: 'setting',
    PlaceDetailV2: {
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
    },
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
  },
};

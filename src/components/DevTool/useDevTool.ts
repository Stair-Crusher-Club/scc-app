import {useAtom, useAtomValue} from 'jotai';
import {atom} from 'jotai';
import {useCallback} from 'react';

// DevTool configuration
interface DevToolConfig {
  searchRegion: {
    enabled: boolean;
  };
  // Add more feature configs here as needed
}

// DevTool data for each feature
export interface DevToolData {
  searchRegion: {
    type: 'circle';
    location: {
      lat: number;
      lng: number;
    };
    radiusMeters: number;
    timestamp: number;
  } | {
    type: 'rectangle';
    leftTopLocation: {
      lat: number;
      lng: number;
    };
    rightBottomLocation: {
      lat: number;
      lng: number;
    };
    timestamp: number;
  } | null;
  // Add more feature data here as needed
}

// Private atoms - only accessible through useDevTool hook
const devToolConfigAtom = atom<DevToolConfig>({
  searchRegion: {
    enabled: false,
  },
});

const devToolDataAtom = atom<DevToolData>({
  searchRegion: null,
});

export const useDevTool = () => {
  const [data, setData] = useAtom(devToolDataAtom);
  const config = useAtomValue(devToolConfigAtom);
  
  const trackSearchCircle = useCallback((location: {lat: number; lng: number}, radiusMeters: number) => {
    if (!__DEV__) return;
    
    if (config.searchRegion.enabled) {
      setData(prev => ({
        ...prev,
        searchRegion: {
          type: 'circle',
          location,
          radiusMeters,
          timestamp: Date.now(),
        },
      }));
    }
  }, [config.searchRegion.enabled, setData]);

  const trackSearchRectangle = useCallback((leftTopLocation: {lat: number; lng: number}, rightBottomLocation: {lat: number; lng: number}) => {
    if (!__DEV__) return;

    if (config.searchRegion.enabled) {
      setData(prev => ({
        ...prev,
        searchRegion: {
          type: 'rectangle',
          leftTopLocation,
          rightBottomLocation,
          timestamp: Date.now(),
        },
      }));
    }
  }, [config.searchRegion.enabled, setData]);
  
  const shouldShowSearchRadius = useCallback(() => {
    if (!__DEV__) return false;
    return config.searchRegion.enabled;
  }, [config.searchRegion.enabled]);
  
  // Return organized by feature
  return {
    searchRegion: {
      data: data.searchRegion,
      trackCircle: trackSearchCircle,
      trackRectangle: trackSearchRectangle,
      shouldShow: shouldShowSearchRadius,
      enabled: config.searchRegion.enabled,
    },
    // Add more features here as needed
    // otherDebugFeature: {
    //   data: data.otherDebugFeature,
    //   track: trackOtherFeature,
    //   shouldShow: shouldShowOtherFeature,
    //   enabled: config.otherDebugFeature.enabled,
    // },
  };
};

// Internal hook for DevTool component configuration management
export const useDevToolConfig = () => {
  return useAtom(devToolConfigAtom);
};

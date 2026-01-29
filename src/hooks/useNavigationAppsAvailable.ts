import {useEffect, useState} from 'react';
import {Linking, Platform} from 'react-native';

import {NAVIGATION_APPS} from '@/screens/PlaceDetailScreen/modals/NavigationAppsBottomSheet';

export function useNavigationAppsAvailable() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAvailability = async () => {
      if (Platform.OS === 'web') {
        setIsAvailable(false);
        return;
      }

      const results = await Promise.all(
        NAVIGATION_APPS.map(async app => {
          try {
            return await Linking.canOpenURL(app.scheme);
          } catch {
            return false;
          }
        }),
      );

      setIsAvailable(results.some(canOpen => canOpen));
    };

    checkAvailability();
  }, []);

  return isAvailable;
}

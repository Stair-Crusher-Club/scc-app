import React, {useEffect, useMemo, useState} from 'react';
import {Linking, Platform} from 'react-native';
import styled from 'styled-components/native';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import BottomSheet from '@/modals/BottomSheet';

type TransportMode = 'walking' | 'driving';

interface NavigationApp {
  id: string;
  name: string;
  scheme: string;
  getNavigationUrl: (
    lat: number,
    lng: number,
    name: string,
    mode: TransportMode,
  ) => string;
}

export const NAVIGATION_APPS: NavigationApp[] = [
  {
    id: 'naver',
    name: '네이버 지도',
    scheme: 'nmap://',
    getNavigationUrl: (lat, lng, name, mode) => {
      const routeType = mode === 'walking' ? 'walk' : 'car';
      return `nmap://route/${routeType}?dlat=${lat}&dlng=${lng}&dname=${encodeURIComponent(name)}&appname=club.staircrusher`;
    },
  },
  {
    id: 'kakao',
    name: '카카오맵',
    scheme: 'kakaomap://',
    getNavigationUrl: (lat, lng, _name, mode) => {
      const by = mode === 'walking' ? 'FOOT' : 'CAR';
      return `kakaomap://route?ep=${lat},${lng}&by=${by}`;
    },
  },
  {
    id: 'google',
    name: 'Google 지도',
    scheme: 'comgooglemaps://',
    getNavigationUrl: (lat, lng, _name, mode) => {
      const directionsMode = mode === 'walking' ? 'walking' : 'driving';
      return `comgooglemaps://?daddr=${lat},${lng}&directionsmode=${directionsMode}`;
    },
  },
  {
    id: 'tmap',
    name: 'T맵',
    scheme: 'tmap://',
    getNavigationUrl: (lat, lng, name, mode) => {
      // T맵은 도보 모드를 rGoalX, rGoalY, rGoalName + reqMode=2로 지원
      if (mode === 'walking') {
        return `tmap://route?rGoalX=${lng}&rGoalY=${lat}&rGoalName=${encodeURIComponent(name)}&reqMode=2`;
      }
      return `tmap://route?goalname=${encodeURIComponent(name)}&goaly=${lat}&goalx=${lng}`;
    },
  },
];

const WALKING_DISTANCE_THRESHOLD = 500; // meters

interface NavigationAppsBottomSheetProps {
  isVisible: boolean;
  latitude: number;
  longitude: number;
  placeName: string;
  distanceMeters?: number;
  onClose: () => void;
}

export default function NavigationAppsBottomSheet({
  isVisible,
  latitude,
  longitude,
  placeName,
  distanceMeters,
  onClose,
}: NavigationAppsBottomSheetProps) {
  const [availableApps, setAvailableApps] = useState<NavigationApp[]>([]);

  const transportMode: TransportMode = useMemo(() => {
    if (distanceMeters && distanceMeters <= WALKING_DISTANCE_THRESHOLD) {
      return 'walking';
    }
    return 'driving';
  }, [distanceMeters]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const checkAvailableApps = async () => {
      if (Platform.OS === 'web') {
        setAvailableApps([]);
        return;
      }

      const results = await Promise.all(
        NAVIGATION_APPS.map(async app => {
          try {
            const canOpen = await Linking.canOpenURL(app.scheme);
            return canOpen ? app : null;
          } catch {
            return null;
          }
        }),
      );

      setAvailableApps(results.filter((app): app is NavigationApp => !!app));
    };

    checkAvailableApps();
  }, [isVisible]);

  const handleAppPress = async (app: NavigationApp) => {
    try {
      const url = app.getNavigationUrl(
        latitude,
        longitude,
        placeName,
        transportMode,
      );
      await Linking.openURL(url);
      onClose();
    } catch {
      // Silently fail - app should be available since we checked
    }
  };

  return (
    <BottomSheet isVisible={isVisible} onPressBackground={onClose}>
      <Container>
        <Title>길찾기</Title>
        {availableApps.length === 0 ? (
          <EmptyMessage>설치된 지도 앱이 없습니다.</EmptyMessage>
        ) : (
          <AppList>
            {availableApps.map(app => (
              <AppButton
                key={app.id}
                elementName={`navigation_apps_bottom_sheet_${app.id}`}
                logParams={{app_id: app.id, transport_mode: transportMode}}
                onPress={() => handleAppPress(app)}>
                <AppName>{app.name}</AppName>
              </AppButton>
            ))}
          </AppList>
        )}
        <CloseButton
          elementName="navigation_apps_bottom_sheet_close"
          onPress={onClose}>
          <CloseButtonText>닫기</CloseButtonText>
        </CloseButton>
      </Container>
    </BottomSheet>
  );
}

const Container = styled.View`
  padding: 24px 20px;
`;

const Title = styled.Text`
  font-family: ${font.pretendardBold};
  font-size: 18px;
  color: ${color.gray100};
  margin-bottom: 16px;
`;

const AppList = styled.View`
  gap: 8px;
`;

const AppButton = styled(SccTouchableOpacity)`
  padding: 16px;
  background-color: ${color.gray10};
  border-radius: 12px;
`;

const AppName = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 16px;
  color: ${color.gray100};
`;

const EmptyMessage = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 14px;
  color: ${color.gray60};
  text-align: center;
  padding: 20px 0;
`;

const CloseButton = styled(SccTouchableOpacity)`
  margin-top: 16px;
  padding: 16px;
  background-color: ${color.gray20};
  border-radius: 12px;
  align-items: center;
`;

const CloseButtonText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 16px;
  color: ${color.gray80};
`;

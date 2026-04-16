import React from 'react';
import {Linking} from 'react-native';
import styled from 'styled-components/native';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import BottomSheet from '@/modals/BottomSheet';

interface WebNavigationApp {
  id: string;
  name: string;
  getUrl: (lat: number, lng: number, name: string) => string;
}

const WEB_NAVIGATION_APPS: WebNavigationApp[] = [
  {
    id: 'naver',
    name: '네이버 지도',
    getUrl: (lat, lng, name) =>
      `https://map.naver.com/index.nhn?elng=${lng}&elat=${lat}&etext=${encodeURIComponent(name)}&menu=route&pathType=1`,
  },
  {
    id: 'kakao',
    name: '카카오맵',
    getUrl: (lat, lng, name) =>
      `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`,
  },
  {
    id: 'google',
    name: 'Google 지도',
    getUrl: (lat, lng) =>
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`,
  },
];

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
  onClose,
}: NavigationAppsBottomSheetProps) {
  const handleAppPress = (app: WebNavigationApp) => {
    const url = app.getUrl(latitude, longitude, placeName);
    Linking.openURL(url);
    onClose();
  };

  return (
    <BottomSheet isVisible={isVisible} onPressBackground={onClose}>
      <Container>
        <Title>길찾기</Title>
        <AppList>
          {WEB_NAVIGATION_APPS.map(app => (
            <AppButton
              key={app.id}
              elementName={`navigation_apps_bottom_sheet_${app.id}`}
              onPress={() => handleAppPress(app)}>
              <AppName>{app.name}</AppName>
            </AppButton>
          ))}
        </AppList>
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

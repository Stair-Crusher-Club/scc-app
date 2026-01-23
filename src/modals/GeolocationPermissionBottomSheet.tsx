import React from 'react';
import {Linking, Platform} from 'react-native';
import styled from 'styled-components/native';

import GeolocationIcon from '@/assets/icon/ic_geolocation_permission.svg';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

import BottomSheet from './BottomSheet';
import BottomSheetButtonGroup, {
  BottomSheetButtonGroupLayout,
} from './BottomSheet/BottomSheetButtonGroup';

const ContentsContainer = styled.View({
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  paddingTop: 28,
  paddingHorizontal: 20,
});

const Title = styled.Text({
  width: '100%',
  color: color.black,
  fontSize: 20,
  fontFamily: font.pretendardBold,
  marginTop: 30,
  marginBottom: 10,
});

const Message = styled.Text({
  width: '100%',
  color: color.black,
  fontSize: 16,
  fontFamily: font.pretendardRegular,
});

export type GeolocationErrorReason =
  | 'permission_denied'
  | 'location_unavailable';

export interface GeolocationPermissionBottomSheetInitParams {
  isVisible: boolean;
  errorReason?: GeolocationErrorReason;
  onCloseButtonPressed: () => void;
}

const CONTENT = {
  permission_denied: {
    title: '앱 내 위치 권한을 허용해 주세요',
    message:
      '검색 결과를 가까운 순으로 정렬하거나 추후 지도 기능을 이용하려면 위치권한이 꼭 필요해요.',
    buttonText: '권한 설정하기',
  },
  location_unavailable: {
    title: '기기의 위치 서비스를 켜주세요',
    message:
      '휴대폰의 위치 서비스가 꺼져 있어요. 검색 결과를 가까운 순으로 정렬하거나 지도 기능을 이용하려면 위치 서비스를 켜주세요.',
    buttonText: '설정으로 이동',
  },
};

const openLocationSettings = () => {
  if (Platform.OS === 'android') {
    Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS').catch(() =>
      Linking.openSettings(),
    );
  } else {
    Linking.openURL('App-Prefs:Privacy&path=LOCATION').catch(() =>
      Linking.openSettings(),
    );
  }
};

const GeolocationPermissionBottomSheet = ({
  isVisible,
  errorReason = 'permission_denied',
  onCloseButtonPressed,
}: GeolocationPermissionBottomSheetInitParams) => {
  const content = CONTENT[errorReason];

  const handleConfirmPress = () => {
    if (errorReason === 'permission_denied') {
      Linking.openSettings();
    } else {
      openLocationSettings();
    }
  };

  return (
    <BottomSheet isVisible={isVisible}>
      <ContentsContainer>
        <GeolocationIcon width={40} height={60} />
        <Title>{content.title}</Title>
        <Message>{content.message}</Message>
      </ContentsContainer>
      <BottomSheetButtonGroup
        layout={BottomSheetButtonGroupLayout.HORIZONTAL_1X2}
        positiveButton={{
          text: content.buttonText,
          onPressed: handleConfirmPress,
        }}
        negativeButton={{
          text: '닫기',
          onPressed: () => {
            onCloseButtonPressed();
          },
        }}
      />
    </BottomSheet>
  );
};

export default GeolocationPermissionBottomSheet;

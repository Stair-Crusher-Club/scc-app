import React from 'react';
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

export interface GeolocationPermissionBottomSheetInitParams {
  isVisible: boolean;
  onConfirmButtonPressed: () => void;
  onCloseButtonPressed: () => void;
}

const GeolocationPermissionBottomSheet = ({
  isVisible,
  onConfirmButtonPressed,
  onCloseButtonPressed,
}: GeolocationPermissionBottomSheetInitParams) => {
  return (
    <BottomSheet isVisible={isVisible}>
      <ContentsContainer>
        <GeolocationIcon width={40} height={60} />
        <Title>앱 내 위치 권한을 허용해 주세요</Title>
        <Message>
          검색 결과를 가까운 순으로 정렬하거나 추후 지도 기능을 이용하려면
          위치권한이 꼭 필요해요.
        </Message>
      </ContentsContainer>
      <BottomSheetButtonGroup
        layout={BottomSheetButtonGroupLayout.HORIZONTAL_1X2}
        positiveButton={{
          text: '권한 설정하기',
          onPressed: () => {
            onConfirmButtonPressed();
          },
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

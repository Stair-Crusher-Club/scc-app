import React from 'react';
import styled from 'styled-components/native';

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
  marginTop: 10,
  marginBottom: 10,
});

const Message = styled.Text({
  width: '100%',
  color: color.black,
  fontSize: 16,
  fontFamily: font.pretendardRegular,
});

export interface AppUpgradeNeededBottomSheetInitParams {
  isVisible: boolean;
  isRequired: boolean;
  message: string;
  onConfirmButtonPressed: () => void;
  onCloseButtonPressed: () => void;
}

const AppUpgradeNeededBottomSheet = ({
  isVisible,
  isRequired,
  message,
  onConfirmButtonPressed,
  onCloseButtonPressed,
}: AppUpgradeNeededBottomSheetInitParams) => {
  return (
    <BottomSheet isVisible={isVisible}>
      <ContentsContainer>
        <Title>
          {isRequired ? '앱 업데이트가 필요합니다' : '앱 업데이트를 추천합니다'}
        </Title>
        <Message>{message}</Message>
      </ContentsContainer>
      {isRequired ? (
        <BottomSheetButtonGroup
          layout={BottomSheetButtonGroupLayout.VERTICAL}
          positiveButton={{
            text: '업데이트 하기',
            onPressed: () => {
              onConfirmButtonPressed();
            },
          }}
        />
      ) : (
        <BottomSheetButtonGroup
          layout={BottomSheetButtonGroupLayout.HORIZONTAL_1X2}
          positiveButton={{
            text: '업데이트 하기',
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
      )}
    </BottomSheet>
  );
};

export default AppUpgradeNeededBottomSheet;

import React from 'react';
import styled from 'styled-components/native';

import BottomSheet from '@/modals/BottomSheet/BottomSheet';
import BottomSheetButtonGroup, {
  BottomSheetButtonGroupLayout,
} from '@/modals/BottomSheet/BottomSheetButtonGroup';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface LocationConfirmBottomSheetProps {
  isVisible: boolean;
  address: string;
  type: 'place' | 'building';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LocationConfirmBottomSheet({
  isVisible,
  address,
  type,
  onConfirm,
  onCancel,
}: LocationConfirmBottomSheetProps) {
  return (
    <BottomSheet isVisible={isVisible} onPressBackground={onCancel}>
      <ContentsContainer>
        <Title>
          등록하려는 {type === 'building' ? '건물' : '장소'}의 주소가 올바른지
          한 번 더 확인해주세요.
        </Title>
        <Address>{address}</Address>
        <BottomSheetButtonGroup
          layout={BottomSheetButtonGroupLayout.HORIZONTAL_1X2}
          negativeButton={{
            text: '취소',
            onPressed: onCancel,
          }}
          positiveButton={{
            text: '확인',
            onPressed: onConfirm,
          }}
        />
      </ContentsContainer>
    </BottomSheet>
  );
}

const ContentsContainer = styled.View({
  paddingTop: 30,
  paddingHorizontal: 20,
});

const Title = styled.Text({
  fontSize: 18,
  fontFamily: font.pretendardBold,
  color: color.black,
  marginBottom: 12,
  lineHeight: 24,
});

const Address = styled.Text({
  fontSize: 16,
  fontFamily: font.pretendardMedium,
  color: color.gray70,
  marginBottom: 20,
  lineHeight: 22,
});

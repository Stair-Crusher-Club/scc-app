import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export enum BottomSheetButtonGroupLayout {
  HORIZONTAL, // 수평 레이아웃에 1:1 비율
  HORIZONTAL_1X2, // 수평 레이아웃에 우측 버튼이 2배
  VERTICAL,
}

type BottomSheetButton = {
  text: string;
  onPressed: () => void;
};

type BottomSheetButtonGroupProps = React.PropsWithChildren<{
  layout: BottomSheetButtonGroupLayout;
  positiveButton?: BottomSheetButton;
  negativeButton?: BottomSheetButton;
}>;

export default function BottomSheetButtonGroup({
  layout = BottomSheetButtonGroupLayout.HORIZONTAL,
  positiveButton,
  negativeButton,
}: BottomSheetButtonGroupProps) {
  const isVertical = layout === BottomSheetButtonGroupLayout.VERTICAL;
  const isHorizontal = !isVertical;

  return (
    <ButtonContainer
      style={{
        flexDirection: isHorizontal ? 'row' : 'column-reverse',
      }}>
      {negativeButton && (
        <NegativeButton
          style={{
            flex: isHorizontal ? 1 : undefined,
          }}
          onPress={negativeButton.onPressed}>
          <NegativeButtonText>{negativeButton.text}</NegativeButtonText>
        </NegativeButton>
      )}
      {positiveButton && (
        <PositiveButton
          style={{
            flex: isHorizontal
              ? layout === BottomSheetButtonGroupLayout.HORIZONTAL_1X2
                ? 2
                : 1
              : undefined,
            marginBottom: isVertical ? 10 : undefined,
            marginLeft: isHorizontal ? 10 : undefined,
          }}
          onPress={positiveButton.onPressed}>
          <PositiveButtonText>{positiveButton.text}</PositiveButtonText>
        </PositiveButton>
      )}
    </ButtonContainer>
  );
}

const ButtonContainer = styled.View({
  padding: 20,
});

const PositiveButton = styled.Pressable({
  height: 56,
  borderRadius: 20,
  backgroundColor: color.brandColor,
  justifyContent: 'center',
  alignItems: 'center',
});

const PositiveButtonText = styled.Text({
  color: color.white,
  fontSize: 18,
  fontFamily: font.pretendardBold,
});

const NegativeButton = styled.Pressable({
  height: 56,
  borderRadius: 20,
  backgroundColor: color.gray10,
  justifyContent: 'center',
  alignItems: 'center',
});

const NegativeButtonText = styled.Text({
  color: color.black,
  fontSize: 18,
  fontFamily: font.pretendardMedium,
});

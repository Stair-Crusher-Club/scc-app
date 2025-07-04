import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ImageDto} from '@/generated-sources/openapi';

interface Props {
  crusherGroupIcon?: ImageDto;
  crusherNames: string[];
}

export default function PlaceDetailCrusher({
  crusherGroupIcon,
  crusherNames,
}: Props) {
  const aspectRatio =
    crusherGroupIcon?.imageWidth && crusherGroupIcon?.imageHeight
      ? crusherGroupIcon.imageWidth / crusherGroupIcon.imageHeight
      : 1;
  const crusherName =
    crusherNames.length === 1
      ? crusherNames[0]
      : `${crusherNames[0]} 외 ${crusherNames.length - 1}명`;
  return (
    <Container>
      {crusherGroupIcon && (
        <CrusherGroupRow>
          <CrusherGroupIcon
            source={{uri: crusherGroupIcon.imageUrl}}
            aspectRatio={aspectRatio}
          />
          <CrusherGroupText numberOfLines={1}>
            이 계단뿌셔클럽과 함께했어요.
          </CrusherGroupText>
        </CrusherGroupRow>
      )}
      <CrusherRow>
        <CrusherLabel>정복자</CrusherLabel>
        <CrusherName>{crusherName || '익명 비밀요원'}</CrusherName>
      </CrusherRow>
    </Container>
  );
}

const Container = styled.View({
  flex: 1,
  gap: 8,
});

export const CrusherGroup = styled.Text({
  flex: 1,
  flexDirection: 'column',
  color: color.gray80,
  fontSize: 14,
  fontFamily: font.pretendardRegular,
});

export const CrusherGroupRow = styled.View({
  flex: 1,
  flexDirection: 'row',
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 12,
  backgroundColor: color.gray10,
  gap: 2,
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
});

export const CrusherGroupIcon = styled.Image<{aspectRatio: number}>`
  aspect-ratio: ${props => props.aspectRatio};
  height: 28px;
`;

export const CrusherGroupText = styled.Text({
  color: color.gray80,
  fontSize: 14,
  flexShrink: 1,
});

export const CrusherRow = styled.View({
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 4,
});

export const CrusherLabel = styled.Text({
  color: color.gray60,
  fontSize: 14,
  fontFamily: font.pretendardRegular,
});

export const CrusherName = styled.Text({
  color: color.gray90,
  fontSize: 14,
  fontFamily: font.pretendardMedium,
});

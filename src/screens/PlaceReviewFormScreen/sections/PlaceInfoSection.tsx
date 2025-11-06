import React from 'react';
import styled from 'styled-components/native';

import NewConquerTargetTooltip from '@/components/NewConquerTargetTooltip';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface PlaceInfoSectionProps {
  name?: string;
  address?: string;
  target?: 'place' | 'building';
}

export default function PlaceInfoSection({
  name,
  address,
  target,
}: PlaceInfoSectionProps) {
  return (
    <Container>
      <TitleRow>
        <Title>{name}</Title>
        {target && <NewConquerTargetTooltip target={target} />}
      </TitleRow>
      <Address>{address}</Address>
    </Container>
  );
}

const Container = styled.View({
  padding: 20,
  backgroundColor: color.white,
  gap: 4,
});

const TitleRow = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
});

const Title = styled.Text({
  fontSize: 20,
  lineHeight: '28px',
  fontFamily: font.pretendardBold,
});

const Address = styled.Text({
  fontSize: 14,
  lineHeight: '18px',
  color: color.gray80,
  fontFamily: font.pretendardRegular,
});

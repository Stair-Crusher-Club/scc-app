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
      {target && <NewConquerTargetTooltip target={target} />}
      <InfoContainer>
        <Title>{name}</Title>
        <Address>{address}</Address>
      </InfoContainer>
    </Container>
  );
}

const Container = styled.View({
  padding: 20,
  backgroundColor: color.white,
  alignItems: 'flex-start',
  gap: 8,
});

const InfoContainer = styled.View({
  gap: 2,
});

const Title = styled.Text({
  fontSize: 20,
  lineHeight: '28px',
  fontFamily: font.pretendardSemibold,
  color: color.gray90,
});

const Address = styled.Text({
  fontSize: 15,
  lineHeight: '22px',
  color: color.gray60,
  fontFamily: font.pretendardRegular,
});

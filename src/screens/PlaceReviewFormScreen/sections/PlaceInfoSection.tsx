import React from 'react';
import styled from 'styled-components/native';

import IcBuilding from '@/assets/icon/ic_building.svg';
import IcPlace from '@/assets/icon/ic_place.svg';
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
  const Icon = target === 'place' ? IcPlace : IcBuilding;
  const badgeText =
    target === 'place' ? '새로운 장소 발견!' : '새로운 건물 발견!';
  const badgeColor = target === 'place' ? color.orange40 : color.brand50;

  return (
    <Container>
      {target && (
        <Badge>
          <Icon width={16} height={16} />
          <BadgeText style={{color: badgeColor}}>{badgeText}</BadgeText>
        </Badge>
      )}
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

const Badge = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
});

const BadgeText = styled.Text({
  fontSize: 14,
  lineHeight: '20px',
  fontFamily: font.pretendardBold,
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

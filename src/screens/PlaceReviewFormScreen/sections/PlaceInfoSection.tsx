import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface PlaceInfoSectionProps {
  name?: string;
  address?: string;
}

export default function PlaceInfoSection({
  name,
  address,
}: PlaceInfoSectionProps) {
  return (
    <Container>
      <Title>{name}</Title>
      <Address>{address}</Address>
    </Container>
  );
}

const Container = styled.View({
  padding: 20,
  backgroundColor: color.white,
  gap: 4,
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

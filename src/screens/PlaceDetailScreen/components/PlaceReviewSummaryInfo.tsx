import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {AccessibilityInfoDto} from '@/generated-sources/openapi';

import EmptyInfo from './EmptyInfo';
import * as S from './PlaceInfo.style';

interface Props {
  accessibility?: AccessibilityInfoDto;
}

export default function PlaceReviewSummaryInfo({accessibility}: Props) {
  if (!accessibility) {
    return <EmptyInfo type="매장 내부 정보" />;
  }

  return (
    <Container>
      <HeaderRow>
        <HeaderLeft>
          <S.BigTitle>방문 리뷰</S.BigTitle>
          <ReviewCount>12</ReviewCount>
        </HeaderLeft>
        <ReviewButton>
          <ReviewButtonText>리뷰 작성하기</ReviewButtonText>
        </ReviewButton>
      </HeaderRow>
      <SectionColumn style={{marginTop: 16}}>
        <SectionTitle>추천대상</SectionTitle>
        <TextBoxRow>
          <TextBox
            label={'수동휠체어\n사용 추천'}
            content="3명"
            isHighlighted={true}
          />
          <TextBox
            label={'전동휠체어\n사용 추천'}
            content="3명"
            isHighlighted={false}
          />
          <TextBox
            label={'유아차 휠체어\n사용 추천'}
            content="3명"
            isHighlighted={false}
          />
        </TextBoxRow>
        <Text
          style={{
            fontSize: 13,
            lineHeight: 18,
            color: color.gray90,
            fontFamily: font.pretendardRegular,
          }}>
          • 고령자(1명) / 추천하지 않음(0명)
        </Text>
      </SectionColumn>
      <SectionColumn style={{marginTop: 24}}>
        <SectionTitle>내부공간</SectionTitle>
        <TextBoxThinRow>
          <TextBox
            label={'이용하기 원활해요'}
            content="3명"
            isHighlighted={true}
            thin
          />
          <TextBox
            label={'이용하기 원활해요'}
            content="3명"
            isHighlighted={false}
            thin
          />
          <TextBox
            label={'이용하기 원활해요'}
            content="3명"
            isHighlighted={false}
            thin
          />
        </TextBoxThinRow>
      </SectionColumn>
      <FooterRow style={{marginTop: 24}}>
        <FooterDate>2025.06.12</FooterDate>
      </FooterRow>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
`;

const HeaderLeft = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const ReviewCount = styled.Text`
  font-family: ${font.pretendardSemibold};
  color: ${color.brandColor};
  font-size: 20px;
`;

const ReviewButton = styled.TouchableOpacity`
  background-color: ${color.brand5};
  padding-vertical: 6px;
  padding-horizontal: 14px;
  border-radius: 8px;
`;

const ReviewButtonText = styled.Text`
  color: ${color.brandColor};
  font-size: 13px;
  line-height: 18px;
  font-family: ${font.pretendardMedium};
`;

const SectionColumn = styled.View`
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
`;

const SectionTitle = styled.Text`
  font-family: ${font.pretendardBold};
  font-size: 16px;
  line-height: 24px;
  color: ${color.gray100};
`;

const FooterRow = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  width: 100%;
  gap: 4px;
  margin-top: 24px;
`;

const FooterDate = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 11px;
  line-height: 14px;
  color: ${color.gray50};
`;

const TextBoxRow = styled.View`
  flex-direction: row;
  width: 100%;
  gap: 8px;
`;

const TextBoxThinRow = styled.View`
  flex-direction: column;
  width: 100%;
  gap: 8px;
`;

interface TextBoxProps {
  label: string;
  content: string;
  isHighlighted?: boolean;
  thin?: boolean;
}

const TextBox: React.FC<TextBoxProps> = ({
  label,
  content,
  isHighlighted,
  thin,
}) => (
  <TextBoxContainer isHighlighted={isHighlighted} thin={thin}>
    <TextBoxLabel thin={thin}>{label}</TextBoxLabel>
    <TextBoxContent thin={thin}>{content}</TextBoxContent>
  </TextBoxContainer>
);

const TextBoxContainer = styled.View<{isHighlighted?: boolean; thin?: boolean}>`
  padding: ${({thin}) => (thin ? '5px 12px' : '15px')};
  flex-grow: 1;
  background-color: ${({isHighlighted}) =>
    isHighlighted ? color.brand10 : color.gray10};
  border-radius: 12px;
  flex-direction: ${({thin}) => (thin ? 'row' : 'column')};
  justify-content: ${({thin}) => (thin ? 'space-between' : 'center')};
  gap: 4px;
`;

const TextBoxLabel = styled.Text<{thin?: boolean}>`
  font-size: ${({thin}) => (thin ? 13 : 13)}px;
  line-height: ${({thin}) => (thin ? 18 : 18)}px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray100};
  text-align: center;
`;

const TextBoxContent = styled.Text<{thin?: boolean}>`
  font-size: ${({thin}) => (thin ? 11 : 16)}px;
  line-height: ${({thin}) => (thin ? 14 : 24)}px;
  font-family: ${({thin}) =>
    thin ? font.pretendardBold : font.pretendardMedium};
  color: ${color.blue50};
  text-align: center;
`;

import dayjs from 'dayjs';
import React, {useMemo} from 'react';
import {Text} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  AccessibilityInfoDto,
  PlaceReviewDto,
  SpaciousTypeDto,
} from '@/generated-sources/openapi';

import EmptyInfo from './EmptyInfo';
import * as S from './PlaceInfo.style';

interface Props {
  reviews: PlaceReviewDto[];
}

export default function PlaceReviewSummaryInfo({reviews}: Props) {
  const {top3, restText} = useMemo(
    () => getTopMobilityTypesAndRestText(reviews, MOBILITY_TYPE_LABELS),
    [reviews],
  );
  const spaciousTypeCounts = useMemo(
    () => getSpaciousTypeCounts(reviews),
    [reviews],
  );

  if (reviews.length === 0) {
    return <EmptyInfo type="매장 내부 정보" />;
  }

  return (
    <Container>
      <HeaderRow>
        <HeaderLeft>
          <S.BigTitle>방문 리뷰</S.BigTitle>
          <ReviewCount>{reviews.length}</ReviewCount>
        </HeaderLeft>
        <ReviewButton
          onPress={() => {
            // TODO: 리뷰 작성하기 버튼 클릭 시 리뷰 작성 화면으로 이동
          }}>
          <ReviewButtonText>리뷰 작성하기</ReviewButtonText>
        </ReviewButton>
      </HeaderRow>
      <SectionColumn style={{marginTop: 16}}>
        <SectionTitle>추천대상</SectionTitle>
        <TextBoxRow>
          {top3.map(([type, count], idx) => (
            <TextBox
              key={type}
              label={MOBILITY_TYPE_LABELS[type] || type}
              content={`${count}명`}
              isHighlighted={idx === 0}
            />
          ))}
        </TextBoxRow>
        <Text
          style={{
            fontSize: 13,
            lineHeight: 18,
            color: color.gray90,
            fontFamily: font.pretendardRegular,
          }}>
          {restText}
        </Text>
      </SectionColumn>
      <SectionColumn style={{marginTop: 24}}>
        <SectionTitle>내부공간</SectionTitle>
        <TextBoxThinRow>
          {spaciousTypeCounts.map(([type, count], idx) => (
            <TextBox
              key={type}
              label={SPACIOUS_TYPE_LABELS[type] || type}
              content={`${count}명`}
              isHighlighted={idx === 0}
              thin
            />
          ))}
        </TextBoxThinRow>
      </SectionColumn>
      <FooterRow style={{marginTop: 24}}>
        <FooterDate>
          {dayjs(Math.max(...reviews.map(r => r.createdAt.value))).format(
            'YYYY.MM.DD',
          )}
        </FooterDate>
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

// 이동수단 타입 한글 라벨 매핑
const MOBILITY_TYPE_LABELS: Record<string, string> = {
  MANUAL_WHEELCHAIR: '수동휠체어\n사용 추천',
  ELECTRIC_WHEELCHAIR: '전동휠체어\n사용 추천',
  STROLLER: '유아차 휠체어\n사용 추천',
  ELDERLY: '고령자\n사용 추천',
  NOT_SURE: '잘 모르겠음',
  NONE: '추천하지 않음',
};

// 내부공간 타입 한글 라벨 매핑
const SPACIOUS_TYPE_LABELS: Record<string, string> = {
  WIDE: '매우 원활해요',
  ENOUGH: '원활해요',
  LIMITED: '조금 불편해요',
  TIGHT: '매우 불편해요',
};

function getSpaciousTypeCounts(reviews: PlaceReviewDto[]) {
  const count: Record<string, number> = {};
  reviews.forEach(r => {
    const type = r.spaciousType;
    if (type) {
      if (!count[type]) count[type] = 0;
      count[type]++;
    }
  });
  const order: SpaciousTypeDto[] = ['WIDE', 'ENOUGH', 'LIMITED', 'TIGHT'];
  return order
    .filter(type => count[type])
    .map(type => [type, count[type]] as [string, number]);
}

function getTopMobilityTypesAndRestText(
  reviews: PlaceReviewDto[],
  MOBILITY_TYPE_LABELS: Record<string, string>,
) {
  const count: Record<string, number> = {};
  reviews.forEach(r => {
    r.recommendedMobilityTypes?.forEach(type => {
      if (!count[type]) count[type] = 0;
      count[type]++;
    });
  });
  const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]);
  const top3 = sorted.slice(0, 3);
  const top3Types = top3.map(([type]) => type);
  const rest = sorted
    .filter(([type]) => !top3Types.includes(type))
    .map(([type, cnt]) => `${MOBILITY_TYPE_LABELS[type] || type}(${cnt}명)`);
  return {
    top3,
    restText: rest.length > 0 ? `• ${rest.join(' / ')}` : '',
  };
}

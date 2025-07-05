import dayjs from 'dayjs';
import React, {useMemo} from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  PlaceReviewDto,
  RecommendedMobilityTypeDto,
  SpaciousTypeDto,
} from '@/generated-sources/openapi';
import useNavigation from '@/navigation/useNavigation';

import * as SS from '../sections/PlaceDetailEntranceSection.style';

interface Props {
  reviews: PlaceReviewDto[];
  placeId: string;
}

export default function PlaceReviewSummaryInfo({reviews, placeId}: Props) {
  const navigation = useNavigation();
  const mobilityTypeCounts = useMemo(
    () => countMobilityTypes(reviews),
    [reviews],
  );
  const spaciousTypeCounts = useMemo(
    () => countSpaciousType(reviews),
    [reviews],
  );

  if (reviews.length === 0) {
    return null;
  }

  return (
    <Container>
      <HeaderRow>
        <HeaderLeft>
          <SS.Title>방문 리뷰</SS.Title>
          <ReviewCount>{reviews.length}</ReviewCount>
        </HeaderLeft>
        <ReviewButton
          onPress={() => {
            navigation.navigate('ReviewForm/Place', {
              placeId,
            });
          }}>
          <ReviewButtonText>리뷰 작성하기</ReviewButtonText>
        </ReviewButton>
      </HeaderRow>
      <SectionColumn style={{marginTop: 16}}>
        <SectionTitle>추천대상</SectionTitle>
        <TextBoxRow>
          {mobilityTypeCounts.slice(0, 3).map(item => (
            <TextBox
              key={item.label}
              label={item.label}
              content={`${item.count}명`}
              level={item.level}
              shape="normal"
            />
          ))}
        </TextBoxRow>
        <TextBoxRow>
          {mobilityTypeCounts.slice(3, 5).map(item => (
            <TextBox
              key={item.label}
              label={item.label}
              content={`${item.count}명`}
              level={item.level}
              shape="flat"
            />
          ))}
        </TextBoxRow>
      </SectionColumn>
      <SectionColumn style={{marginTop: 24}}>
        <SectionTitle>내부공간</SectionTitle>
        <TextBoxThinRow>
          {spaciousTypeCounts.map(item => (
            <TextBox
              key={item.label}
              label={item.label}
              content={`${item.count}명`}
              level={item.level}
              shape="thin"
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

const Container = styled.View``;

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
  font-family: ${font.pretendardBold};
  color: ${color.brandColor};
  font-size: 18px;
  line-height: 26px;
`;

const ReviewButton = styled.TouchableOpacity`
  background-color: ${color.brand50};
  padding-horizontal: 14px;
  height: 31px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
`;

const ReviewButtonText = styled.Text`
  color: ${color.white};
  font-size: 13px;
  line-height: 18px;
  font-family: ${font.pretendardBold};
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
  color: ${color.black};
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

const TextBox: React.FC<{
  label: string;
  content: string;
  level?: 'high' | 'medium' | 'low';
  shape?: 'thin' | 'flat' | 'normal';
}> = ({label, content, level, shape}) => (
  <TextBoxContainer level={level} shape={shape}>
    <TextBoxLabel>{label}</TextBoxLabel>
    <TextBoxContent level={level} shape={shape}>
      {content}
    </TextBoxContent>
  </TextBoxContainer>
);

const TextBoxContainer = styled.View<{
  level?: 'high' | 'medium' | 'low';
  shape?: 'thin' | 'flat' | 'normal';
}>`
  padding: ${({shape}) =>
    shape === 'thin' ? '5px 12px' : shape === 'flat' ? '12px' : '12px'};
  flex-grow: 1;
  background-color: ${({level}) =>
    level === 'high'
      ? color.brand10
      : level === 'medium'
      ? color.brand5
      : color.gray10};
  border-radius: 12px;
  flex-direction: ${({shape}) =>
    shape === 'thin' ? 'row' : shape === 'flat' ? 'row' : 'column'};
  align-items: center;
  justify-content: ${({shape}) =>
    shape === 'thin' ? 'space-between' : 'center'};
  gap: 4px;
`;

const TextBoxLabel = styled.Text`
  font-size: 13px;
  line-height: 18px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray100};
  text-align: center;
`;

const TextBoxContent = styled.Text<{
  shape?: 'thin' | 'flat' | 'normal';
  level?: 'high' | 'medium' | 'low';
}>`
  font-size: ${({shape}) => (shape === 'thin' ? 11 : 13)}px;
  line-height: ${({shape}) => (shape === 'thin' ? 14 : 18)}px;
  font-family: ${({shape}) =>
    shape === 'thin' ? font.pretendardBold : font.pretendardMedium};
  color: ${({level}) =>
    level === 'high'
      ? color.brand50
      : level === 'medium'
      ? color.brand50
      : color.gray40};
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
  WIDE: '🥰 매우 넓고, 이용하기 적합해요 ',
  ENOUGH: '😀 대부분의 구역을 이용하기에 적합해요',
  LIMITED: '🙂 일부 구역만 이용하기에 적합해요 ',
  TIGHT: '🥲 매우 좁아서 내부 이동이 불가능해요 ',
};

function assignLevels<T extends {count: number}>(
  sorted: T[],
): (T & {level: 'high' | 'medium' | 'low'})[] {
  if (sorted.length === 0) return [];
  const uniqueCounts = Array.from(new Set(sorted.map(item => item.count))).sort(
    (a, b) => b - a,
  );
  if (uniqueCounts.length >= 3) {
    const [high, medium] = uniqueCounts;
    return sorted.map(item => {
      if (item.count === high) return {...item, level: 'high' as const};
      if (item.count === medium) return {...item, level: 'medium' as const};
      return {...item, level: 'low' as const};
    });
  }
  if (uniqueCounts.length === 2) {
    const [medium] = uniqueCounts;
    return sorted.map(item =>
      item.count === medium
        ? {...item, level: 'medium' as const}
        : {...item, level: 'low' as const},
    );
  }
  return sorted.map(item => ({...item, level: 'low' as const}));
}

function countSpaciousType(
  reviews: PlaceReviewDto[],
): {label: string; count: number; level: 'high' | 'medium' | 'low'}[] {
  const count: Record<string, number> = {};
  Object.values(SpaciousTypeDto).forEach(type => {
    count[type] = 0;
  });
  reviews.forEach(r => {
    const type = r.spaciousType;
    if (type && count.hasOwnProperty(type)) {
      count[type]++;
    }
  });
  const sorted = Object.entries(count)
    .sort((a, b) => b[1] - a[1])
    .map(([type, cnt]) => ({
      label: SPACIOUS_TYPE_LABELS[type] || type,
      count: cnt,
    }));
  return assignLevels(sorted);
}

function countMobilityTypes(reviews: PlaceReviewDto[]): {
  label: string;
  count: number;
  level: 'high' | 'medium' | 'low';
}[] {
  const count: Record<string, number> = {};
  Object.values(RecommendedMobilityTypeDto).forEach(type => {
    count[type] = 0;
  });
  reviews.forEach(r => {
    r.recommendedMobilityTypes?.forEach(type => {
      if (count.hasOwnProperty(type)) {
        count[type]++;
      }
    });
  });
  const sorted = Object.entries(count)
    .sort((a, b) => b[1] - a[1])
    .map(([type, cnt]) => ({
      label: MOBILITY_TYPE_LABELS[type] || type,
      count: cnt,
    }));
  return assignLevels(sorted);
}

import dayjs from 'dayjs';
import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {PlaceReviewDto} from '@/generated-sources/openapi';
import {SEAT_TYPE_OPTIONS} from '@/screens/PlaceReviewFormScreen/constants';

import {EmptyStateCard} from './AccessibilityInfoComponents';

interface Props {
  reviews: PlaceReviewDto[];
  title?: string;
  showDate?: boolean;
  onRegister?: () => void;
}

export default function PlaceReviewSection({
  reviews,
  title = '내부 이용 정보',
  showDate = true,
  onRegister,
}: Props) {
  if (reviews.length === 0) {
    return (
      <SectionContainer>
        <SectionHeader>
          <SectionTitle>{title}</SectionTitle>
        </SectionHeader>
        <EmptyStateCard
          title={'아직 등록된 방문 리뷰가 없어요🥲'}
          description={
            '장소 내부 리뷰는 공간 이용 여부를\n결정할 수 있는 중요한 정보에요!'
          }
          buttonText="내부 리뷰 작성하기"
          onPress={onRegister}
        />
      </SectionContainer>
    );
  }

  const updatedAt = dayjs(
    Math.max(...reviews.map(r => r.createdAt.value)),
  ).format('YYYY.MM.DD');

  const allSeatTypes = [...new Set(reviews.flatMap(r => r.seatTypes))];
  const seatTypes: string[] = [];
  const seatComments: string[] = [];
  allSeatTypes.forEach(item => {
    if (SEAT_TYPE_OPTIONS.includes(item)) {
      seatTypes.push(item);
    } else {
      seatComments.push(item);
    }
  });

  const orderMethods = [...new Set(reviews.flatMap(r => r.orderMethods))];
  const features = [...new Set(reviews.flatMap(r => r.features ?? []))];

  const hasData =
    seatTypes.length > 0 || orderMethods.length > 0 || features.length > 0;
  if (!hasData) {
    return (
      <SectionContainer>
        <SectionHeader>
          <SectionTitle>{title}</SectionTitle>
        </SectionHeader>
        <EmptyStateCard
          title={'아직 등록된 방문 리뷰가 없어요🥲'}
          description={
            '장소 내부 리뷰는 공간 이용 여부를\n결정할 수 있는 중요한 정보에요!'
          }
          buttonText="내부 리뷰 작성하기"
          onPress={onRegister}
        />
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      <SectionHeader>
        <SectionTitle>{title}</SectionTitle>
        {showDate && <SectionDate>{updatedAt}</SectionDate>}
      </SectionHeader>

      <IndoorContent>
        {/* 좌석 구성 */}
        {seatTypes.length > 0 && (
          <IndoorRow>
            <IndoorLabel>좌석 구성</IndoorLabel>
            <IndoorValueContainer>
              <TagWrap>
                {seatTypes.map(t => (
                  <Tag key={t}>
                    <TagText>{t}</TagText>
                  </Tag>
                ))}
              </TagWrap>
              {seatComments.length > 0 && (
                <IndoorDescription>{seatComments.join(', ')}</IndoorDescription>
              )}
            </IndoorValueContainer>
          </IndoorRow>
        )}

        {/* 주문방법 */}
        {orderMethods.length > 0 && (
          <IndoorRow>
            <IndoorLabel>주문방법</IndoorLabel>
            <IndoorValueContainer>
              <TagWrap>
                {orderMethods.map(m => (
                  <Tag key={m}>
                    <TagText>{m}</TagText>
                  </Tag>
                ))}
              </TagWrap>
            </IndoorValueContainer>
          </IndoorRow>
        )}

        {/* 특이사항 */}
        {features.length > 0 && (
          <IndoorRow>
            <IndoorLabel>특이사항</IndoorLabel>
            <IndoorValueContainer>
              <IndoorFeatureText>{features.join(', ')}</IndoorFeatureText>
            </IndoorValueContainer>
          </IndoorRow>
        )}
      </IndoorContent>
    </SectionContainer>
  );
}

// ──────────────── Styled Components ────────────────

const SectionContainer = styled.View`
  gap: 16px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const SectionTitle = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.gray90};
`;

const SectionDate = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.24px;
  color: ${color.gray50};
`;

const IndoorContent = styled.View`
  gap: 16px;
`;

const IndoorRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
`;

const IndoorLabel = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.24px;
  color: ${color.gray40};
  width: 48px;
  padding-top: 4px;
`;

const IndoorValueContainer = styled.View`
  flex: 1;
  gap: 8px;
`;

const TagWrap = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 4px;
`;

const Tag = styled.View`
  background-color: ${color.gray5};
  border-radius: 6px;
  padding-horizontal: 6px;
  padding-vertical: 4px;
`;

const TagText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.24px;
  color: ${color.brand50};
`;

const IndoorDescription = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 13px;
  line-height: 20px;
  color: ${color.gray90};
`;

const IndoorFeatureText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  line-height: 22px;
  letter-spacing: -0.28px;
  color: ${color.gray90};
`;

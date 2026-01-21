import React from 'react';
import { View, Text, Image } from 'react-native';
import styled from 'styled-components/native';

import { color } from '@/constant/color';
import { SccPressable } from '@/components/SccPressable';
import type { BbucleRoadData } from '../../BbucleRoadScreen/config/bbucleRoadData';

export interface UpcomingCardData {
  id: string;
  title: string;
  subtitle: string;
  badgeText?: string;
}

interface BbucleRoadCardProps {
  data?: BbucleRoadData;
  upcomingData?: UpcomingCardData;
  onPress: () => void;
  isDesktop: boolean;
}

export default function BbucleRoadCard({
  data,
  upcomingData,
  onPress,
  isDesktop,
}: BbucleRoadCardProps) {
  // 공개 예정 카드
  if (upcomingData) {
    return (
      <SccPressable
        elementName="bbucle-road-upcoming-card"
        logParams={{ type: 'upcoming', upcomingId: upcomingData.id }}
        onPress={onPress}>
        <UpcomingCardContainer isDesktop={isDesktop}>
          <UpcomingThumbnailWrapper isDesktop={isDesktop}>
            <UpcomingOverlay />
            <UpcomingBadge isDesktop={isDesktop}>
              <UpcomingBadgeText isDesktop={isDesktop}>
                {upcomingData.badgeText || (isDesktop ? '알림신청 🔔' : '🔔')}
              </UpcomingBadgeText>
            </UpcomingBadge>
          </UpcomingThumbnailWrapper>

          <ContentWrapper isDesktop={isDesktop}>
            <UpcomingTitle isDesktop={isDesktop}>
              {upcomingData.title}
            </UpcomingTitle>
            <UpcomingSubtitle isDesktop={isDesktop}>
              {upcomingData.subtitle}
            </UpcomingSubtitle>
          </ContentWrapper>
        </UpcomingCardContainer>
      </SccPressable>
    );
  }

  // 일반 카드
  if (!data) return null;

  // 썸네일 이미지 우선순위: ogImageUrl > headerBackgroundImageUrl > titleImageUrl
  const thumbnailUrl =
    data.ogImageUrl || data.headerBackgroundImageUrl || data.titleImageUrl;

  return (
    <SccPressable
      elementName="bbucle-road-card"
      logParams={{
        bbucleRoadId: data.id,
        title: data.title,
      }}
      onPress={onPress}>
      <CardContainer isDesktop={isDesktop}>
        <ThumbnailWrapper isDesktop={isDesktop}>
          {thumbnailUrl ? (
            <ThumbnailImage source={{ uri: thumbnailUrl }} resizeMode="cover" />
          ) : (
            <ThumbnailPlaceholder />
          )}
        </ThumbnailWrapper>

        <ContentWrapper isDesktop={isDesktop}>
          <CardTitle isDesktop={isDesktop} numberOfLines={2}>
            {data.title}
          </CardTitle>
          {data.lastUpdatedDate && (
            <CardDate isDesktop={isDesktop}>{data.lastUpdatedDate}</CardDate>
          )}
        </ContentWrapper>
      </CardContainer>
    </SccPressable>
  );
}

const CardContainer = styled(View)<{ isDesktop: boolean }>`
  flex-direction: row;
  background-color: ${color.white};
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${color.gray20};
`;

const UpcomingCardContainer = styled(View)<{ isDesktop: boolean }>`
  flex-direction: row;
  background-color: ${color.gray10};
  border-radius: 12px;
  overflow: hidden;
  border: 1px dashed ${color.gray30};
`;

const ThumbnailWrapper = styled(View)<{ isDesktop: boolean }>`
  width: ${({ isDesktop }) => (isDesktop ? '280px' : '120px')};
  height: ${({ isDesktop }) => (isDesktop ? '180px' : '77px')};
  background-color: ${color.gray10};
`;

const UpcomingThumbnailWrapper = styled(View)<{ isDesktop: boolean }>`
  width: ${({ isDesktop }) => (isDesktop ? '280px' : '120px')};
  height: ${({ isDesktop }) => (isDesktop ? '180px' : '77px')};
  background-color: ${color.gray20};
  justify-content: center;
  align-items: center;
  position: relative;
`;

const UpcomingOverlay = styled(View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${color.gray25};
`;

const UpcomingBadge = styled(View)<{ isDesktop?: boolean }>`
  background-color: ${({ isDesktop }) => (isDesktop ? color.brand30 : 'transparent')};
  padding: ${({ isDesktop }) => (isDesktop ? '6px 14px' : '0')};
  border-radius: ${({ isDesktop }) => (isDesktop ? '32px' : '0')};
  z-index: 1;
`;

const UpcomingBadgeText = styled(Text)<{ isDesktop?: boolean }>`
  font-size: ${({ isDesktop }) => (isDesktop ? '16px' : '24px')};
  font-weight: 600;
  color: ${color.white};
  line-height: ${({ isDesktop }) => (isDesktop ? '24px' : '28px')};
`;

const ThumbnailImage = styled(Image)`
  width: 100%;
  height: 100%;
`;

const ThumbnailPlaceholder = styled(View)`
  width: 100%;
  height: 100%;
  background-color: ${color.gray15};
`;

const ContentWrapper = styled(View)<{ isDesktop: boolean }>`
  flex: 1;
  padding: ${({ isDesktop }) => (isDesktop ? '24px' : '12px')};
  justify-content: center;
`;

const CardTitle = styled(Text)<{ isDesktop: boolean }>`
  font-size: ${({ isDesktop }) => (isDesktop ? '20px' : '14px')};
  font-weight: 700;
  color: ${color.gray80};
  line-height: ${({ isDesktop }) => (isDesktop ? '28px' : '20px')};
  margin-bottom: ${({ isDesktop }) => (isDesktop ? '8px' : '4px')};
`;

const UpcomingTitle = styled(Text)<{ isDesktop: boolean }>`
  font-size: ${({ isDesktop }) => (isDesktop ? '20px' : '14px')};
  font-weight: 700;
  color: ${color.gray60};
  line-height: ${({ isDesktop }) => (isDesktop ? '28px' : '20px')};
  margin-bottom: ${({ isDesktop }) => (isDesktop ? '8px' : '4px')};
`;

const UpcomingSubtitle = styled(Text)<{ isDesktop: boolean }>`
  font-size: ${({ isDesktop }) => (isDesktop ? '14px' : '12px')};
  color: ${color.gray50};
`;

const CardDate = styled(Text)<{ isDesktop: boolean }>`
  font-size: ${({ isDesktop }) => (isDesktop ? '14px' : '11px')};
  color: ${color.gray50};
`;

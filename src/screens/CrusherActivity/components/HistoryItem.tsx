import ChevronRightIcon from '@/assets/icon/ic_chevron_right.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import type {
  CrusherActivityHistorySummaryTypeDto,
  EpochMillisTimestamp,
} from '@/generated-sources/openapi';
import type {ScreenParams} from '@/navigation/Navigation.screens';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback} from 'react';
import {Text, View} from 'react-native';
import styled from 'styled-components/native';
import {formatDateRange} from '../utils/date';

interface HistoryItemProps {
  title: string;
  crusherClubId?: string;
  startAt: EpochMillisTimestamp;
  endAt: EpochMillisTimestamp;
  historyType: CrusherActivityHistorySummaryTypeDto;
  isCurrentCrew?: boolean;
  isFirst?: boolean;
}

export default function HistoryItem({
  title,
  crusherClubId,
  startAt,
  endAt,
  historyType,
  isCurrentCrew,
  isFirst,
}: HistoryItemProps) {
  const navigation = useNavigation<NativeStackNavigationProp<ScreenParams>>();
  const dateText = formatDateRange(startAt.value, endAt.value);
  const isCrewType = historyType === 'CREW';

  const handlePress = useCallback(() => {
    if (!crusherClubId) {
      return;
    }
    navigation.navigate('PastSeasonDetail', {
      crusherClubId,
      title,
    });
  }, [navigation, crusherClubId, title]);

  const content = (
    <Container showBorderTop={!!isFirst && !isCurrentCrew}>
      <ContentWrapper>
        <TextWrapper>
          <Title>
            {historyType === 'CONQUER_ACTIVITY_GUEST'
              ? '정복활동 게스트 참여'
              : title}
          </Title>
          <DateText>{dateText}</DateText>
        </TextWrapper>
      </ContentWrapper>
      {isCrewType && <ChevronRightIcon color={color.gray80} />}
    </Container>
  );

  if (isCrewType && crusherClubId) {
    return (
      <SccPressable onPress={handlePress} elementName="history-crew-item">
        {content}
      </SccPressable>
    );
  }

  return <View>{content}</View>;
}

const Container = styled(View)<{showBorderTop: boolean}>`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${color.gray20};
  ${({showBorderTop}) =>
    showBorderTop &&
    `
    border-top-width: 1px;
    border-top-color: ${color.gray20};
  `}
`;

const ContentWrapper = styled(View)`
  flex: 1;
  gap: 6px;
`;

const TextWrapper = styled(View)`
  gap: 6px;
`;

const Title = styled(Text)`
  font-size: 18px;
  font-family: ${font.pretendardMedium};
  line-height: 26px;
  color: ${color.gray90};
`;

const DateText = styled(Text)`
  font-size: 14px;
  font-family: ${font.pretendardRegular};
  line-height: 20px;
  color: ${color.gray50};
`;

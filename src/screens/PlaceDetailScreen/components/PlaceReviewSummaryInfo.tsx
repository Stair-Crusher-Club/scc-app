import React, {useMemo} from 'react';
import {Platform, View} from 'react-native';
import Toast from 'react-native-root-toast';
import styled from 'styled-components/native';

import PlusIcon from '@/assets/icon/ic_plus.svg';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  PlaceReviewDto,
  RecommendedMobilityTypeDto,
  SpaciousTypeDto,
  Location,
} from '@/generated-sources/openapi';
import useNavigateWithLocationCheck from '@/hooks/useNavigateWithLocationCheck';
import useNavigation from '@/navigation/useNavigation';
import {useCheckAuth} from '@/utils/checkAuth';

import * as SS from '../sections/PlaceDetailEntranceSection.style';

interface Props {
  reviews: PlaceReviewDto[];
  placeId: string;
  placeName: string;
  placeLocation?: Location;
  placeAddress: string;
  hideWriteButton?: boolean;
}

export default function PlaceReviewSummaryInfo({
  reviews,
  placeId,
  placeName,
  placeLocation,
  placeAddress,
  hideWriteButton,
}: Props) {
  const navigation = useNavigation();
  const checkAuth = useCheckAuth();
  const {navigateWithLocationCheck, LocationConfirmModal} =
    useNavigateWithLocationCheck();

  const handleReviewPress = () => {
    if (Platform.OS === 'web') {
      Toast.show('준비 중입니다 💪', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
      return;
    }
    checkAuth(async () => {
      await navigateWithLocationCheck({
        targetLocation: placeLocation,
        placeName: placeName,
        address: placeAddress,
        type: 'place',
        onNavigate: () => {
          navigation.navigate('ReviewForm/Place', {
            placeId,
          });
        },
      });
    });
  };

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

  const spaciousTypeMax =
    Math.max(...spaciousTypeCounts.map(s => s.count)) || 1;

  return (
    <Container>
      <HeaderRow>
        <HeaderLeft>
          <SS.Title>방문 리뷰</SS.Title>
          <ReviewCount>{reviews.length}</ReviewCount>
        </HeaderLeft>
        {!hideWriteButton && (
          <ReviewButton
            elementName="place_detail_review_write_button"
            onPress={handleReviewPress}>
            <PlusIcon color={color.white} />
            <ReviewButtonText>리뷰 쓰기</ReviewButtonText>
          </ReviewButton>
        )}
      </HeaderRow>
      <SectionColumn style={{marginTop: 16}}>
        <TextBoxThinRow>
          {spaciousTypeCounts.map(item => (
            <SpaciousTextBox
              key={item.label}
              label={item.label}
              content={`${item.count}명`}
              level={item.level}
              filledRatio={item.count / spaciousTypeMax}
            />
          ))}
        </TextBoxThinRow>
      </SectionColumn>
      <MobilitySectionColumn>
        <SectionTitle>추천대상</SectionTitle>
        <MobilityCardGrid>
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
                label={item.label.replace('\n', ' ')}
                content={`${item.count}명`}
                level={item.level}
                shape="flat"
              />
            ))}
          </TextBoxRow>
        </MobilityCardGrid>
      </MobilitySectionColumn>
      {LocationConfirmModal}
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
  font-family: ${font.pretendardMedium};
  color: ${color.gray40};
  font-size: 16px;
  line-height: 24px;
`;

const ReviewButton = styled(SccTouchableOpacity)`
  background-color: ${color.brand30};
  padding-horizontal: 14px;
  height: 31px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 4px;
`;

const ReviewButtonText = styled.Text`
  color: ${color.white};
  font-size: 13px;
  line-height: 18px;
  font-family: ${font.pretendardBold};
`;

const SectionColumn = styled.View`
  flex-direction: column;
  gap: 4px;
  margin-top: 16px;
`;

const SectionTitle = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 16px;
  line-height: 26px;
  color: ${color.gray90};
`;

const MobilitySectionColumn = styled.View`
  flex-direction: column;
  gap: 12px;
  margin-top: 32px;
`;

const MobilityCardGrid = styled.View`
  flex-direction: column;
  gap: 4px;
`;

const TextBoxRow = styled.View`
  flex-direction: row;
  width: 100%;
  gap: 4px;
`;

const TextBoxThinRow = styled.View`
  flex-direction: column;
  width: 100%;
  gap: 4px;
`;

const TextBox: React.FC<{
  label: string;
  content: string;
  level?: 'high' | 'medium' | 'low';
  shape?: 'flat' | 'normal';
}> = ({label, content, level, shape}) => (
  <TextBoxContainer level={level} shape={shape}>
    <View style={{flexGrow: 1, justifyContent: 'center'}}>
      <RecommendTargetTextBoxLabel>{label}</RecommendTargetTextBoxLabel>
    </View>
    <TextBoxContent level={level} shape={shape}>
      {content}
    </TextBoxContent>
  </TextBoxContainer>
);

const SpaciousTextBox: React.FC<{
  label: string;
  content: string;
  level?: 'high' | 'medium' | 'low';
  filledRatio?: number; // 0 ~ 1
}> = ({label, content, level, filledRatio = 1}) => {
  const background =
    level === 'high'
      ? color.brand10
      : level === 'medium'
        ? color.brand5
        : color.gray10;

  const isHighlighted = level === 'high' || level === 'medium';

  return (
    <View
      style={{
        backgroundColor: color.gray10,
        borderRadius: 10,
        overflow: 'hidden',
        height: 40,
      }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${Math.min(Math.max(filledRatio, 0), 1) * 100}%`,
          backgroundColor: background,
          borderRadius: 7,
        }}
      />
      <View
        style={{
          paddingVertical: 10,
          paddingHorizontal: 12,
          flexGrow: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 4,
        }}>
        <SpaciousTextBoxLabel isHighlighted={isHighlighted}>
          {label}
        </SpaciousTextBoxLabel>
        <TextBoxContent level={level} shape={'thin'}>
          {content}
        </TextBoxContent>
      </View>
    </View>
  );
};

const TextBoxContainer = styled.View<{
  level?: 'high' | 'medium' | 'low';
  shape?: 'thin' | 'flat' | 'normal';
}>`
  flex: 1;
  padding: ${({shape}) =>
    shape === 'thin' ? '8px 12px' : shape === 'flat' ? '12px' : '12px'};
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

const RecommendTargetTextBoxLabel = styled.Text`
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray100};
  text-align: center;
`;

const SpaciousTextBoxLabel = styled.Text<{isHighlighted?: boolean}>`
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  font-family: ${({isHighlighted}) =>
    isHighlighted ? font.pretendardMedium : font.pretendardRegular};
  color: ${color.gray100};
  background-color: transparent;
`;

const TextBoxContent = styled.Text<{
  shape?: 'thin' | 'flat' | 'normal';
  level?: 'high' | 'medium' | 'low';
}>`
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.26px;
  font-family: ${({shape, level}) => {
    const isHighlighted = level === 'high' || level === 'medium';
    if (shape === 'thin') {
      return isHighlighted ? font.pretendardBold : font.pretendardMedium;
    }
    return isHighlighted ? font.pretendardMedium : font.pretendardRegular;
  }};
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
  MANUAL_WHEELCHAIR: '수동휠체어\n사용자',
  ELECTRIC_WHEELCHAIR: '전동휠체어\n사용자',
  STROLLER: '유아차\n동반인',
  ELDERLY: '고령자',
  NOT_SURE: '잘 모르겠음',
  NONE: '안함',
};

// 내부공간 타입 한글 라벨 매핑
const SPACIOUS_TYPE_LABELS: Record<string, string> = {
  WIDE: '🥰 매우 넓어 이용하기 아주 편리해요',
  ENOUGH: '😀 대부분 구역에서 문제없이 이용할 수 있어요',
  LIMITED: '🙂 일부 구역만 이용할 수 있어요',
  TIGHT: '🥲 매우 좁아 내부 이동이 거의 불가능해요',
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
  const SPACIOUS_ORDER = [
    SpaciousTypeDto.Wide,
    SpaciousTypeDto.Enough,
    SpaciousTypeDto.Limited,
    SpaciousTypeDto.Tight,
  ];
  const sorted = SPACIOUS_ORDER.map(type => ({
    label: SPACIOUS_TYPE_LABELS[type] || type,
    count: count[type] || 0,
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
  const MOBILITY_ORDER = [
    RecommendedMobilityTypeDto.ManualWheelchair,
    RecommendedMobilityTypeDto.ElectricWheelchair,
    RecommendedMobilityTypeDto.Stroller,
    RecommendedMobilityTypeDto.Elderly,
    RecommendedMobilityTypeDto.NotSure,
  ];
  const sorted = MOBILITY_ORDER.map(type => ({
    label: MOBILITY_TYPE_LABELS[type] || type,
    count: count[type] || 0,
  }));
  return assignLevels(sorted);
}

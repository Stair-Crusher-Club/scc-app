import React from 'react';
import {ScrollView} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {RecommendedMobilityTypeDto} from '@/generated-sources/openapi';
import BottomSheet from '@/modals/BottomSheet/BottomSheet';
import {MOBILITY_TYPE_LABELS} from '@/screens/PlaceDetailScreen/constants/labels';

interface Props {
  isVisible: boolean;
  selected: RecommendedMobilityTypeDto | null;
  onSelect: (type: RecommendedMobilityTypeDto | null) => void;
  onClose: () => void;
}

const MOBILITY_TYPE_OPTIONS: (RecommendedMobilityTypeDto | null)[] = [
  null, // 전체
  'MANUAL_WHEELCHAIR',
  'ELECTRIC_WHEELCHAIR',
  'STROLLER',
  'ELDERLY',
  'NONE',
];

export default function PlaceVisitReviewFilterModal({
  isVisible,
  selected,
  onSelect,
  onClose,
}: Props) {
  return (
    <BottomSheet isVisible={isVisible} onPressBackground={onClose}>
      <ScrollView
        contentContainerStyle={{
          gap: 16,
          paddingVertical: 24,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}>
        <Title>추천대상 선택</Title>
        <OptionList>
          {MOBILITY_TYPE_OPTIONS.map(type => (
            <OptionButton
              key={type ?? 'ALL'}
              isActive={selected === type}
              onPress={() => {
                onSelect(type);
                onClose();
              }}>
              <OptionText isActive={selected === type}>
                {type === null ? '전체' : MOBILITY_TYPE_LABELS[type]}
              </OptionText>
            </OptionButton>
          ))}
        </OptionList>
      </ScrollView>
    </BottomSheet>
  );
}

const Title = styled.Text`
  font-size: 18px;
  font-family: ${() => font.pretendardBold};
  color: ${color.gray100};
  margin-bottom: 12px;
`;

const OptionList = styled.View`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const OptionButton = styled.TouchableOpacity<{isActive: boolean}>`
  padding-vertical: 12px;
  padding-horizontal: 16px;
  border-radius: 8px;
  background-color: ${({isActive}) => (isActive ? color.brand5 : color.white)};
  border-width: 1px;
  border-color: ${({isActive}) => (isActive ? color.brand : color.gray20)};
`;

const OptionText = styled.Text<{isActive: boolean}>`
  font-size: 16px;
  font-family: ${() => font.pretendardMedium};
  color: ${({isActive}) => (isActive ? color.brand50 : color.gray100)};
`;

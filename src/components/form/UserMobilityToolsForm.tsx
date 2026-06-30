import React from 'react';
import {Dimensions} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  MOBILITY_TOOL_GROUPS,
  MOBILITY_TOOL_LABELS,
} from '@/constant/mobilityTool';
import {UserMobilityToolDto} from '@/generated-sources/openapi';
import SelectableItem from '@/screens/SignupScreen/components/SelectableItem';
import ToastUtils from '@/utils/ToastUtils';

const MAX_SELECTION = 3;

// Figma: 2열 그리드. 좌우 패딩 20, 아이템 간격 8px → 절반 너비 = (width - 40 - 8) / 2
const H_PADDING = 20;
const ITEM_GAP = 8;
const HALF_WIDTH = Math.floor(
  (Dimensions.get('window').width - H_PADDING * 2 - ITEM_GAP) / 2,
);

interface UserMobilityToolsFormProps {
  value: UserMobilityToolDto[];
  onChangeValue: (value: UserMobilityToolDto[]) => Promise<void>;
  onSubmit?: () => void;
}

export default function UserMobilityToolsForm({
  value,
  onChangeValue,
}: UserMobilityToolsFormProps) {
  const isNoneSelected =
    value.length === 1 && value[0] === UserMobilityToolDto.None;
  // 3개(MAX)를 채우면 NONE 선택 때처럼 나머지(미선택) 항목을 dim + 비활성화.
  const isMaxSelected = !isNoneSelected && value.length >= MAX_SELECTION;

  const handlePress = (pressed: UserMobilityToolDto) => {
    if (pressed === UserMobilityToolDto.None) {
      if (isNoneSelected) {
        onChangeValue([]);
      } else {
        onChangeValue([UserMobilityToolDto.None]);
      }
      return;
    }

    // NONE 선택 상태에서 다른 옵션 탭 → NONE 해제하고 그 옵션으로 전환(원탭)
    if (isNoneSelected) {
      onChangeValue([pressed]);
      return;
    }

    if (value.includes(pressed)) {
      onChangeValue(value.filter(tool => tool !== pressed));
    } else {
      if (value.length >= MAX_SELECTION) {
        ToastUtils.show(`최대 ${MAX_SELECTION}개까지 선택할 수 있어요.`);
        return;
      }
      onChangeValue([...value, pressed]);
    }
  };

  const getLabel = (tool: UserMobilityToolDto): string => {
    return MOBILITY_TOOL_LABELS[tool] ?? tool;
  };

  return (
    <Container>
      {MOBILITY_TOOL_GROUPS.map(group => (
        <GroupContainer key={group.groupLabel}>
          <GroupLabel>{group.groupLabel}</GroupLabel>
          <GridRow>
            {group.options.map(option => {
              const isNone = option.value === UserMobilityToolDto.None;
              const isSelected = isNone
                ? isNoneSelected
                : value.includes(option.value);
              // MAX 도달 시 미선택 항목(NONE 포함)은 비활성화. 선택된 항목은
              // 해제할 수 있어야 하므로 활성 유지.
              const isDisabledByMax = isMaxSelected && !isSelected;
              const isDimmed = (isNoneSelected && !isNone) || isDisabledByMax;
              return (
                <GridItem
                  key={option.value}
                  style={{width: option.fullWidth ? '100%' : HALF_WIDTH}}>
                  <SelectableItem
                    isSelected={isSelected}
                    isDimmed={isDimmed}
                    disabled={isDisabledByMax}
                    onPress={() => handlePress(option.value)}
                    text={getLabel(option.value)}
                    elementName="user_mobility_tool_option"
                  />
                </GridItem>
              );
            })}
          </GridRow>
        </GroupContainer>
      ))}
    </Container>
  );
}

const Container = styled.View`
  padding-horizontal: 20px;
  padding-bottom: 20px;
  gap: 36px;
`;

const GroupContainer = styled.View`
  gap: 8px;
`;

const GroupLabel = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 20px;
  line-height: 28px;
  letter-spacing: -0.4px;
  color: ${color.gray80v2};
`;

const GridRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

const GridItem = styled.View``;

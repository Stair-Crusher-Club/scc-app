import React from 'react';
import styled from 'styled-components/native';

import {
  MOBILITY_TOOL_GROUPS,
  MOBILITY_TOOL_LABELS,
} from '@/constant/mobilityTool';
import {UserMobilityToolDto} from '@/generated-sources/openapi';
import SelectableItem from '@/screens/SignupScreen/components/SelectableItem';

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

  const handlePress = (pressed: UserMobilityToolDto) => {
    if (pressed === UserMobilityToolDto.None) {
      if (isNoneSelected) {
        onChangeValue([]);
      } else {
        onChangeValue([UserMobilityToolDto.None]);
      }
      return;
    }

    if (isNoneSelected) {
      onChangeValue([pressed]);
      return;
    }

    if (value.includes(pressed)) {
      onChangeValue(value.filter(tool => tool !== pressed));
    } else {
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
              const isDimmed = isNoneSelected && !isNone;
              return (
                <GridItem key={option.value}>
                  <SelectableItem
                    isSelected={isSelected}
                    isDimmed={isDimmed}
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
  gap: 24px;
`;

const GroupContainer = styled.View`
  gap: 12px;
`;

const GroupLabel = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: #666;
`;

const GridRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

const GridItem = styled.View`
  width: 48%;
`;

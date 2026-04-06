import React, {useCallback} from 'react';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {doorTypeMap} from '@/constant/options';
import {EntranceDoorType} from '@/generated-sources/openapi';

interface DoorTypeCorrectionSectionProps {
  entranceDoorTypes?: EntranceDoorType[];
  onChangeDoorTypes: (value: EntranceDoorType[]) => void;
}

const DOOR_TYPE_OPTIONS: {value: EntranceDoorType; label: string}[] = [
  {value: EntranceDoorType.None, label: doorTypeMap[EntranceDoorType.None]},
  {value: EntranceDoorType.Hinged, label: doorTypeMap[EntranceDoorType.Hinged]},
  {
    value: EntranceDoorType.Sliding,
    label: doorTypeMap[EntranceDoorType.Sliding],
  },
  {
    value: EntranceDoorType.Revolving,
    label: doorTypeMap[EntranceDoorType.Revolving],
  },
  {
    value: EntranceDoorType.Automatic,
    label: doorTypeMap[EntranceDoorType.Automatic],
  },
  {value: EntranceDoorType.Etc, label: doorTypeMap[EntranceDoorType.Etc]},
];

export default function DoorTypeCorrectionSection({
  entranceDoorTypes = [],
  onChangeDoorTypes,
}: DoorTypeCorrectionSectionProps) {
  const toggleDoorType = useCallback(
    (doorType: EntranceDoorType) => {
      if (doorType === EntranceDoorType.None) {
        // "없음"은 단독 선택
        onChangeDoorTypes([EntranceDoorType.None]);
        return;
      }
      const withoutNone = entranceDoorTypes.filter(
        t => t !== EntranceDoorType.None,
      );
      if (withoutNone.includes(doorType)) {
        onChangeDoorTypes(withoutNone.filter(t => t !== doorType));
      } else {
        onChangeDoorTypes([...withoutNone, doorType]);
      }
    },
    [entranceDoorTypes, onChangeDoorTypes],
  );

  return (
    <Container>
      <SectionTitle>문 유형</SectionTitle>
      <OptionRow>
        {DOOR_TYPE_OPTIONS.map(option => {
          const isSelected = entranceDoorTypes.includes(option.value);
          const isNoneSelected = entranceDoorTypes.includes(
            EntranceDoorType.None,
          );
          const isDisabled =
            option.value !== EntranceDoorType.None && isNoneSelected;
          return (
            <OptionItem key={option.value}>
              <SccButton
                text={option.label}
                textColor={isSelected ? 'brandColor' : 'gray70'}
                buttonColor="white"
                borderColor={isSelected ? 'blue50' : 'gray30'}
                isDisabled={isDisabled}
                onPress={() => toggleDoorType(option.value)}
                elementName="report_correction_door_type"
                logParams={{value: option.value}}
              />
            </OptionItem>
          );
        })}
      </OptionRow>
    </Container>
  );
}

const Container = styled.View``;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-family: ${font.pretendardBold};
  color: ${color.black};
  margin-bottom: 16px;
`;

const OptionRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const OptionItem = styled.View`
  min-width: 80px;
`;

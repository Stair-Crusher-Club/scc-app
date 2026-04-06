import React, {useCallback, useState} from 'react';
import {TextInput} from 'react-native';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface FloorCorrectionSectionProps {
  floors?: number[];
  onChangeFloors: (value: number[]) => void;
}

type FloorPreset = '1f' | 'b1' | '2f_plus' | 'custom';

function getPresetFromFloors(floors?: number[]): FloorPreset | null {
  if (!floors || floors.length === 0) {
    return null;
  }
  if (floors.length === 1 && floors[0] === 1) {
    return '1f';
  }
  if (floors.length === 1 && floors[0] === -1) {
    return 'b1';
  }
  if (floors.length === 1 && floors[0] >= 2) {
    return '2f_plus';
  }
  return 'custom';
}

export default function FloorCorrectionSection({
  floors,
  onChangeFloors,
}: FloorCorrectionSectionProps) {
  const [selectedPreset, setSelectedPreset] = useState<FloorPreset | null>(
    getPresetFromFloors(floors),
  );
  const [customFloor, setCustomFloor] = useState(
    floors && floors.length === 1 && floors[0] >= 2 ? String(floors[0]) : '',
  );

  const handlePresetSelect = useCallback(
    (preset: FloorPreset) => {
      setSelectedPreset(preset);
      switch (preset) {
        case '1f':
          onChangeFloors([1]);
          break;
        case 'b1':
          onChangeFloors([-1]);
          break;
        case '2f_plus': {
          const num = parseInt(customFloor, 10);
          if (!isNaN(num)) {
            onChangeFloors([num]);
          } else {
            setCustomFloor('2');
            onChangeFloors([2]);
          }
          break;
        }
        case 'custom':
          break;
      }
    },
    [customFloor, onChangeFloors],
  );

  const handleCustomFloorChange = useCallback(
    (text: string) => {
      setCustomFloor(text);
      const num = parseInt(text, 10);
      if (!isNaN(num)) {
        onChangeFloors([num]);
      }
    },
    [onChangeFloors],
  );

  const PRESET_OPTIONS: {value: FloorPreset; label: string}[] = [
    {value: '1f', label: '1층'},
    {value: 'b1', label: '지하'},
    {value: '2f_plus', label: '2층 이상'},
  ];

  return (
    <Container>
      <SectionTitle>층 정보</SectionTitle>

      <OptionRow>
        {PRESET_OPTIONS.map(option => {
          const isSelected = selectedPreset === option.value;
          return (
            <OptionItem key={option.value}>
              <SccButton
                text={option.label}
                textColor={isSelected ? 'brandColor' : 'gray70'}
                buttonColor="white"
                borderColor={isSelected ? 'blue50' : 'gray30'}
                onPress={() => handlePresetSelect(option.value)}
                elementName="report_correction_floor_preset"
                logParams={{value: option.value}}
              />
            </OptionItem>
          );
        })}
      </OptionRow>

      {selectedPreset === '2f_plus' && (
        <FloorInputContainer>
          <FloorInput
            value={customFloor}
            onChangeText={handleCustomFloorChange}
            keyboardType="number-pad"
            placeholder="층수 입력"
            placeholderTextColor={color.gray40}
          />
          <FloorInputSuffix>층</FloorInputSuffix>
        </FloorInputContainer>
      )}
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
  min-width: 70px;
`;

const FloorInputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 4px;
`;

const FloorInput = styled(TextInput)`
  border-width: 1px;
  border-color: ${color.gray30};
  border-radius: 8px;
  padding-horizontal: 12px;
  padding-vertical: 8px;
  font-size: 14px;
  font-family: ${font.pretendardRegular};
  color: ${color.black};
  width: 80px;
`;

const FloorInputSuffix = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray60};
  margin-left: 8px;
`;

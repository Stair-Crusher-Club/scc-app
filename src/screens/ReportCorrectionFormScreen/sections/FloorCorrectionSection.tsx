import React, {useCallback, useState} from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

import OptionsV2 from '../../PlaceFormV2Screen/components/OptionsV2';
import FloorSelect from '../../PlaceReviewFormScreen/components/FloorSelect';

type FloorPreset = '1f' | 'underground' | '2f_plus';

const FLOOR_PRESET_OPTIONS = [
  {value: '1f' as FloorPreset, label: '1층'},
  {value: 'underground' as FloorPreset, label: '지하'},
  {value: '2f_plus' as FloorPreset, label: '2층 이상'},
];

function getPresetFromFloors(floors?: number[]): FloorPreset | null {
  if (!floors || floors.length === 0) {
    return null;
  }
  if (floors.length === 1 && floors[0] === 1) {
    return '1f';
  }
  if (floors.length === 1 && floors[0] < 0) {
    return 'underground';
  }
  if (floors.length === 1 && floors[0] >= 2) {
    return '2f_plus';
  }
  return null;
}

interface FloorCorrectionSectionProps {
  floors?: number[];
  onChangeFloors: (value: number[]) => void;
}

export default function FloorCorrectionSection({
  floors,
  onChangeFloors,
}: FloorCorrectionSectionProps) {
  const [selectedPreset, setSelectedPreset] = useState<FloorPreset | null>(
    getPresetFromFloors(floors),
  );

  const detailFloorValue =
    floors && floors.length === 1 && floors[0] !== 1 ? floors[0] : undefined;

  const handlePresetSelect = useCallback(
    (preset: FloorPreset) => {
      setSelectedPreset(preset);
      switch (preset) {
        case '1f':
          onChangeFloors([1]);
          break;
        case 'underground':
          onChangeFloors([-1]);
          break;
        case '2f_plus':
          onChangeFloors([2]);
          break;
      }
    },
    [onChangeFloors],
  );

  const handleFloorChange = useCallback(
    (value: number) => {
      onChangeFloors([value]);
    },
    [onChangeFloors],
  );

  const showFloorSelect =
    selectedPreset === 'underground' || selectedPreset === '2f_plus';

  return (
    <Container>
      <SectionTitle>이 장소는 몇 층에 있나요?</SectionTitle>

      <OptionsV2
        options={FLOOR_PRESET_OPTIONS}
        value={selectedPreset}
        columns={3}
        onSelect={handlePresetSelect}
      />

      {showFloorSelect && (
        <FloorSelectWrapper>
          <FloorSelect
            key={selectedPreset}
            value={detailFloorValue}
            onChange={handleFloorChange}
          />
        </FloorSelectWrapper>
      )}
    </Container>
  );
}

// Styled components
const Container = styled.View``;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-family: ${font.pretendardBold};
  color: ${color.black};
  margin-bottom: 16px;
`;

const FloorSelectWrapper = styled.View`
  margin-top: 12px;
`;

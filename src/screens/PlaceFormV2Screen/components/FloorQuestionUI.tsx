import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

import FloorSelect from '../../PlaceReviewFormScreen/components/FloorSelect';
import {FLOOR_OPTIONS, STANDALONE_BUILDING_OPTIONS} from '../constants';
import type {FloorOptionKey, StandaloneBuildingType} from '../types';
import OptionsV2 from './OptionsV2';

interface FloorQuestionUIProps {
  floorOption: FloorOptionKey | null;
  selectedFloor?: number;
  standaloneType: StandaloneBuildingType | null;
  onChangeFloorOption: (value: FloorOptionKey) => void;
  onChangeSelectedFloor: (value: number) => void;
  onChangeStandaloneType: (value: StandaloneBuildingType) => void;
}

/**
 * Shared floor question UI used by both PlaceFormV2 (PA registration)
 * and ReportCorrectionForm (correction report).
 *
 * Contains:
 * - Floor option selection (1층, 다른층, 여러층, 단독건물)
 * - Floor number picker (when "다른층" is selected)
 * - Standalone building type selection (when "단독건물" is selected)
 */
export default function FloorQuestionUI({
  floorOption,
  selectedFloor,
  standaloneType,
  onChangeFloorOption,
  onChangeSelectedFloor,
  onChangeStandaloneType,
}: FloorQuestionUIProps) {
  return (
    <>
      <OptionsV2
        value={floorOption}
        columns={1}
        options={FLOOR_OPTIONS.map(option => ({
          label: option.label,
          value: option.key,
        }))}
        onSelect={onChangeFloorOption}
      />

      {floorOption === 'otherFloor' && (
        <AdditionalQuestionArea>
          <SubQuestionText>그럼 몇층에 있는 장소인가요?</SubQuestionText>
          <FloorSelect
            value={selectedFloor}
            onChange={onChangeSelectedFloor}
            minAbsoluteFloor={2}
          />
        </AdditionalQuestionArea>
      )}

      {floorOption === 'standalone' && (
        <AdditionalQuestionArea>
          <SubQuestionText>어떤 유형의 단독건물인가요?</SubQuestionText>
          <OptionsV2
            value={standaloneType}
            columns={2}
            options={STANDALONE_BUILDING_OPTIONS.map(option => ({
              label: option.label,
              value: option.key,
            }))}
            onSelect={onChangeStandaloneType}
          />
        </AdditionalQuestionArea>
      )}
    </>
  );
}

const AdditionalQuestionArea = styled.View`
  margin-top: 20px;
  gap: 20px;
`;

const SubQuestionText = styled.Text`
  font-size: 16px;
  font-family: ${font.pretendardBold};
  color: ${color.black};
`;

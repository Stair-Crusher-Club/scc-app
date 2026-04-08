import React from 'react';
import styled from 'styled-components/native';

import {
  STAIR_INFO_OPTIONS,
  STAIR_HEIGHT_OPTIONS,
  SLOPE_OPTIONS,
} from '@/constant/accessibility-options';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {StairInfo, StairHeightLevel} from '@/generated-sources/openapi';
import ImageFile from '@/models/ImageFile';

import OptionsV2 from '../../PlaceFormV2Screen/components/OptionsV2';
import PhotoEditSlots from './PhotoEditSlots';

interface EntranceCorrectionSectionProps {
  stairInfo?: StairInfo;
  stairHeightLevel?: StairHeightLevel;
  hasSlope?: boolean;
  existingEntrancePhotoUrls: string[];
  newEntrancePhotos: ImageFile[];
  deletedEntrancePhotoIndices: number[];
  replacedEntrancePhotos: Map<number, ImageFile>;
  onChangeStairInfo: (value: StairInfo) => void;
  onChangeStairHeightLevel: (value: StairHeightLevel) => void;
  onChangeHasSlope: (value: boolean) => void;
  onDeleteExistingEntrancePhoto: (index: number) => void;
  onReplaceExistingEntrancePhoto: (index: number, photo: ImageFile) => void;
  onChangeNewEntrancePhotos: (photos: ImageFile[]) => void;
}

export default function EntranceCorrectionSection({
  stairInfo,
  stairHeightLevel,
  hasSlope,
  existingEntrancePhotoUrls,
  newEntrancePhotos,
  deletedEntrancePhotoIndices,
  replacedEntrancePhotos,
  onChangeStairInfo,
  onChangeStairHeightLevel,
  onChangeHasSlope,
  onDeleteExistingEntrancePhoto,
  onReplaceExistingEntrancePhoto,
  onChangeNewEntrancePhotos,
}: EntranceCorrectionSectionProps) {
  return (
    <Container>
      <SectionTitle>입구 정보(계단, 경사로 등)</SectionTitle>

      <SubLabel>계단 수</SubLabel>
      <OptionsV2
        options={STAIR_INFO_OPTIONS}
        value={stairInfo}
        columns={2}
        onSelect={onChangeStairInfo}
      />

      {stairInfo === StairInfo.One && (
        <>
          <SubLabel>계단 높이</SubLabel>
          <OptionsV2
            options={STAIR_HEIGHT_OPTIONS}
            value={stairHeightLevel}
            columns={1}
            onSelect={onChangeStairHeightLevel}
          />
        </>
      )}

      <SubLabel>경사로</SubLabel>
      <OptionsV2
        options={SLOPE_OPTIONS}
        value={hasSlope}
        columns={2}
        onSelect={onChangeHasSlope}
      />

      <PhotoEditSlots
        existingPhotoUrls={existingEntrancePhotoUrls}
        newPhotos={newEntrancePhotos}
        deletedExistingIndices={deletedEntrancePhotoIndices}
        replacedPhotos={replacedEntrancePhotos}
        maxPhotos={3}
        onDeleteExisting={onDeleteExistingEntrancePhoto}
        onReplaceExisting={onReplaceExistingEntrancePhoto}
        onChangeNewPhotos={onChangeNewEntrancePhotos}
      />
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

const SubLabel = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardMedium};
  color: ${color.gray60};
  margin-bottom: 8px;
  margin-top: 12px;
`;

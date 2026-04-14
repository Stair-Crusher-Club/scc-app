import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {StairInfo, StairHeightLevel} from '@/generated-sources/openapi';
import ImageFile from '@/models/ImageFile';

import OptionsV2 from '../../PlaceFormV2Screen/components/OptionsV2';
import {ENTRANCE_OPTIONS} from '../../PlaceFormV2Screen/hooks';
import PhotoEditSlots from './PhotoEditSlots';

interface BuildingEntranceCorrectionSectionProps {
  entranceStairInfo?: StairInfo;
  entranceStairHeightLevel?: StairHeightLevel;
  hasSlope?: boolean;
  existingBaEntrancePhotoUrls: string[];
  newBaEntrancePhotos: ImageFile[];
  deletedBaEntrancePhotoIndices: number[];
  replacedBaEntrancePhotos: Map<number, ImageFile>;
  onChangeEntranceStairInfo: (value: StairInfo) => void;
  onChangeEntranceStairHeightLevel: (value: StairHeightLevel) => void;
  onChangeHasSlope: (value: boolean) => void;
  onDeleteExistingBaEntrancePhoto: (index: number) => void;
  onReplaceExistingBaEntrancePhoto: (index: number, photo: ImageFile) => void;
  onChangeNewBaEntrancePhotos: (photos: ImageFile[]) => void;
}

export default function BuildingEntranceCorrectionSection({
  entranceStairInfo,
  entranceStairHeightLevel,
  hasSlope,
  existingBaEntrancePhotoUrls,
  newBaEntrancePhotos,
  deletedBaEntrancePhotoIndices,
  replacedBaEntrancePhotos,
  onChangeEntranceStairInfo,
  onChangeEntranceStairHeightLevel,
  onChangeHasSlope,
  onDeleteExistingBaEntrancePhoto,
  onReplaceExistingBaEntrancePhoto,
  onChangeNewBaEntrancePhotos,
}: BuildingEntranceCorrectionSectionProps) {
  const showStairHeight = entranceStairInfo === StairInfo.One;

  return (
    <Container>
      <SectionTitle>건물 입구 정보</SectionTitle>

      <SubLabel>계단 수</SubLabel>
      <OptionsV2
        options={ENTRANCE_OPTIONS.stairInfoOptions}
        value={entranceStairInfo}
        columns={2}
        onSelect={onChangeEntranceStairInfo}
      />

      {showStairHeight && (
        <>
          <SubLabel>계단 높이</SubLabel>
          <OptionsV2
            options={ENTRANCE_OPTIONS.stairHeightOptions}
            value={entranceStairHeightLevel}
            columns={1}
            onSelect={onChangeEntranceStairHeightLevel}
          />
        </>
      )}

      <SubLabel>경사로</SubLabel>
      <OptionsV2
        options={ENTRANCE_OPTIONS.slopeOptions}
        value={hasSlope}
        columns={2}
        onSelect={onChangeHasSlope}
      />

      <SubLabel>건물 입구 사진</SubLabel>
      <PhotoEditSlots
        existingPhotoUrls={existingBaEntrancePhotoUrls}
        newPhotos={newBaEntrancePhotos}
        deletedExistingIndices={deletedBaEntrancePhotoIndices}
        replacedPhotos={replacedBaEntrancePhotos}
        maxPhotos={3}
        onDeleteExisting={onDeleteExistingBaEntrancePhoto}
        onReplaceExisting={onReplaceExistingBaEntrancePhoto}
        onChangeNewPhotos={onChangeNewBaEntrancePhotos}
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

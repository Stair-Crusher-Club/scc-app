import React from 'react';

import {StairInfo, StairHeightLevel} from '@/generated-sources/openapi';
import ImageFile from '@/models/ImageFile';

import OptionsV2 from '../../PlaceFormV2Screen/components/OptionsV2';
import {ENTRANCE_OPTIONS} from '../../PlaceFormV2Screen/hooks';
import PhotoEditSlots from './PhotoEditSlots';
import {FormGroup, GuideLink, SectionRoot, SubLabel} from './shared';

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
    <SectionRoot>
      <FormGroup>
        <SubLabel>계단 수를 확인해주세요</SubLabel>
        <OptionsV2
          options={ENTRANCE_OPTIONS.stairInfoOptions}
          value={entranceStairInfo}
          columns={2}
          onSelect={onChangeEntranceStairInfo}
        />
        <GuideLink
          type="stair"
          elementName="report_correction_building_entrance_stair_guide"
        />
      </FormGroup>

      {showStairHeight && (
        <FormGroup>
          <SubLabel>계단 높이를 확인해주세요</SubLabel>
          <OptionsV2
            options={ENTRANCE_OPTIONS.stairHeightOptions}
            value={entranceStairHeightLevel}
            columns={1}
            onSelect={onChangeEntranceStairHeightLevel}
          />
        </FormGroup>
      )}

      <FormGroup>
        <SubLabel>경사로 유무를 확인해주세요</SubLabel>
        <OptionsV2
          options={ENTRANCE_OPTIONS.slopeOptions}
          value={hasSlope}
          columns={2}
          onSelect={onChangeHasSlope}
        />
        <GuideLink
          type="slope"
          elementName="report_correction_building_entrance_slope_guide"
        />
      </FormGroup>

      <PhotoEditSlots
        title="건물 입구 사진을 확인해주세요"
        description="최대 3장까지 등록 가능해요"
        existingPhotoUrls={existingBaEntrancePhotoUrls}
        newPhotos={newBaEntrancePhotos}
        deletedExistingIndices={deletedBaEntrancePhotoIndices}
        replacedPhotos={replacedBaEntrancePhotos}
        maxPhotos={3}
        onDeleteExisting={onDeleteExistingBaEntrancePhoto}
        onReplaceExisting={onReplaceExistingBaEntrancePhoto}
        onChangeNewPhotos={onChangeNewBaEntrancePhotos}
      />
    </SectionRoot>
  );
}

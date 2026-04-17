import React, {useMemo} from 'react';
import {Image} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {
  StairInfo,
  StairHeightLevel,
  PlaceDoorDirectionTypeDto,
} from '@/generated-sources/openapi';
import ImageFile from '@/models/ImageFile';

import OptionsV2 from '../../PlaceFormV2Screen/components/OptionsV2';
import {formImages} from '../../PlaceFormV2Screen/constants';
import {
  getEntranceConditions,
  ENTRANCE_OPTIONS,
} from '../../PlaceFormV2Screen/hooks';
import PhotoEditSlots from './PhotoEditSlots';
import {FormGroup, GuideLink, SectionRoot, SubLabel} from './shared';

interface PlaceEntranceCorrectionSectionProps {
  stairInfo?: StairInfo;
  stairHeightLevel?: StairHeightLevel;
  hasSlope?: boolean;
  doorDirectionType?: PlaceDoorDirectionTypeDto;
  isStandaloneBuilding?: boolean;
  existingEntrancePhotoUrls: string[];
  newEntrancePhotos: ImageFile[];
  deletedEntrancePhotoIndices: number[];
  replacedEntrancePhotos: Map<number, ImageFile>;
  onChangeStairInfo: (value: StairInfo) => void;
  onChangeStairHeightLevel: (value: StairHeightLevel) => void;
  onChangeHasSlope: (value: boolean) => void;
  onChangeDoorDirectionType: (value: PlaceDoorDirectionTypeDto) => void;
  onDeleteExistingEntrancePhoto: (index: number) => void;
  onReplaceExistingEntrancePhoto: (index: number, photo: ImageFile) => void;
  onChangeNewEntrancePhotos: (photos: ImageFile[]) => void;
}

export default function PlaceEntranceCorrectionSection({
  stairInfo,
  stairHeightLevel,
  hasSlope,
  doorDirectionType,
  isStandaloneBuilding = false,
  existingEntrancePhotoUrls,
  newEntrancePhotos,
  deletedEntrancePhotoIndices,
  replacedEntrancePhotos,
  onChangeStairInfo,
  onChangeStairHeightLevel,
  onChangeHasSlope,
  onChangeDoorDirectionType,
  onDeleteExistingEntrancePhoto,
  onReplaceExistingEntrancePhoto,
  onChangeNewEntrancePhotos,
}: PlaceEntranceCorrectionSectionProps) {
  const conditions = useMemo(
    () => getEntranceConditions({stairInfo, isStandaloneBuilding}),
    [stairInfo, isStandaloneBuilding],
  );

  return (
    <SectionRoot>
      {conditions.showDoorDirection && (
        <FormGroup>
          <SubLabel>매장 출입구 위치를 확인해주세요</SubLabel>
          <DoorDirectionContainer>
            <DoorDirectionOption>
              <DoorDirectionImageContainer
                disabled={
                  !!doorDirectionType &&
                  doorDirectionType !==
                    PlaceDoorDirectionTypeDto.OutsideBuilding
                }>
                <Image
                  source={formImages.entrance.out}
                  style={{width: '100%', height: '100%'}}
                  resizeMode="cover"
                />
              </DoorDirectionImageContainer>
              <OptionsV2
                value={doorDirectionType}
                columns={1}
                options={[
                  {
                    label: '건물 밖',
                    value: PlaceDoorDirectionTypeDto.OutsideBuilding,
                  },
                ]}
                onSelect={onChangeDoorDirectionType}
              />
            </DoorDirectionOption>
            <DoorDirectionOption>
              <DoorDirectionImageContainer
                disabled={
                  !!doorDirectionType &&
                  doorDirectionType !== PlaceDoorDirectionTypeDto.InsideBuilding
                }>
                <Image
                  source={formImages.entrance.in}
                  style={{width: '100%', height: '100%'}}
                  resizeMode="cover"
                />
              </DoorDirectionImageContainer>
              <OptionsV2
                value={doorDirectionType}
                columns={1}
                options={[
                  {
                    label: '건물 안',
                    value: PlaceDoorDirectionTypeDto.InsideBuilding,
                  },
                ]}
                onSelect={onChangeDoorDirectionType}
              />
            </DoorDirectionOption>
          </DoorDirectionContainer>
        </FormGroup>
      )}

      <FormGroup>
        <SubLabel>계단 수를 확인해주세요</SubLabel>
        <OptionsV2
          options={ENTRANCE_OPTIONS.stairInfoOptions}
          value={stairInfo}
          columns={2}
          onSelect={onChangeStairInfo}
        />
        <GuideLink
          type="stair"
          elementName="report_correction_place_entrance_stair_guide"
        />
      </FormGroup>

      {conditions.showStairHeight && (
        <FormGroup>
          <SubLabel>계단 높이를 확인해주세요</SubLabel>
          <OptionsV2
            options={ENTRANCE_OPTIONS.stairHeightOptions}
            value={stairHeightLevel}
            columns={1}
            onSelect={onChangeStairHeightLevel}
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
          elementName="report_correction_place_entrance_slope_guide"
        />
      </FormGroup>

      <PhotoEditSlots
        title="매장 입구 사진을 확인해주세요"
        description="최대 3장까지 등록 가능해요"
        existingPhotoUrls={existingEntrancePhotoUrls}
        newPhotos={newEntrancePhotos}
        deletedExistingIndices={deletedEntrancePhotoIndices}
        replacedPhotos={replacedEntrancePhotos}
        maxPhotos={3}
        onDeleteExisting={onDeleteExistingEntrancePhoto}
        onReplaceExisting={onReplaceExistingEntrancePhoto}
        onChangeNewPhotos={onChangeNewEntrancePhotos}
      />
    </SectionRoot>
  );
}

const DoorDirectionContainer = styled.View`
  flex-direction: row;
  gap: 8px;
`;

const DoorDirectionOption = styled.View`
  flex: 1;
  gap: 8px;
`;

const DoorDirectionImageContainer = styled.View<{disabled?: boolean}>`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${color.gray20};
  opacity: ${({disabled}) => (disabled ? 0.4 : 1)};
`;

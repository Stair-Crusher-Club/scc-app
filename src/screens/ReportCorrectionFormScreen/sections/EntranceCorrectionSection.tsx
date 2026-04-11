import React from 'react';
import {Image} from 'react-native';
import styled from 'styled-components/native';

import {
  STAIR_INFO_OPTIONS,
  STAIR_HEIGHT_OPTIONS,
  SLOPE_OPTIONS,
} from '@/constant/accessibility-options';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  StairInfo,
  StairHeightLevel,
  PlaceDoorDirectionTypeDto,
} from '@/generated-sources/openapi';
import ImageFile from '@/models/ImageFile';

import OptionsV2 from '../../PlaceFormV2Screen/components/OptionsV2';
import {formImages} from '../../PlaceFormV2Screen/constants';
import PhotoEditSlots from './PhotoEditSlots';

interface EntranceCorrectionSectionProps {
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

export default function EntranceCorrectionSection({
  stairInfo,
  stairHeightLevel,
  hasSlope,
  doorDirectionType,
  isStandaloneBuilding,
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
}: EntranceCorrectionSectionProps) {
  return (
    <Container>
      <SectionTitle>입구 정보(계단, 경사로 등)</SectionTitle>

      {!isStandaloneBuilding && (
        <>
          <SubLabel>매장 출입구 위치</SubLabel>
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
        </>
      )}

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

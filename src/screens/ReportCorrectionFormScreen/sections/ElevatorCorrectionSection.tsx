import React, {useCallback, useMemo} from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  ElevatorAccessibilityDto,
  StairInfo,
  StairHeightLevel,
} from '@/generated-sources/openapi';
import ImageFile from '@/models/ImageFile';

import OptionsV2 from '../../PlaceFormV2Screen/components/OptionsV2';
import {
  getElevatorConditions,
  ELEVATOR_OPTIONS,
} from '../../PlaceFormV2Screen/hooks';
import PhotoEditSlots from './PhotoEditSlots';

interface ElevatorCorrectionSectionProps {
  elevatorAccessibility?: ElevatorAccessibilityDto;
  existingElevatorPhotoUrls: string[];
  newElevatorPhotos: ImageFile[];
  deletedElevatorPhotoIndices: number[];
  replacedElevatorPhotos: Map<number, ImageFile>;
  // BA elevator photo props
  needsBaPhotos: boolean;
  existingBaElevatorPhotoUrls: string[];
  newBaElevatorPhotos: ImageFile[];
  deletedBaElevatorPhotoIndices: number[];
  replacedBaElevatorPhotos: Map<number, ImageFile>;
  onChangeElevatorAccessibility: (
    value: ElevatorAccessibilityDto | undefined,
  ) => void;
  onDeleteExistingElevatorPhoto: (index: number) => void;
  onReplaceExistingElevatorPhoto: (index: number, photo: ImageFile) => void;
  onChangeNewElevatorPhotos: (photos: ImageFile[]) => void;
  onDeleteExistingBaElevatorPhoto: (index: number) => void;
  onReplaceExistingBaElevatorPhoto: (index: number, photo: ImageFile) => void;
  onChangeNewBaElevatorPhotos: (photos: ImageFile[]) => void;
}

export default function ElevatorCorrectionSection({
  elevatorAccessibility,
  existingElevatorPhotoUrls,
  newElevatorPhotos,
  deletedElevatorPhotoIndices,
  replacedElevatorPhotos,
  needsBaPhotos,
  existingBaElevatorPhotoUrls,
  newBaElevatorPhotos,
  deletedBaElevatorPhotoIndices,
  replacedBaElevatorPhotos,
  onChangeElevatorAccessibility,
  onDeleteExistingElevatorPhoto,
  onReplaceExistingElevatorPhoto,
  onChangeNewElevatorPhotos,
  onDeleteExistingBaElevatorPhoto,
  onReplaceExistingBaElevatorPhoto,
  onChangeNewBaElevatorPhotos,
}: ElevatorCorrectionSectionProps) {
  const hasElevator = elevatorAccessibility !== undefined;

  const conditions = useMemo(
    () =>
      getElevatorConditions({
        hasElevator,
        stairInfo: elevatorAccessibility?.stairInfo,
      }),
    [hasElevator, elevatorAccessibility?.stairInfo],
  );

  const update = useCallback(
    (partial: Partial<ElevatorAccessibilityDto>) => {
      onChangeElevatorAccessibility({
        ...elevatorAccessibility,
        ...partial,
      });
    },
    [elevatorAccessibility, onChangeElevatorAccessibility],
  );

  const handleHasElevatorChange = useCallback(
    (value: boolean) => {
      if (value) {
        onChangeElevatorAccessibility({});
      } else {
        onChangeElevatorAccessibility(undefined);
      }
    },
    [onChangeElevatorAccessibility],
  );

  return (
    <Container>
      <SectionTitle>엘리베이터가 있나요?</SectionTitle>

      <OptionsV2
        options={ELEVATOR_OPTIONS.hasElevatorOptions}
        value={hasElevator}
        columns={2}
        onSelect={handleHasElevatorChange}
      />

      {conditions.showElevatorDetails && (
        <>
          <SubLabel>엘리베이터까지 계단</SubLabel>
          <OptionsV2
            options={ELEVATOR_OPTIONS.stairInfoOptions}
            value={elevatorAccessibility?.stairInfo}
            columns={2}
            onSelect={(value: StairInfo) =>
              update({
                stairInfo: value,
                ...(value !== StairInfo.One
                  ? {stairHeightLevel: undefined}
                  : {}),
              })
            }
          />

          {conditions.showStairHeight && (
            <>
              <SubLabel>계단 높이</SubLabel>
              <OptionsV2
                options={ELEVATOR_OPTIONS.stairHeightOptions}
                value={elevatorAccessibility?.stairHeightLevel}
                columns={1}
                onSelect={(value: StairHeightLevel) =>
                  update({stairHeightLevel: value})
                }
              />
            </>
          )}

          <SubLabel>엘리베이터 앞 경사로</SubLabel>
          <OptionsV2
            options={ELEVATOR_OPTIONS.slopeOptions}
            value={elevatorAccessibility?.hasSlope}
            columns={2}
            onSelect={(value: boolean) => update({hasSlope: value})}
          />

          <SubLabel>매장 엘리베이터 사진</SubLabel>
          <PhotoEditSlots
            existingPhotoUrls={existingElevatorPhotoUrls}
            newPhotos={newElevatorPhotos}
            deletedExistingIndices={deletedElevatorPhotoIndices}
            replacedPhotos={replacedElevatorPhotos}
            maxPhotos={3}
            onDeleteExisting={onDeleteExistingElevatorPhoto}
            onReplaceExisting={onReplaceExistingElevatorPhoto}
            onChangeNewPhotos={onChangeNewElevatorPhotos}
          />

          {needsBaPhotos && (
            <>
              <SubLabel>건물 엘리베이터 사진</SubLabel>
              <PhotoEditSlots
                existingPhotoUrls={existingBaElevatorPhotoUrls}
                newPhotos={newBaElevatorPhotos}
                deletedExistingIndices={deletedBaElevatorPhotoIndices}
                replacedPhotos={replacedBaElevatorPhotos}
                maxPhotos={3}
                onDeleteExisting={onDeleteExistingBaElevatorPhoto}
                onReplaceExisting={onReplaceExistingBaElevatorPhoto}
                onChangeNewPhotos={onChangeNewBaElevatorPhotos}
              />
            </>
          )}
        </>
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

const SubLabel = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardMedium};
  color: ${color.gray60};
  margin-bottom: 8px;
  margin-top: 12px;
`;

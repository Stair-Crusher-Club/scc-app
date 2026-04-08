import React, {useCallback} from 'react';
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
import PhotoEditSlots from './PhotoEditSlots';

const HAS_ELEVATOR_OPTIONS = [
  {value: true, label: '있음'},
  {value: false, label: '없음'},
];

const STAIR_INFO_OPTIONS = [
  {value: StairInfo.None, label: '없음'},
  {value: StairInfo.One, label: '1칸'},
  {value: StairInfo.TwoToFive, label: '2~5칸'},
  {value: StairInfo.OverSix, label: '6칸 이상'},
];

const STAIR_HEIGHT_OPTIONS = [
  {value: StairHeightLevel.HalfThumb, label: '엄지 반마디 이하'},
  {value: StairHeightLevel.Thumb, label: '엄지 한마디 정도'},
  {value: StairHeightLevel.OverThumb, label: '엄지 한마디 이상'},
];

const SLOPE_OPTIONS = [
  {value: true, label: '있음'},
  {value: false, label: '없음'},
];

interface ElevatorCorrectionSectionProps {
  elevatorAccessibility?: ElevatorAccessibilityDto;
  existingElevatorPhotoUrls: string[];
  newElevatorPhotos: ImageFile[];
  deletedElevatorPhotoIndices: number[];
  replacedElevatorPhotos: Map<number, ImageFile>;
  onChangeElevatorAccessibility: (
    value: ElevatorAccessibilityDto | undefined,
  ) => void;
  onDeleteExistingElevatorPhoto: (index: number) => void;
  onReplaceExistingElevatorPhoto: (index: number, photo: ImageFile) => void;
  onChangeNewElevatorPhotos: (photos: ImageFile[]) => void;
}

export default function ElevatorCorrectionSection({
  elevatorAccessibility,
  existingElevatorPhotoUrls,
  newElevatorPhotos,
  deletedElevatorPhotoIndices,
  replacedElevatorPhotos,
  onChangeElevatorAccessibility,
  onDeleteExistingElevatorPhoto,
  onReplaceExistingElevatorPhoto,
  onChangeNewElevatorPhotos,
}: ElevatorCorrectionSectionProps) {
  const hasElevator = elevatorAccessibility !== undefined;

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
        options={HAS_ELEVATOR_OPTIONS}
        value={hasElevator}
        columns={2}
        onSelect={handleHasElevatorChange}
      />

      {hasElevator && (
        <>
          <SubLabel>엘리베이터까지 계단</SubLabel>
          <OptionsV2
            options={STAIR_INFO_OPTIONS}
            value={elevatorAccessibility?.stairInfo}
            columns={2}
            onSelect={(value: StairInfo) => update({stairInfo: value})}
          />

          {elevatorAccessibility?.stairInfo === StairInfo.One && (
            <>
              <SubLabel>계단 높이</SubLabel>
              <OptionsV2
                options={STAIR_HEIGHT_OPTIONS}
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
            options={SLOPE_OPTIONS}
            value={elevatorAccessibility?.hasSlope}
            columns={2}
            onSelect={(value: boolean) => update({hasSlope: value})}
          />

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

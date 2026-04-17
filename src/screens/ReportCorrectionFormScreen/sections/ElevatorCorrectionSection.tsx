import React, {useCallback, useMemo} from 'react';

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
import {FormGroup, GuideLink, SectionRoot, SubLabel} from './shared';

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
    <SectionRoot>
      <FormGroup>
        <SubLabel>엘리베이터가 있는지 확인해주세요</SubLabel>
        <OptionsV2
          options={ELEVATOR_OPTIONS.hasElevatorOptions}
          value={hasElevator}
          columns={2}
          onSelect={handleHasElevatorChange}
        />
      </FormGroup>

      {conditions.showElevatorDetails && (
        <>
          <FormGroup>
            <SubLabel>엘리베이터까지 계단을 확인해주세요</SubLabel>
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
            <GuideLink
              type="stair"
              elementName="report_correction_elevator_stair_guide"
            />
          </FormGroup>

          {conditions.showStairHeight && (
            <FormGroup>
              <SubLabel>계단 높이를 확인해주세요</SubLabel>
              <OptionsV2
                options={ELEVATOR_OPTIONS.stairHeightOptions}
                value={elevatorAccessibility?.stairHeightLevel}
                columns={1}
                onSelect={(value: StairHeightLevel) =>
                  update({stairHeightLevel: value})
                }
              />
            </FormGroup>
          )}

          <FormGroup>
            <SubLabel>엘리베이터 앞 경사로를 확인해주세요</SubLabel>
            <OptionsV2
              options={ELEVATOR_OPTIONS.slopeOptions}
              value={elevatorAccessibility?.hasSlope}
              columns={2}
              onSelect={(value: boolean) => update({hasSlope: value})}
            />
            <GuideLink
              type="slope"
              elementName="report_correction_elevator_slope_guide"
            />
          </FormGroup>

          <PhotoEditSlots
            title="매장 엘리베이터 사진을 확인해주세요"
            description="최대 3장까지 등록 가능해요"
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
            <PhotoEditSlots
              title="건물 엘리베이터 사진을 확인해주세요"
              description="최대 3장까지 등록 가능해요"
              existingPhotoUrls={existingBaElevatorPhotoUrls}
              newPhotos={newBaElevatorPhotos}
              deletedExistingIndices={deletedBaElevatorPhotoIndices}
              replacedPhotos={replacedBaElevatorPhotos}
              maxPhotos={3}
              onDeleteExisting={onDeleteExistingBaElevatorPhoto}
              onReplaceExisting={onReplaceExistingBaElevatorPhoto}
              onChangeNewPhotos={onChangeNewBaElevatorPhotos}
            />
          )}
        </>
      )}
    </SectionRoot>
  );
}

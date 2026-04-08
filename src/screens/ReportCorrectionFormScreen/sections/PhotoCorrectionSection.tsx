import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import ImageFile from '@/models/ImageFile';

import PhotoEditSlots from './PhotoEditSlots';

interface PhotoCorrectionSectionProps {
  entranceImageUrls: string[];
  elevatorImageUrls: string[];
  newEntrancePhotos: ImageFile[];
  newElevatorPhotos: ImageFile[];
  deletedEntrancePhotoIndices: number[];
  deletedElevatorPhotoIndices: number[];
  replacedEntrancePhotos: Map<number, ImageFile>;
  replacedElevatorPhotos: Map<number, ImageFile>;
  onDeleteExistingEntrancePhoto: (index: number) => void;
  onDeleteExistingElevatorPhoto: (index: number) => void;
  onReplaceExistingEntrancePhoto: (index: number, photo: ImageFile) => void;
  onReplaceExistingElevatorPhoto: (index: number, photo: ImageFile) => void;
  onChangeNewEntrancePhotos: (photos: ImageFile[]) => void;
  onChangeNewElevatorPhotos: (photos: ImageFile[]) => void;
}

export default function PhotoCorrectionSection({
  entranceImageUrls,
  elevatorImageUrls,
  newEntrancePhotos,
  newElevatorPhotos,
  deletedEntrancePhotoIndices,
  deletedElevatorPhotoIndices,
  replacedEntrancePhotos,
  replacedElevatorPhotos,
  onDeleteExistingEntrancePhoto,
  onDeleteExistingElevatorPhoto,
  onReplaceExistingEntrancePhoto,
  onReplaceExistingElevatorPhoto,
  onChangeNewEntrancePhotos,
  onChangeNewElevatorPhotos,
}: PhotoCorrectionSectionProps) {
  const hasEntrancePhotos =
    entranceImageUrls.length > 0 || newEntrancePhotos.length > 0;
  const hasElevatorPhotos =
    elevatorImageUrls.length > 0 || newElevatorPhotos.length > 0;

  return (
    <Container>
      <SectionTitle>사진을 수정해주세요</SectionTitle>

      {(hasEntrancePhotos || entranceImageUrls.length > 0) && (
        <>
          <PhotoSectionLabel>입구 사진</PhotoSectionLabel>
          <PhotoEditSlots
            existingPhotoUrls={entranceImageUrls}
            newPhotos={newEntrancePhotos}
            deletedExistingIndices={deletedEntrancePhotoIndices}
            replacedPhotos={replacedEntrancePhotos}
            maxPhotos={3}
            onDeleteExisting={onDeleteExistingEntrancePhoto}
            onReplaceExisting={onReplaceExistingEntrancePhoto}
            onChangeNewPhotos={onChangeNewEntrancePhotos}
          />
        </>
      )}

      {(hasElevatorPhotos || elevatorImageUrls.length > 0) && (
        <>
          <PhotoSectionLabel>엘리베이터 사진</PhotoSectionLabel>
          <PhotoEditSlots
            existingPhotoUrls={elevatorImageUrls}
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

const PhotoSectionLabel = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardBold};
  color: ${color.gray70};
  margin-top: 16px;
  margin-bottom: 8px;
`;

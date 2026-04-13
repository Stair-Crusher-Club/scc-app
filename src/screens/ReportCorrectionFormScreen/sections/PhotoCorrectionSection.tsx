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
  // BA photo props
  needsBaPhotos: boolean;
  baEntranceImageUrls: string[];
  baElevatorImageUrls: string[];
  newBaEntrancePhotos: ImageFile[];
  newBaElevatorPhotos: ImageFile[];
  deletedBaEntrancePhotoIndices: number[];
  deletedBaElevatorPhotoIndices: number[];
  replacedBaEntrancePhotos: Map<number, ImageFile>;
  replacedBaElevatorPhotos: Map<number, ImageFile>;
  onDeleteExistingEntrancePhoto: (index: number) => void;
  onDeleteExistingElevatorPhoto: (index: number) => void;
  onReplaceExistingEntrancePhoto: (index: number, photo: ImageFile) => void;
  onReplaceExistingElevatorPhoto: (index: number, photo: ImageFile) => void;
  onChangeNewEntrancePhotos: (photos: ImageFile[]) => void;
  onChangeNewElevatorPhotos: (photos: ImageFile[]) => void;
  onDeleteExistingBaEntrancePhoto: (index: number) => void;
  onDeleteExistingBaElevatorPhoto: (index: number) => void;
  onReplaceExistingBaEntrancePhoto: (index: number, photo: ImageFile) => void;
  onReplaceExistingBaElevatorPhoto: (index: number, photo: ImageFile) => void;
  onChangeNewBaEntrancePhotos: (photos: ImageFile[]) => void;
  onChangeNewBaElevatorPhotos: (photos: ImageFile[]) => void;
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
  needsBaPhotos,
  baEntranceImageUrls,
  baElevatorImageUrls,
  newBaEntrancePhotos,
  newBaElevatorPhotos,
  deletedBaEntrancePhotoIndices,
  deletedBaElevatorPhotoIndices,
  replacedBaEntrancePhotos,
  replacedBaElevatorPhotos,
  onDeleteExistingEntrancePhoto,
  onDeleteExistingElevatorPhoto,
  onReplaceExistingEntrancePhoto,
  onReplaceExistingElevatorPhoto,
  onChangeNewEntrancePhotos,
  onChangeNewElevatorPhotos,
  onDeleteExistingBaEntrancePhoto,
  onDeleteExistingBaElevatorPhoto,
  onReplaceExistingBaEntrancePhoto,
  onReplaceExistingBaElevatorPhoto,
  onChangeNewBaEntrancePhotos,
  onChangeNewBaElevatorPhotos,
}: PhotoCorrectionSectionProps) {
  const hasEntrancePhotos =
    entranceImageUrls.length > 0 || newEntrancePhotos.length > 0;
  const hasElevatorPhotos =
    elevatorImageUrls.length > 0 || newElevatorPhotos.length > 0;
  const hasBaEntrancePhotos =
    needsBaPhotos &&
    (baEntranceImageUrls.length > 0 || newBaEntrancePhotos.length > 0);
  const hasBaElevatorPhotos =
    needsBaPhotos &&
    (baElevatorImageUrls.length > 0 || newBaElevatorPhotos.length > 0);

  return (
    <Container>
      <SectionTitle>사진을 수정해주세요</SectionTitle>

      {(hasEntrancePhotos || entranceImageUrls.length > 0) && (
        <>
          <PhotoSectionLabel>매장 입구 사진</PhotoSectionLabel>
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
          <PhotoSectionLabel>매장 엘리베이터 사진</PhotoSectionLabel>
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

      {(hasBaEntrancePhotos ||
        (needsBaPhotos && baEntranceImageUrls.length > 0)) && (
        <>
          <PhotoSectionLabel>건물 입구 사진</PhotoSectionLabel>
          <PhotoEditSlots
            existingPhotoUrls={baEntranceImageUrls}
            newPhotos={newBaEntrancePhotos}
            deletedExistingIndices={deletedBaEntrancePhotoIndices}
            replacedPhotos={replacedBaEntrancePhotos}
            maxPhotos={3}
            onDeleteExisting={onDeleteExistingBaEntrancePhoto}
            onReplaceExisting={onReplaceExistingBaEntrancePhoto}
            onChangeNewPhotos={onChangeNewBaEntrancePhotos}
          />
        </>
      )}

      {(hasBaElevatorPhotos ||
        (needsBaPhotos && baElevatorImageUrls.length > 0)) && (
        <>
          <PhotoSectionLabel>건물 엘리베이터 사진</PhotoSectionLabel>
          <PhotoEditSlots
            existingPhotoUrls={baElevatorImageUrls}
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

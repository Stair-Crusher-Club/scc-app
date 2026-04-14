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
  baEntranceImageUrls: string[];
  baElevatorImageUrls: string[];
  newBaEntrancePhotos: ImageFile[];
  newBaElevatorPhotos: ImageFile[];
  deletedBaEntrancePhotoIndices: number[];
  deletedBaElevatorPhotoIndices: number[];
  replacedBaEntrancePhotos: Map<number, ImageFile>;
  replacedBaElevatorPhotos: Map<number, ImageFile>;
  // Visibility conditions (match PDP home tab)
  showPlaceElevatorPhotos: boolean;
  showBaEntrancePhotos: boolean;
  showBaElevatorPhotos: boolean;
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
  baEntranceImageUrls,
  baElevatorImageUrls,
  newBaEntrancePhotos,
  newBaElevatorPhotos,
  deletedBaEntrancePhotoIndices,
  deletedBaElevatorPhotoIndices,
  replacedBaEntrancePhotos,
  replacedBaElevatorPhotos,
  showPlaceElevatorPhotos,
  showBaEntrancePhotos,
  showBaElevatorPhotos,
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
  return (
    <Container>
      <SectionTitle>사진을 수정해주세요</SectionTitle>

      {/* 장소 입구 사진 — PA exists이면 항상 표시 */}
      <PhotoSectionLabel>장소 입구 사진</PhotoSectionLabel>
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

      {/* 매장 엘리베이터 사진 — PA floorMovingMethodTypes에 PLACE_ELEVATOR 포함 시 */}
      {showPlaceElevatorPhotos && (
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

      {/* 건물 입구 사진 — PDP에 '건물 출입구' 섹션이 표시될 때 */}
      {showBaEntrancePhotos && (
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

      {/* 건물 엘리베이터 사진 — 건물 출입구 + BA.hasElevator일 때 */}
      {showBaElevatorPhotos && (
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

import React from 'react';

import ImageFile from '@/models/ImageFile';

import PhotoEditSlots from './PhotoEditSlots';
import {SectionRoot} from './shared';

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
    <SectionRoot>
      {/* 장소 입구 사진 — PA exists이면 항상 표시 */}
      <PhotoEditSlots
        title="장소 입구 사진을 확인해주세요"
        description="최대 3장까지 등록 가능해요"
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
        <PhotoEditSlots
          title="매장 엘리베이터 사진을 확인해주세요"
          description="최대 3장까지 등록 가능해요"
          existingPhotoUrls={elevatorImageUrls}
          newPhotos={newElevatorPhotos}
          deletedExistingIndices={deletedElevatorPhotoIndices}
          replacedPhotos={replacedElevatorPhotos}
          maxPhotos={3}
          onDeleteExisting={onDeleteExistingElevatorPhoto}
          onReplaceExisting={onReplaceExistingElevatorPhoto}
          onChangeNewPhotos={onChangeNewElevatorPhotos}
        />
      )}

      {/* 건물 입구 사진 — PDP에 '건물 출입구' 섹션이 표시될 때 */}
      {showBaEntrancePhotos && (
        <PhotoEditSlots
          title="건물 입구 사진을 확인해주세요"
          description="최대 3장까지 등록 가능해요"
          existingPhotoUrls={baEntranceImageUrls}
          newPhotos={newBaEntrancePhotos}
          deletedExistingIndices={deletedBaEntrancePhotoIndices}
          replacedPhotos={replacedBaEntrancePhotos}
          maxPhotos={3}
          onDeleteExisting={onDeleteExistingBaEntrancePhoto}
          onReplaceExisting={onReplaceExistingBaEntrancePhoto}
          onChangeNewPhotos={onChangeNewBaEntrancePhotos}
        />
      )}

      {/* 건물 엘리베이터 사진 — 건물 출입구 + BA.hasElevator일 때 */}
      {showBaElevatorPhotos && (
        <PhotoEditSlots
          title="건물 엘리베이터 사진을 확인해주세요"
          description="최대 3장까지 등록 가능해요"
          existingPhotoUrls={baElevatorImageUrls}
          newPhotos={newBaElevatorPhotos}
          deletedExistingIndices={deletedBaElevatorPhotoIndices}
          replacedPhotos={replacedBaElevatorPhotos}
          maxPhotos={3}
          onDeleteExisting={onDeleteExistingBaElevatorPhoto}
          onReplaceExisting={onReplaceExistingBaElevatorPhoto}
          onChangeNewPhotos={onChangeNewBaElevatorPhotos}
        />
      )}
    </SectionRoot>
  );
}

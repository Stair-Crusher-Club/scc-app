import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import ImageFile from '@/models/ImageFile';

import OptionsV2 from '../../PlaceFormV2Screen/components/OptionsV2';
import PhotoEditSlots from './PhotoEditSlots';

type PhotoIssueType = 'wrong_place' | 'bad_photo' | 'outdated' | 'swapped';

const PHOTO_ISSUE_OPTIONS = [
  {value: 'wrong_place' as PhotoIssueType, label: '다른 장소/건물 사진'},
  {value: 'bad_photo' as PhotoIssueType, label: '잘못 찍힌 사진'},
  {value: 'outdated' as PhotoIssueType, label: '오래된 사진'},
  {value: 'swapped' as PhotoIssueType, label: '사진 뒤바뀜'},
];

interface PhotoCorrectionSectionProps {
  entranceImageUrls: string[];
  elevatorImageUrls: string[];
  photoIssueType?: PhotoIssueType;
  newEntrancePhotos: ImageFile[];
  newElevatorPhotos: ImageFile[];
  deletedEntrancePhotoIndices: number[];
  deletedElevatorPhotoIndices: number[];
  replacedEntrancePhotos: Map<number, ImageFile>;
  replacedElevatorPhotos: Map<number, ImageFile>;
  onChangePhotoIssueType: (type: PhotoIssueType) => void;
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
  photoIssueType,
  newEntrancePhotos,
  newElevatorPhotos,
  deletedEntrancePhotoIndices,
  deletedElevatorPhotoIndices,
  replacedEntrancePhotos,
  replacedElevatorPhotos,
  onChangePhotoIssueType,
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

      <SubLabel>무엇이 문제인가요?</SubLabel>
      <OptionsV2
        options={PHOTO_ISSUE_OPTIONS}
        value={photoIssueType}
        columns={1}
        onSelect={onChangePhotoIssueType}
      />

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

const SubLabel = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardMedium};
  color: ${color.gray60};
  margin-bottom: 8px;
`;

const PhotoSectionLabel = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardBold};
  color: ${color.gray70};
  margin-top: 16px;
  margin-bottom: 8px;
`;

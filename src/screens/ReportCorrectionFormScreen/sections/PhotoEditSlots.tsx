import React from 'react';
import styled from 'styled-components/native';

import CameraIcon from '@/assets/icon/ic_camera2.svg';
import SccRemoteImage from '@/components/SccRemoteImage';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import ImageFile from '@/models/ImageFile';
import useNavigation from '@/navigation/useNavigation';
import ImageFileUtils from '@/utils/ImageFileUtils';

interface PhotoEditSlotsProps {
  /** 섹션 타이틀 (존댓말, 예: "매장 입구 사진을 확인해주세요") */
  title?: string;
  /** 타이틀 아래 보조 설명 (예: "최대 3장까지 등록 가능해요") */
  description?: string;
  /** 기존 원격 사진 URL */
  existingPhotoUrls: string[];
  /** 교체된 기존 사진 (원본 인덱스 -> 새 사진) */
  replacedPhotos: Map<number, ImageFile>;
  /** 새로 촬영한 사진 */
  newPhotos: ImageFile[];
  /** 삭제된 기존 사진 URL 인덱스 목록 */
  deletedExistingIndices: number[];
  maxPhotos: number;
  onDeleteExisting: (index: number) => void;
  onReplaceExisting: (index: number, photo: ImageFile) => void;
  onChangeNewPhotos: (photos: ImageFile[]) => void;
}

/**
 * 기존 사진(URL) + 새 사진(ImageFile) 통합 편집 UI.
 * - 기존 사진: SccRemoteImage로 표시 + 교체/삭제 버튼
 * - 교체된 사진: 새 사진 썸네일 + "교체됨" 배지 + 교체/삭제 버튼
 * - 새 사진: 썸네일 + 삭제 버튼
 * - 빈 슬롯: 카메라 버튼으로 사진 추가
 * - 최대 maxPhotos장
 */
export default function PhotoEditSlots({
  title,
  description,
  existingPhotoUrls,
  replacedPhotos,
  newPhotos,
  deletedExistingIndices,
  maxPhotos,
  onDeleteExisting,
  onReplaceExisting,
  onChangeNewPhotos,
}: PhotoEditSlotsProps) {
  const navigation = useNavigation();

  const activeExistingPhotos = existingPhotoUrls
    .map((url, index) => ({url, index}))
    .filter(item => !deletedExistingIndices.includes(item.index));

  const totalPhotos = activeExistingPhotos.length + newPhotos.length;
  const canAddMore = totalPhotos < maxPhotos;

  const takePhoto = () => {
    navigation.navigate('Camera', {
      takenPhotos: newPhotos,
      maxPhotos: Math.max(1, maxPhotos - activeExistingPhotos.length),
      onPhotosTaken: onChangeNewPhotos,
      target: 'place',
    });
  };

  const replacePhoto = (originalIndex: number) => {
    navigation.navigate('Camera', {
      takenPhotos: [],
      maxPhotos: 1,
      onPhotosTaken: (photos: ImageFile[]) => {
        if (photos.length > 0) {
          onReplaceExisting(originalIndex, photos[0]);
        }
      },
      target: 'place',
    });
  };

  const deleteNewPhoto = (photo: ImageFile) => {
    onChangeNewPhotos(newPhotos.filter(p => p.uri !== photo.uri));
  };

  const viewExistingPhoto = (urls: string[], index: number) => {
    navigation.navigate('ImageZoomViewer', {
      imageUrls: urls,
      index,
    });
  };

  const viewNewPhoto = (index: number) => {
    const imageUrls = newPhotos.map(p =>
      ImageFileUtils.filepathFromImageFile(p),
    );
    navigation.navigate('ImageZoomViewer', {
      imageUrls,
      index,
    });
  };

  // 표시할 슬롯 수 계산: 카메라 + 기존 + 새 사진, 총 3 슬롯 채우기
  const slotsUsed =
    (canAddMore ? 1 : 0) + activeExistingPhotos.length + newPhotos.length;
  const emptySlotsNeeded = Math.max(0, 3 - slotsUsed);

  return (
    <Container>
      {title !== undefined && (
        <HeaderGroup>
          <Title>{title}</Title>
          {description !== undefined && (
            <DescriptionText>{description}</DescriptionText>
          )}
        </HeaderGroup>
      )}
      <SlotsRow>
        {/* 기존 사진 (교체된 사진 포함) */}
        {activeExistingPhotos.map((item, displayIndex) => {
          const replacedPhoto = replacedPhotos.get(item.index);
          return (
            <Slot key={`existing-${item.index}`}>
              <ThumbnailButton
                elementName="photo_edit_existing_thumbnail"
                onPress={() => {
                  if (replacedPhoto) {
                    navigation.navigate('ImageZoomViewer', {
                      imageUrls: [
                        ImageFileUtils.filepathFromImageFile(replacedPhoto),
                      ],
                      index: 0,
                    });
                  } else {
                    viewExistingPhoto(
                      activeExistingPhotos.map(p => p.url),
                      displayIndex,
                    );
                  }
                }}>
                <ThumbnailWrapper>
                  {replacedPhoto ? (
                    <ThumbnailImage
                      source={{
                        uri: ImageFileUtils.filepathFromImageFile(
                          replacedPhoto,
                        ),
                      }}
                    />
                  ) : (
                    <SccRemoteImage
                      imageUrl={item.url}
                      style={{flex: 1}}
                      resizeMode="cover"
                    />
                  )}
                </ThumbnailWrapper>
                {replacedPhoto && (
                  <ReplacedBadge>
                    <ReplacedBadgeText>교체됨</ReplacedBadgeText>
                  </ReplacedBadge>
                )}
              </ThumbnailButton>
              <ActionButtonsRow>
                <ActionButton
                  elementName="photo_edit_replace_existing"
                  onPress={() => replacePhoto(item.index)}>
                  <ActionButtonText>교체</ActionButtonText>
                </ActionButton>
                <ActionButton
                  elementName="photo_edit_delete_existing"
                  onPress={() => onDeleteExisting(item.index)}>
                  <ActionButtonText>삭제</ActionButtonText>
                </ActionButton>
              </ActionButtonsRow>
            </Slot>
          );
        })}

        {/* 새 사진 */}
        {newPhotos.map((photo, index) => (
          <Slot key={`new-${photo.uri}`}>
            <ThumbnailButton
              elementName="photo_edit_new_thumbnail"
              onPress={() => viewNewPhoto(index)}>
              <ThumbnailWrapper>
                <ThumbnailImage
                  source={{uri: ImageFileUtils.filepathFromImageFile(photo)}}
                />
              </ThumbnailWrapper>
            </ThumbnailButton>
            <ActionButtonsRow>
              <ActionButton
                elementName="photo_edit_delete_new"
                onPress={() => deleteNewPhoto(photo)}>
                <ActionButtonText>삭제</ActionButtonText>
              </ActionButton>
            </ActionButtonsRow>
          </Slot>
        ))}

        {/* 카메라 버튼 */}
        {canAddMore && (
          <Slot>
            <CameraButton
              elementName="photo_edit_camera_button"
              onPress={takePhoto}>
              <CameraIcon width={36} height={36} />
              <CameraButtonText>사진 추가</CameraButtonText>
            </CameraButton>
          </Slot>
        )}

        {/* 빈 공간 채우기 */}
        {Array.from({length: emptySlotsNeeded}).map((_, i) => (
          <Slot key={`empty-${i}`} />
        ))}
      </SlotsRow>
    </Container>
  );
}

// Styled components
const Container = styled.View`
  gap: 16px;
`;

const HeaderGroup = styled.View`
  gap: 2px;
`;

const Title = styled.Text`
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  font-family: ${font.pretendardSemibold};
  color: ${color.gray80v2};
`;

const DescriptionText = styled.Text`
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray45};
`;

const SlotsRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  gap: 10px;
`;

const Slot = styled.View`
  flex: 1;
`;

const CameraButton = styled(SccPressable)`
  aspect-ratio: 1;
  border-color: ${color.gray15};
  background-color: ${color.gray15};
  border-width: 1px;
  border-radius: 14px;
  justify-content: center;
  align-items: center;
`;

const CameraButtonText = styled.Text`
  color: ${color.gray40};
  font-size: 12px;
  font-family: ${font.pretendardRegular};
  margin-top: 4px;
`;

const ThumbnailButton = styled(SccPressable)`
  aspect-ratio: 1;
`;

const ThumbnailWrapper = styled.View`
  flex: 1;
  overflow: hidden;
  border-radius: 14px;
`;

const ThumbnailImage = styled.Image`
  background-color: ${color.gray20};
  flex: 1;
`;

const ReplacedBadge = styled.View`
  position: absolute;
  bottom: 4px;
  left: 4px;
  background-color: ${color.brandColor};
  border-radius: 4px;
  padding: 2px 6px;
`;

const ReplacedBadgeText = styled.Text`
  font-size: 10px;
  font-family: ${font.pretendardMedium};
  color: white;
`;

const ActionButtonsRow = styled.View`
  flex-direction: row;
  justify-content: center;
  gap: 8px;
  margin-top: 6px;
`;

const ActionButton = styled(SccPressable)`
  padding: 4px 8px;
`;

const ActionButtonText = styled.Text`
  font-size: 12px;
  font-family: ${font.pretendardMedium};
  color: ${color.gray50};
`;

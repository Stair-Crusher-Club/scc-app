import React from 'react';

import ImageFile from '@/models/ImageFile';
import useNavigation from '@/navigation/useNavigation';
import ImageFileUtils from '@/utils/ImageFileUtils';

import CameraIcon from '../../assets/icon/ic_camera.svg';
import CircleCloseIcon from '../../assets/icon/ic_circle_close.svg';
import * as S from './Photos.style';

interface Props {
  value: ImageFile[];
  maxPhotos: number;
  target: 'place' | 'review' | 'toilet' | 'building';
  onChange: (photos: ImageFile[]) => void;
}
export default function Photos({value, maxPhotos, target, onChange}: Props) {
  const navigation = useNavigation();

  const takePhoto = () => {
    navigation.navigate('Camera', {
      takenPhotos: value,
      onPhotosTaken: onChange,
      target,
    });
  };

  const deletePhoto = (photo: ImageFile) => {
    const newPhotos = value.filter(p => p.uri !== photo.uri);
    onChange(newPhotos);
  };

  const hasPhotos = value.length > 0;

  return (
    <S.Photos>
      {/* 3장 미만인 경우, 카메라 버튼 + 사진 1~2장 */}
      {hasPhotos && value.length < maxPhotos && (
        <S.Photo>
          <S.SmallCameraButton
            elementName="photo_small_camera_button"
            onPress={takePhoto}>
            <CameraIcon width={36} height={36} />
          </S.SmallCameraButton>
        </S.Photo>
      )}
      {/* 1~3장의 사진 */}
      {value.slice(0, 3).map(photo => (
        <S.Photo key={photo.uri}>
          <S.Thumbnail>
            <S.ThumbnailImage
              source={{uri: ImageFileUtils.filepathFromImageFile(photo)}}
            />
          </S.Thumbnail>
          <S.DeleteButton
            elementName="photo_delete_button"
            onPress={() => deletePhoto(photo)}>
            <CircleCloseIcon width={24} height={24} />
          </S.DeleteButton>
        </S.Photo>
      ))}
      {/* 카메라 + 1장 => 빈 공간 채우기 */}
      {value.length === 1 && <S.Photo />}
      {/* 사진 0장 => 카메라 버튼 풀로 채우기 */}
      {!hasPhotos && (
        <S.TakePhoto>
          <S.TakePhotoButton
            elementName="photo_take_button"
            onPress={takePhoto}>
            <CameraIcon width={28} height={28} />
            <S.TakePhotoText>사진 촬영하기</S.TakePhotoText>
          </S.TakePhotoButton>
        </S.TakePhoto>
      )}
    </S.Photos>
  );
}

import React from 'react';
import {Image, Text, View} from 'react-native';

import CameraIcon from '@/assets/icon/ic_camera2.svg';
import CircleCloseIcon from '@/assets/icon/ic_circle_close.svg';
import {SccPressable} from '@/components/SccPressable';
import ImageFile from '@/models/ImageFile';
import useNavigation from '@/navigation/useNavigation';
import ImageFileUtils from '@/utils/ImageFileUtils';

interface Props {
  value: ImageFile[];
  maxPhotos: number;
  target: 'place' | 'review' | 'toilet' | 'building';
  onChange: (photos: ImageFile[]) => void;
}
export default function PhotosV2({value, maxPhotos, target, onChange}: Props) {
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

  const viewPhoto = (index: number) => {
    const imageUrls = value.map(p => ImageFileUtils.filepathFromImageFile(p));
    navigation.navigate('ImageZoomViewer', {
      imageUrls,
      index,
    });
  };

  const hasPhotos = value.length > 0;

  return (
    <View className="flex-row justify-between gap-[10px]">
      {/* 3장 미만인 경우, 카메라 버튼 + 사진 1~2장 */}
      {value.length < maxPhotos && (
        <View className="flex-1 aspect-square">
          <SccPressable
            className="flex-1 border border-gray-15 rounded-[14px] justify-center items-center bg-gray-15"
            elementName="photo_small_camera_button"
            onPress={takePhoto}>
            <CameraIcon width={36} height={36} />
            <Text className="font-pretendard-regular text-gray-40 mt-[4px] text-[12px]">
              사진 촬영하기
            </Text>
          </SccPressable>
        </View>
      )}
      {/* 1~3장의 사진 */}
      {value.slice(0, 3).map((photo, index) => (
        <View key={photo.uri} className="flex-1 aspect-square">
          <SccPressable
            className="flex-1"
            elementName="photo_thumbnail"
            onPress={() => viewPhoto(index)}>
            <View className="flex-1 overflow-hidden rounded-[14px]">
              <Image
                className="flex-1 bg-gray-20"
                source={{uri: ImageFileUtils.filepathFromImageFile(photo)}}
              />
            </View>
          </SccPressable>
          <SccPressable
            className="absolute -top-[4px] -right-[4px]"
            elementName="photo_delete_button"
            onPress={() => deletePhoto(photo)}>
            <CircleCloseIcon width={24} height={24} />
          </SccPressable>
        </View>
      ))}
      {/* 사진 0장 => 빈 공간 채우기 */}
      {!hasPhotos && (
        <>
          <View className="flex-1 aspect-square" />
          <View className="flex-1 aspect-square" />
        </>
      )}
      {/* 카메라 + 1장 => 빈 공간 채우기 */}
      {value.length === 1 && <View className="flex-1 aspect-square" />}
    </View>
  );
}

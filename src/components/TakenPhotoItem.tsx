import React from 'react';
import {Image, Pressable, View, ViewStyle} from 'react-native';

import {color} from '@/constant/color';
import ImageFile from '@/models/ImageFile';
import ImageFileUtils from '@/utils/ImageFileUtils';

import CircleCloseIcon from '../assets/icon/ic_circle_close.svg';

interface TakenPhotoItemProps {
  width?: ViewStyle['width'];
  height?: ViewStyle['height'];
  photo: ImageFile;
  imageBorderRadius?: ViewStyle['borderRadius'];
  onPressX: ((photo: ImageFile) => void) | undefined;
}

const TakenPhotoItem = ({
  width,
  height,
  photo,
  imageBorderRadius,
  onPressX,
}: TakenPhotoItemProps) => {
  let containerStyle;
  if (width && height) {
    containerStyle = {
      width: width,
      height: height,
    };
  } else {
    containerStyle = {
      flex: 1,
      aspectRatio: 1,
    };
  }

  return (
    <View style={containerStyle}>
      <View
        style={{flex: 1, overflow: 'hidden', borderRadius: imageBorderRadius}}>
        <Image
          source={{
            uri: ImageFileUtils.filepathFromImageFile(photo),
          }}
          style={{backgroundColor: color.gray20, flex: 1}}
        />
      </View>
      <Pressable
        style={{position: 'absolute', top: -6, right: -6}}
        onPress={() => {
          if (onPressX) {
            onPressX(photo);
          }
        }}>
        <CircleCloseIcon width={24} height={24} />
      </Pressable>
    </View>
  );
};

export default TakenPhotoItem;

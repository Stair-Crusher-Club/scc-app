import {useBackHandler} from '@react-native-community/hooks';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Pressable, Text} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import {IImageInfo} from 'react-native-image-zoom-viewer/built/image-viewer.type';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import LeftArrowIcon from '@/assets/icon/ic_arrow_left.svg';
import {color} from '@/constant/color';
import {ScreenProps} from '@/navigation/Navigation.screens';

export type ImageZoomViewerScreenParams = {
  imageUrls: string[];
  index?: number;
};

const ImageZoomViewerScreen = ({route}: ScreenProps<'ImageZoomViewer'>) => {
  const navigation = useNavigation();
  const safeAreaInsets = useSafeAreaInsets();
  const {imageUrls, index = 0} = route.params as ImageZoomViewerScreenParams;

  useBackHandler(() => {
    navigation.goBack();
    return true;
  });

  return (
    <>
      <Pressable
        style={{
          marginTop: safeAreaInsets.top,
          position: 'absolute',
          top: 14,
          left: 20,
          zIndex: 999,
        }}
        onPress={() => navigation.goBack()}>
        <LeftArrowIcon width={24} height={24} color={color.white} />
      </Pressable>

      <ImageViewer
        index={index}
        renderIndicator={(idx, all) => {
          return (
            <Text
              style={{
                position: 'absolute',
                bottom: safeAreaInsets.bottom,
                width: '100%',
                textAlign: 'center',
                color: 'white',
                fontSize: 14,
                lineHeight: 16,
              }}>
              {`${idx} / ${all}`}
            </Text>
          );
        }}
        imageUrls={imageUrls.map((url: string) => {
          return {url} as IImageInfo;
        })}
      />
    </>
  );
};

export default ImageZoomViewerScreen;

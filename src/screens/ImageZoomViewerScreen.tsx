import {useBackHandler} from '@react-native-community/hooks';
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {Image, Text, View} from 'react-native';

import {SccPressable} from '@/components/SccPressable';
import ImageViewer from 'react-native-image-zoom-viewer';
import {IImageInfo} from 'react-native-image-zoom-viewer/built/image-viewer.type';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import LeftArrowIcon from '@/assets/icon/ic_arrow_left.svg';
import {color} from '@/constant/color';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {
  ImageType,
  SlideText,
} from './PlaceDetailScreen/sections/PlaceDetailCoverImage.style';

export type ImageZoomViewerScreenParams = {
  imageUrls: string[];
  index?: number;
  types?: string[];
};

const ImageZoomViewerScreen = ({route}: ScreenProps<'ImageZoomViewer'>) => {
  const navigation = useNavigation();
  const safeAreaInsets = useSafeAreaInsets();
  const {
    imageUrls,
    index = 0,
    types = [],
  } = route.params as ImageZoomViewerScreenParams;
  const [currentIndex, setCurrentIndex] = useState(index);

  useBackHandler(() => {
    navigation.goBack();
    return true;
  });

  return (
    <>
      <SccPressable
        elementName="image_zoom_viewer_back_button"
        style={{
          marginTop: safeAreaInsets.top,
          position: 'absolute',
          top: 14,
          left: 20,
          zIndex: 999,
        }}
        onPress={() => navigation.goBack()}>
        <LeftArrowIcon width={24} height={24} color={color.white} />
      </SccPressable>

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
        onChange={i => setCurrentIndex(Number(i))}
        imageUrls={imageUrls.map((url: string) => {
          return {url} as IImageInfo;
        })}
        renderImage={props => (
          <View>
            <Image {...props} />
            {types.length > 0 && (
              <ImageType>
                <SlideText>{types[currentIndex]}</SlideText>
              </ImageType>
            )}
          </View>
        )}
      />
    </>
  );
};

export default ImageZoomViewerScreen;

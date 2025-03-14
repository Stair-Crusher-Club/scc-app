import React from 'react';
import {Modal, Pressable, Text} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import {IImageInfo} from 'react-native-image-zoom-viewer/built/image-viewer.type';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import LeftArrowIcon from '@/assets/icon/ic_arrow_left.svg';
import {color} from '@/constant/color';

interface PlaceDetailImageZoomViewerProps {
  isVisible: boolean;
  imageUrls: string[];
  index?: number;
  onPressCloseButton: () => void;
}

const PlaceDetailImageZoomViewer = ({
  isVisible,
  imageUrls,
  index,
  onPressCloseButton,
}: PlaceDetailImageZoomViewerProps) => {
  const safeAreaInsets = useSafeAreaInsets();
  return (
    <Modal visible={isVisible} animationType={'fade'}>
      <Pressable
        style={{
          marginTop: safeAreaInsets.top,
          position: 'absolute',
          top: 14,
          left: 20,
          zIndex: 999,
        }}
        onPress={onPressCloseButton}>
        <LeftArrowIcon width={24} height={24} color={color.white} />
      </Pressable>

      <ImageViewer
        index={index || 0}
        swipeDownThreshold={40}
        enableSwipeDown
        onSwipeDown={onPressCloseButton}
        /** 다이내믹아일랜드 처리가 제대로 안 되어있고 라이브러리는 deprecated라 대체 */
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
        imageUrls={imageUrls.map(url => {
          return {url} as IImageInfo;
        })}
      />
    </Modal>
  );
};

export default PlaceDetailImageZoomViewer;

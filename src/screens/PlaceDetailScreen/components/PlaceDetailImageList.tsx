import React, {useRef, useState} from 'react';
import {Image} from 'react-native';
import styled from 'styled-components/native';

import DefaultImg from '@/assets/img/default_img.svg';
import {color} from '@/constant/color.ts';
import {font} from '@/constant/font.ts';
import {ImageDto} from '@/generated-sources/openapi';
import {LogClick} from '@/logging/LogClick';

import PlaceDetailImageZoomViewer from '../modals/PlaceDetailImageZoomViewer';

interface Props {
  images: ImageDto[];
}

export default function ImageList({images}: Props) {
  const initialFocusedIndex = useRef(0); // 이미지 상세 들어갈 때 어떤 이미지를 보여줄지
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const hiddenImages = images.slice(3);

  function onPressImage(index: number) {
    initialFocusedIndex.current = index;
    setImageModalVisible(true);
  }

  return (
    <ImageListView>
      <LogClick
        elementName="place_detail_image"
        params={{image_index: '0', image_url: images[0]?.imageUrl}}>
        <ImageBox image={images[0]} onPress={() => onPressImage(0)} />
      </LogClick>
      <LogClick
        elementName="place_detail_image"
        params={{image_index: '1', image_url: images[1]?.imageUrl}}>
        <ImageBox image={images[1]} onPress={() => onPressImage(1)} />
      </LogClick>
      <LogClick
        elementName="place_detail_image"
        params={{image_index: '2', image_url: images[2]?.imageUrl}}>
        <ImageBox
          image={images[2]}
          hiddenImageLength={hiddenImages.length}
          onPress={() => onPressImage(2)}
        />
      </LogClick>
      <PlaceDetailImageZoomViewer
        index={initialFocusedIndex.current}
        isVisible={isImageModalVisible}
        imageUrls={images.map(image => image.imageUrl)}
        onPressCloseButton={() => setImageModalVisible(false)}
      />
    </ImageListView>
  );
}

interface ImageBoxProps {
  image?: ImageDto;
  hiddenImageLength?: number;
  onPress?: () => void;
}

function ImageBox({image, hiddenImageLength = 0, onPress}: ImageBoxProps) {
  if (!image) {
    return (
      <Placeholder>
        <DefaultImg />
      </Placeholder>
    );
  }
  const url = image.thumbnailUrl || image.imageUrl;
  return (
    <ImageContainer onPress={onPress}>
      <Image
        resizeMethod="resize"
        resizeMode="cover"
        source={{uri: url}}
        style={{width: '100%', aspectRatio: 1}}
      />
      {hiddenImageLength > 0 && (
        // 화면 너비에 담기지 않는 이미지들 처리, + N 표시하기
        <MoreImage>
          <MoreImageCount>+ {hiddenImageLength}</MoreImageCount>
        </MoreImage>
      )}
    </ImageContainer>
  );
}

const ImageListView = styled.View`
  flex-direction: row;
  flex-shrink: 2;
  overflow: hidden;
  gap: 4px;
  width: 100%;
`;

const Placeholder = styled.View`
  flex: 0 0 33.333%;
  justify-content: center;
  align-items: center;
  background-color: #eaeaef;
`;

const ImageContainer = styled.Pressable`
  flex: 0 0 33.333%;
  position: relative;
`;

const MoreImage = styled.View`
  justify-content: center;
  align-items: center;
  background-color: ${color.blacka60};
`;

const MoreImageCount = styled.Text`
  color: ${color.white};
  font-size: 20px;
  font-family: ${font.pretendardBold};
`;

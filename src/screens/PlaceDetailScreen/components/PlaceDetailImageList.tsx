import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useRef} from 'react';
import {Image} from 'react-native';
import styled, {css} from 'styled-components/native';

import DefaultImg from '@/assets/img/default_img.svg';
import {color} from '@/constant/color.ts';
import {font} from '@/constant/font.ts';
import {ImageDto} from '@/generated-sources/openapi';
import {LogClick} from '@/logging/LogClick';
import {ScreenParams} from '@/navigation/Navigation.screens';

interface Props {
  images: ImageDto[];
  roundCorners?: boolean;
}

export default function ImageList({images, roundCorners}: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<ScreenParams>>();
  const initialFocusedIndex = useRef(0); // 이미지 상세 들어갈 때 어떤 이미지를 보여줄지
  const hiddenImages = images.slice(3);

  function onPressImage(index: number) {
    initialFocusedIndex.current = index;
    navigation.navigate('ImageZoomViewer', {
      imageUrls: images.map(image => image.imageUrl),
      index: index,
    });
  }

  return (
    <ImageListView roundCorners={roundCorners}>
      <LogClick
        elementName="place_detail_image"
        params={{
          image_index: '0',
          image_url: images[0]?.thumbnailUrl ?? images[0]?.imageUrl,
        }}>
        <ImageBox image={images[0]} onPress={() => onPressImage(0)} />
      </LogClick>
      <LogClick
        elementName="place_detail_image"
        params={{
          image_index: '1',
          image_url: images[1]?.thumbnailUrl ?? images[1]?.imageUrl,
        }}>
        <ImageBox image={images[1]} onPress={() => onPressImage(1)} />
      </LogClick>
      <LogClick
        elementName="place_detail_image"
        params={{
          image_index: '2',
          image_url: images[2]?.thumbnailUrl ?? images[2]?.imageUrl,
        }}>
        <ImageBox
          image={images[2]}
          hiddenImageLength={hiddenImages.length}
          onPress={() => onPressImage(2)}
        />
      </LogClick>
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

const ImageListView = styled.View<{roundCorners?: boolean}>`
  flex-direction: row;
  flex-shrink: 2;
  overflow: hidden;
  gap: 4px;
  width: 100%;
  ${({roundCorners}) =>
    roundCorners &&
    css`
      border-radius: 12px;
    `}
`;

const Placeholder = styled.View`
  flex: 0 0 33.333%;
  justify-content: center;
  align-items: center;
  background-color: ${color.gray10};
`;

const ImageContainer = styled.Pressable`
  flex: 0 0 33.333%;
  position: relative;
`;

const MoreImage = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  justify-content: center;
  align-items: center;
  background-color: ${color.blacka70};
  height: 20px;
`;

const MoreImageCount = styled.Text`
  color: ${color.white};
  font-size: 12px;
  line-height: 14px;
  font-family: ${font.pretendardBold};
`;

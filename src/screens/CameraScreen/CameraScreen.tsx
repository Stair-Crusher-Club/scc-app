import ImageEditor from '@react-native-community/image-editor';
import {useAtomValue} from 'jotai';
import React, {useEffect, useState} from 'react';
import {Dimensions} from 'react-native';
import {CameraCaptureError, PhotoFile} from 'react-native-vision-camera';
import DraggableFlatList from 'react-native-draggable-flatlist';

import CircleCloseIcon from '@/assets/icon/ic_circle_close.svg';
import CircleInfoIcon from '@/assets/icon/ic_circle_info.svg';
import FlashIcon from '@/assets/icon/ic_flash.svg';
import {
  hasShownGuideForEntrancePhotoAtom,
  hasShownGuideForToiletPhotoAtom,
  hasShownGuideForReviewPhotoAtom,
} from '@/atoms/User';
import {ScreenLayout} from '@/components/ScreenLayout';
import {color} from '@/constant/color';
import {MAX_NUMBER_OF_TAKEN_PHOTOS} from '@/constant/constant';
import Logger from '@/logging/Logger';
import ImageFile from '@/models/ImageFile';
import {ScreenProps} from '@/navigation/Navigation.screens';
import ImageFileUtils from '@/utils/ImageFileUtils';
import ToastUtils from '@/utils/ToastUtils';

import CameraDeviceSelect from './CameraDeviceSelect';
import CameraNotAuthorized from './CameraNotAuthorized';
import CameraPreview from './CameraPreview';
import * as S from './CameraScreen.style';
import useCamera from './useCamera';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

export interface CameraScreenParams {
  takenPhotos: ImageFile[];
  onPhotosTaken(photos: ImageFile[]): void;
  target: 'place' | 'review' | 'toilet' | 'building';
}

export default function CameraScreen({
  route,
  navigation,
}: ScreenProps<'Camera'>) {
  const initialFocusedIndex = React.useRef(0);
  const windowHeight = Dimensions.get('window').height;
  const cameraMaxHeight = windowHeight > 0 ? windowHeight / 2 : 360;
  const {camera, hasPermission, device, setDevice} = useCamera();
  const [photoFiles, setPhotoFiles] = useState<ImageFile[]>([]);
  const [flash, setFlash] = useState<'on' | 'off'>('off');
  const hasShownGuideForEnterancePhoto = useAtomValue(
    hasShownGuideForEntrancePhotoAtom,
  );
  const hasShownGuideForReviewPhoto = useAtomValue(
    hasShownGuideForReviewPhotoAtom,
  );
  const hasShownGuideForToiletPhoto = useAtomValue(
    hasShownGuideForToiletPhotoAtom,
  );
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);

  // 기존 촬영한 이미지 체크
  useEffect(() => {
    if (route.params && route.params.takenPhotos) {
      setPhotoFiles(route.params.takenPhotos);
    }
  }, [route.params]);

  useEffect(() => {
    if (route.params.target === 'place' && !hasShownGuideForEnterancePhoto) {
      openGuide('place');
    } else if (
      route.params.target === 'review' &&
      !hasShownGuideForReviewPhoto
    ) {
      openGuide('review');
    } else if (
      route.params.target === 'toilet' &&
      !hasShownGuideForToiletPhoto
    ) {
      openGuide('toilet');
    }
  }, [
    route.params.target,
    hasShownGuideForEnterancePhoto,
    hasShownGuideForReviewPhoto,
    hasShownGuideForToiletPhoto,
  ]);

  function openGuide(target: 'place' | 'review' | 'toilet') {
    navigation.push('PlacePhotoGuide', {target: target});
  }

  function goBack() {
    navigation.goBack();
  }

  function confirm() {
    if (isTakingPhoto) {
      return;
    }
    // TODO: navigation 에 non-serializable 값을 넘겨주면 안된다. (https://reactnavigation.org/docs/troubleshooting/#i-get-the-warning-non-serializable-values-were-found-in-the-navigation-state)
    if (route.params && route.params.onPhotosTaken) {
      route.params.onPhotosTaken(photoFiles);
    }
    navigation.goBack();
  }

  function onPressX(target: ImageFile) {
    setPhotoFiles(photos => photos.filter(p => p !== target));
  }

  function toggleFlash() {
    setFlash(f => (f === 'on' ? 'off' : 'on'));
  }

  function openPreview(index: number) {
    initialFocusedIndex.current = index;
    navigation.navigate('ImageZoomViewer', {
      imageUrls: photoFiles.map(file =>
        ImageFileUtils.filepathFromImageFile(file),
      ),
      index: index,
    });
  }

  // 사진 촬영에는 약간의 딜레이가 있으나, 로딩 레이어를 띄우지는 않는다.
  async function takePhoto() {
    try {
      setIsTakingPhoto(true);
      if (camera.current == null) {
        throw new Error('Camera ref is null!');
      }
      const taken = await camera.current.takePhoto({
        flash,
      });

      if (taken) {
        const {cropped, size} = await cropToRect(taken);
        setPhotoFiles(photos =>
          photos.concat({uri: cropped.uri, width: size, height: size}),
        );
      }
    } catch (error: any) {
      Logger.logError(error);
      if (error instanceof CameraCaptureError) {
        ToastUtils.show('사진 촬영을 실패했습니다. ' + error.cause?.message);
      } else {
        ToastUtils.show('사진 촬영을 실패했습니다. ' + error.message);
      }
    } finally {
      setIsTakingPhoto(false);
    }
  }

  const canTakeMore = photoFiles.length < MAX_NUMBER_OF_TAKEN_PHOTOS;

  return (
    <ScreenLayout
      isHeaderVisible={true}
      safeAreaEdges={['top', 'bottom']}
      style={{backgroundColor: color.gray90}}>
      <S.Header>
        <S.CancelButton onPress={goBack}>취소</S.CancelButton>
        <S.SubmitButton onPress={confirm} disabled={photoFiles.length === 0}>
          {`사진 등록 ${photoFiles.length > 0 ? `(${photoFiles.length})` : ''}`}
        </S.SubmitButton>
      </S.Header>
      <S.CameraContainer maxHeight={cameraMaxHeight}>
        {hasPermission && device ? (
          <S.CameraPreviewContainer>
            <CameraPreview ref={camera} device={device} />
            <CameraDeviceSelect device={device} onDeviceSelect={setDevice} />
          </S.CameraPreviewContainer>
        ) : (
          <CameraNotAuthorized />
        )}
      </S.CameraContainer>
      {route.params.target !== 'building' && (
        <S.TipsWrapper>
          <S.Tips
            onPress={() => {
              const target = route.params.target;
              if (
                target === 'place' ||
                target === 'review' ||
                target === 'toilet'
              ) {
                openGuide(target);
              }
            }}>
            <CircleInfoIcon />
            <S.Tip>{'사진 촬영 팁  >'}</S.Tip>
          </S.Tips>
        </S.TipsWrapper>
      )}
      <S.TakenPhotos>
        {photoFiles.length === 0 && (
          <S.NoPhotosTaken>최대 3장까지 촬영할 수 있어요</S.NoPhotosTaken>
        )}
        {photoFiles.length > 0 && (
          <GestureHandlerRootView>
            <DraggableFlatList
              horizontal
              contentContainerStyle={{
                justifyContent: 'center',
                overflow: 'visible',
                gap: 16,
                padding: 10,
                flexGrow: 1,
              }}
              data={photoFiles}
              onDragEnd={({data}) => setPhotoFiles(data)}
              keyExtractor={(item: ImageFile) => item.uri}
              renderItem={({item, drag, isActive}) => (
                <S.TakenPhotoItem
                  style={{
                    opacity: isActive ? 0.5 : 1,
                    transform: [{scale: isActive ? 1.05 : 1}],
                  }}
                  key={item.uri}
                  onLongPress={drag}
                  onPress={() => openPreview(photoFiles.indexOf(item))}>
                  <S.Thumbnail
                    source={{uri: ImageFileUtils.filepathFromImageFile(item)}}
                  />
                  <S.CloseButton onPress={() => onPressX(item)}>
                    <CircleCloseIcon width={24} height={24} />
                  </S.CloseButton>
                </S.TakenPhotoItem>
              )}
            />
          </GestureHandlerRootView>
        )}
      </S.TakenPhotos>
      <S.ActionsWrapper>
        <S.CaptureButton
          disabled={!canTakeMore || isTakingPhoto}
          onPress={takePhoto}>
          <S.CaptureInnerDeco />
        </S.CaptureButton>
        {device?.hasFlash && (
          <S.FlashButton onPress={toggleFlash}>
            <FlashIcon style={{opacity: flash === 'on' ? 1 : 0.3}} />
          </S.FlashButton>
        )}
      </S.ActionsWrapper>
    </ScreenLayout>
  );
}

async function cropToRect(taken: PhotoFile) {
  const size = Math.min(taken.width, taken.height);
  const offset = {
    x: Math.max(0, (taken.height - size) / 2),
    y: Math.max(0, (taken.width - size) / 2),
  };
  const cropped = await ImageEditor.cropImage(
    ImageFileUtils.filepath(taken.path),
    {
      offset: {x: offset.x, y: offset.y},
      size: {width: size, height: size},
    },
  );
  return {cropped, size};
}

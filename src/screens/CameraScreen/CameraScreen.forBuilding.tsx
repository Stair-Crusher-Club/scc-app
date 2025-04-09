import ImageEditor from '@react-native-community/image-editor';
import React, {useEffect, useState} from 'react';
import {Dimensions, Platform} from 'react-native';
import {DragSortableView} from 'react-native-drag-sort';
import {CameraCaptureError, PhotoFile} from 'react-native-vision-camera';

import {ScreenLayout} from '@/components/ScreenLayout';
import {color} from '@/constant/color';
import {MAX_NUMBER_OF_TAKEN_PHOTOS} from '@/constant/constant';
import Logger from '@/logging/Logger';
import ImageFile from '@/models/ImageFile';
import {ScreenProps} from '@/navigation/Navigation.screens';
import ImageFileUtils from '@/utils/ImageFileUtils';
import ToastUtils from '@/utils/ToastUtils';

import CircleCloseIcon from '../../assets/icon/ic_circle_close.svg';
import FlashIcon from '../../assets/icon/ic_flash.svg';
import PlaceDetailImageZoomViewer from '../PlaceDetailScreen/modals/PlaceDetailImageZoomViewer';
import CameraDeviceSelect from './CameraDeviceSelect';
import CameraNotAuthorized from './CameraNotAuthorized';
import CameraPreview from './CameraPreview';
import * as S from './CameraScreen.style';
import useCamera from './useCamera';

export interface CameraScreenParams {
  takenPhotos: ImageFile[];
  onPhotosTaken(photos: ImageFile[]): void;
}

export default function CameraScreen({
  route,
  navigation,
}: ScreenProps<'Camera/Building'>) {
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const initialFocusedIndex = React.useRef(0);
  const windowHeight = Dimensions.get('window').height;
  const cameraMaxHeight = windowHeight > 0 ? windowHeight / 2 : 360;
  const {camera, hasPermission, device, setDevice} = useCamera();
  const [photoFiles, setPhotoFiles] = useState<ImageFile[]>([]);
  const [flash, setFlash] = useState<'on' | 'off'>('off');

  // 기존 촬영한 이미지 체크
  useEffect(() => {
    if (route.params && route.params.takenPhotos) {
      setPhotoFiles(route.params.takenPhotos);
    }
  }, [route.params]);

  function goBack() {
    navigation.goBack();
  }

  function confirm() {
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
    setImageModalVisible(true);
  }

  // 사진 촬영에는 약간의 딜레이가 있으나, 로딩 레이어를 띄우지는 않는다.
  async function takePhoto() {
    try {
      if (camera.current == null) {
        throw new Error('Camera ref is null!');
      }
      const taken = await camera.current.takePhoto({
        flash,
      });

      if (taken) {
        const {cropped, size} = await cropToRect(taken);
        setPhotoFiles(photos =>
          photos.concat({uri: cropped, width: size, height: size}),
        );
      }
    } catch (error: any) {
      Logger.logError(error);
      if (error instanceof CameraCaptureError) {
        ToastUtils.show('사진 촬영을 실패했습니다. ' + error.cause?.message);
      } else {
        ToastUtils.show('사진 촬영을 실패했습니다. ' + error.message);
      }
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
      <S.TakenPhotos>
        {photoFiles.length === 0 && (
          <S.NoPhotosTaken>최대 3장까지 촬영할 수 있어요</S.NoPhotosTaken>
        )}
        {photoFiles.length > 0 && (
          <DragSortableView
            dataSource={photoFiles}
            keyExtractor={(item: ImageFile) => item.uri}
            parentWidth={216}
            childrenWidth={56}
            childrenHeight={56}
            marginChildrenLeft={8}
            marginChildrenRight={8}
            onClickItem={(_, __, index) => openPreview(index)}
            onDataChange={files => setPhotoFiles(files)}
            renderItem={(photo: ImageFile) => (
              <S.TakenPhotoItem key={photo.uri}>
                <S.Thumbnail
                  source={{
                    uri: ImageFileUtils.filepathFromImageFile(photo),
                  }}
                />
                <S.CloseButton onPress={() => onPressX(photo)}>
                  <CircleCloseIcon width={24} height={24} />
                </S.CloseButton>
              </S.TakenPhotoItem>
            )}
          />
        )}
      </S.TakenPhotos>
      <S.ActionsWrapper>
        <S.CaptureButton disabled={!canTakeMore} onPress={takePhoto}>
          <S.CaptureInnerDeco />
        </S.CaptureButton>
        {device?.hasFlash && (
          <S.FlashButton onPress={toggleFlash}>
            <FlashIcon style={{opacity: flash === 'on' ? 1 : 0.3}} />
          </S.FlashButton>
        )}
      </S.ActionsWrapper>
      <PlaceDetailImageZoomViewer
        index={initialFocusedIndex.current}
        isVisible={isImageModalVisible}
        imageUrls={photoFiles.map(file =>
          ImageFileUtils.filepathFromImageFile(file),
        )}
        onPressCloseButton={() => setImageModalVisible(false)}
      />
    </ScreenLayout>
  );
}

async function cropToRect(taken: PhotoFile) {
  const size = Math.min(taken.width, taken.height);
  const offset = {
    x: Math.max(0, (taken.width - size) / 2),
    y: Math.max(0, (taken.height - size) / 2),
  };
  const cropped = await ImageEditor.cropImage(
    ImageFileUtils.filepath(taken.path),
    // 안드로이드는 회전된 상태에서 crop
    // iOS 는 회전되지 않은 이미지에 crop 하기 때문에 offset 을 반대로 적용한다.
    {
      offset: Platform.OS === 'ios' ? {x: offset.y, y: offset.x} : offset,
      size: {width: size, height: size},
    },
  );
  return {cropped, size};
}

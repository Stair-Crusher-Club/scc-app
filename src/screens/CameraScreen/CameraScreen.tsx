import ImageEditor from '@react-native-community/image-editor';
import {useAtom, useAtomValue} from 'jotai';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Dimensions, Platform} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import {
  ImagePickerResponse,
  launchImageLibrary,
  MediaType,
} from 'react-native-image-picker';
import {CameraCaptureError, PhotoFile} from 'react-native-vision-camera';

import AlbumIcon from '@/assets/icon/ic_album.svg';
import GuideIcon from '@/assets/icon/ic_camera_guide.svg';
import StairsOverlayIcon from '@/assets/icon/ic_camera_overlay_stairs.svg';
import CircleCloseIcon from '@/assets/icon/ic_circle_close.svg';
import CircleInfoIcon from '@/assets/icon/ic_circle_info.svg';
import ClockIcon from '@/assets/icon/ic_clock.svg';
import FlashOffIcon from '@/assets/icon/ic_flash_off.svg';
import FlashOnIcon from '@/assets/icon/ic_flash_on.svg';
import {featureFlagAtom} from '@/atoms/Auth';
import {
  hasShownAlbumLockedTooltipAtom,
  hasShownCameraGuideTooltipAtom,
  hasShownGuideForEntrancePhotoAtom,
  hasShownGuideForReviewPhotoAtom,
  hasShownGuideForToiletPhotoAtom,
  isCameraGuideOverlayEnabledAtom,
  lastKnownAlbumUploadAllowedAtom,
} from '@/atoms/User';
import {ScreenLayout} from '@/components/ScreenLayout';
import Tooltip from '@/components/Tooltip';
import {color} from '@/constant/color';
import {MAX_NUMBER_OF_TAKEN_PHOTOS} from '@/constant/constant';
import Logger from '@/logging/Logger';
import ImageFile from '@/models/ImageFile';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {SccCameraButtons} from '@/native-modules/SccCameraButtons';
import EntrancePhotoGuideCarousel from '@/screens/PlacePhotoGuideScreen/EntrancePhotoGuideCarousel';
import HeatTelemetry from '@/utils/HeatTelemetry';
import ImageFileUtils from '@/utils/ImageFileUtils';
import ToastUtils from '@/utils/ToastUtils';
import {useBackHandler} from '@react-native-community/hooks';

import {GestureHandlerRootView} from 'react-native-gesture-handler';
import CameraDeviceSelect from './CameraDeviceSelect';
import CameraNotAuthorized from './CameraNotAuthorized';
import CameraPreview from './CameraPreview';
import * as S from './CameraScreen.style';
import useCamera from './useCamera';

export type CameraTarget =
  | 'placeEntrance'
  | 'buildingEntrance'
  | 'elevator'
  | 'review'
  | 'toilet';

/** 입구(장소/건물) 촬영인지 — 가이드 오버레이·예시 사진·툴팁 노출 분기의 기준. */
export function isEntranceTarget(target: CameraTarget): boolean {
  return target === 'placeEntrance' || target === 'buildingEntrance';
}

export interface CameraScreenParams {
  takenPhotos: ImageFile[];
  onPhotosTaken(photos: ImageFile[]): void;
  target: CameraTarget;
  /** 촬영/선택 가능한 최대 사진 수. 미지정 시 MAX_NUMBER_OF_TAKEN_PHOTOS 사용. */
  maxPhotos?: number;
}

type TimerSeconds = 0 | 3 | 5 | 10;

const ENTRANCE_PHOTO_SLOT_PLACEHOLDERS = [
  require('@/assets/img/photo_slot_door.png'),
  require('@/assets/img/photo_slot_stairs.png'),
  null, // 3번째 슬롯은 안내 일러스트 없이 빈 칸
];

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
  const flashRef = useRef(flash);
  flashRef.current = flash;
  const [timerSeconds, setTimerSeconds] = useState<TimerSeconds>(0);
  const [countdownDisplay, setCountdownDisplay] = useState<number | null>(null);
  const countdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [hasShownGuideForEnterancePhoto, setHasShownGuideForEnterancePhoto] =
    useAtom(hasShownGuideForEntrancePhotoAtom);
  const [isEntranceGuideVisible, setIsEntranceGuideVisible] = useState(false);
  const hasShownGuideForReviewPhoto = useAtomValue(
    hasShownGuideForReviewPhotoAtom,
  );
  const hasShownGuideForToiletPhoto = useAtomValue(
    hasShownGuideForToiletPhotoAtom,
  );
  const featureFlag = useAtomValue(featureFlagAtom);
  const isAlbumUploadAllowed = featureFlag?.isAlbumUploadAllowed ?? false;
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [isLoadingAlbum, setIsLoadingAlbum] = useState(false);
  const [isGuideOverlayEnabled, setIsGuideOverlayEnabled] = useAtom(
    isCameraGuideOverlayEnabledAtom,
  );
  const [lastKnownAlbumUploadAllowed, setLastKnownAlbumUploadAllowed] = useAtom(
    lastKnownAlbumUploadAllowedAtom,
  );
  const [hasShownAlbumLockedTooltip, setHasShownAlbumLockedTooltip] = useAtom(
    hasShownAlbumLockedTooltipAtom,
  );
  const [hasShownCameraGuideTooltip, setHasShownCameraGuideTooltip] = useAtom(
    hasShownCameraGuideTooltipAtom,
  );
  const [visibleTooltip, setVisibleTooltip] = useState<
    'albumLocked' | 'albumActivated' | 'guideIntro' | null
  >(null);
  const isEntrance = isEntranceTarget(route.params.target);

  // 기존 촬영한 이미지 체크
  useEffect(() => {
    if (route.params && route.params.takenPhotos) {
      setPhotoFiles(route.params.takenPhotos);
    }
  }, [route.params]);

  useEffect(() => {
    if (isEntrance && !hasShownGuideForEnterancePhoto) {
      setIsEntranceGuideVisible(true);
      setHasShownGuideForEnterancePhoto(true);
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
    isEntrance,
    route.params.target,
    hasShownGuideForEnterancePhoto,
    hasShownGuideForReviewPhoto,
    hasShownGuideForToiletPhoto,
  ]);

  // 안드로이드 백 버튼: 예시 사진 오버레이가 열려 있으면 카메라를 나가지 않고 오버레이만 닫는다.
  useBackHandler(() => {
    if (isEntranceGuideVisible) {
      setIsEntranceGuideVisible(false);
      return true;
    }
    return false;
  });

  // 앨범 활성화 안내 툴팁(1-5): 입구 촬영 최초 진입 시 1건만 판정한다.
  useEffect(() => {
    if (!isEntrance) {
      return;
    }
    const justActivated =
      lastKnownAlbumUploadAllowed === false && isAlbumUploadAllowed === true;

    if (!isAlbumUploadAllowed) {
      if (!hasShownAlbumLockedTooltip) {
        setVisibleTooltip('albumLocked');
        setHasShownAlbumLockedTooltip(true);
      }
    } else if (justActivated) {
      setVisibleTooltip('albumActivated');
    } else if (!hasShownCameraGuideTooltip) {
      setVisibleTooltip('guideIntro');
      setHasShownCameraGuideTooltip(true);
    }
    setLastKnownAlbumUploadAllowed(isAlbumUploadAllowed);
  }, [isEntrance]);

  useEffect(() => {
    if (visibleTooltip === null) {
      return;
    }
    const timeout = setTimeout(() => setVisibleTooltip(null), 5000);
    return () => clearTimeout(timeout);
  }, [visibleTooltip]);

  function openGuide(target: 'review' | 'toilet') {
    navigation.push('PlacePhotoGuide', {target: target});
  }

  function goBack() {
    navigation.goBack();
  }

  function confirm(_photoFiles: ImageFile[]) {
    if (isTakingPhoto) {
      return;
    }
    // TODO: navigation 에 non-serializable 값을 넘겨주면 안된다. (https://reactnavigation.org/docs/troubleshooting/#i-get-the-warning-non-serializable-values-were-found-in-the-navigation-state)
    if (route.params && route.params.onPhotosTaken) {
      route.params.onPhotosTaken(_photoFiles);
    }
    navigation.goBack();
  }

  function onPressX(target: ImageFile) {
    setPhotoFiles(photos => photos.filter(p => p !== target));
  }

  function toggleFlash() {
    setFlash(f => (f === 'on' ? 'off' : 'on'));
  }

  function cycleTimer() {
    setTimerSeconds(s => {
      switch (s) {
        case 0:
          return 3;
        case 3:
          return 5;
        case 5:
          return 10;
        case 10:
          return 0;
      }
    });
  }

  function cancelCountdown() {
    if (countdownTimeoutRef.current) {
      clearTimeout(countdownTimeoutRef.current);
      countdownTimeoutRef.current = null;
    }
    setCountdownDisplay(null);
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
        flash: flashRef.current,
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

  const photoLimit = route.params.maxPhotos ?? MAX_NUMBER_OF_TAKEN_PHOTOS;
  const canTakeMore = photoFiles.length < photoLimit;

  function startCountdown(remaining: number) {
    if (remaining <= 0) {
      setCountdownDisplay(null);
      countdownTimeoutRef.current = null;
      takePhoto();
      return;
    }
    setCountdownDisplay(remaining);
    countdownTimeoutRef.current = setTimeout(() => {
      startCountdown(remaining - 1);
    }, 1000);
  }

  const handleCapturePress = useCallback(() => {
    if (!canTakeMore || isTakingPhoto) {
      return;
    }
    if (countdownDisplay !== null) {
      cancelCountdown();
      return;
    }
    if (timerSeconds === 0) {
      takePhoto();
    } else {
      startCountdown(timerSeconds);
    }
  }, [canTakeMore, isTakingPhoto, countdownDisplay, timerSeconds]);

  const handleCapturePressRef = useRef(handleCapturePress);
  handleCapturePressRef.current = handleCapturePress;

  useEffect(() => {
    return () => {
      if (countdownTimeoutRef.current) {
        clearTimeout(countdownTimeoutRef.current);
        countdownTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    HeatTelemetry.start('camera_active');
    return () => HeatTelemetry.stop('camera_active');
  }, []);

  useEffect(() => {
    let lastTriggerTime = 0;
    let isMounted = true;

    SccCameraButtons.attach().catch(() => {
      // ignore — fallback path may not be available
    });

    const subscription = SccCameraButtons.addCapturePressListener(() => {
      if (!isMounted) {
        return;
      }
      // 빠른 연타 방어용 짧은 쿨다운. 네이티브 단에서 이미 정상화된
      // discrete press 이벤트지만 안전 마진으로 둔다.
      const now = Date.now();
      if (now - lastTriggerTime < 300) {
        return;
      }
      lastTriggerTime = now;
      handleCapturePressRef.current();
    });

    return () => {
      isMounted = false;
      subscription.remove();
      SccCameraButtons.detach().catch(() => {});
    };
  }, []);

  async function selectFromAlbum() {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      selectionLimit: photoLimit,
      // iOS에서 HEIC/HEIF를 JPEG로 변환해서 내려받는다.
      // iOS 26에서 HEIC 일부가 후속 압축/업로드 단계에서 실패하는 사례 회피.
      assetRepresentationMode: 'compatible' as const,
    };

    const loadingTimer = setTimeout(() => setIsLoadingAlbum(true), 1000);
    try {
      launchImageLibrary(options, (response: ImagePickerResponse) => {
        clearTimeout(loadingTimer);
        setIsLoadingAlbum(false);
        if (response.didCancel || response.errorMessage) {
          const errorMessage = `didCancel ${response.didCancel} / errorCode: ${response.errorCode} / errorMessage: ${response.errorMessage}`;
          Logger.logError(Error(errorMessage));
          return;
        }

        if (response.assets) {
          const newImages: ImageFile[] = response.assets.map(asset => ({
            uri: asset.uri || '',
            width: asset.width || 0,
            height: asset.height || 0,
          }));
          confirm(newImages);
        }
      });
    } catch (error: any) {
      clearTimeout(loadingTimer);
      setIsLoadingAlbum(false);
      Logger.logError(error);
    }
  }

  return (
    <ScreenLayout
      isHeaderVisible={true}
      safeAreaEdges={['top', 'bottom']}
      style={{backgroundColor: color.gray70v2}}>
      <S.Header>
        <S.CancelButton onPress={goBack}>취소</S.CancelButton>
        <S.SubmitButton
          onPress={() => confirm(photoFiles)}
          disabled={photoFiles.length === 0}>
          {`사진 등록${photoFiles.length > 0 ? `(${photoFiles.length})` : ''}`}
        </S.SubmitButton>
      </S.Header>
      <S.CameraContainer maxHeight={cameraMaxHeight}>
        {hasPermission && device ? (
          <S.CameraPreviewContainer>
            <CameraPreview ref={camera} device={device} />
            <CameraDeviceSelect device={device} onDeviceSelect={setDevice} />
            {isEntrance && isGuideOverlayEnabled && photoFiles.length === 0 && (
              <S.DoorFrameOverlay pointerEvents="none">
                <S.DoorFrameGroundLineLeft />
                <S.DoorFrameGroundLineRight />
                <S.DoorFrameRect />
                <S.OverlayCaption>
                  {'문을 프레임 안에\n맞춰주세요'}
                </S.OverlayCaption>
              </S.DoorFrameOverlay>
            )}
            {isEntrance && isGuideOverlayEnabled && photoFiles.length === 1 && (
              <S.StairsOverlay pointerEvents="none">
                <S.StairsOverlayCaption>
                  {
                    '계단/경사로의 높이를 확인할 수 있게\n약간 측면에서 촬영해주세요'
                  }
                </S.StairsOverlayCaption>
                <StairsOverlayIcon width={338} height={110} />
              </S.StairsOverlay>
            )}
            {countdownDisplay !== null && (
              <S.CountdownOverlay pointerEvents="none">
                <S.CountdownText>{countdownDisplay}</S.CountdownText>
              </S.CountdownOverlay>
            )}
          </S.CameraPreviewContainer>
        ) : (
          <CameraNotAuthorized />
        )}
        {isLoadingAlbum && (
          <S.AlbumLoadingOverlay>
            <ActivityIndicator size="large" color="white" />
            <S.AlbumLoadingText>
              {
                'iCloud 등 클라우드에 저장된 사진은\n불러오는 데 시간이 걸릴 수 있습니다'
              }
            </S.AlbumLoadingText>
          </S.AlbumLoadingOverlay>
        )}
      </S.CameraContainer>
      {route.params.target !== 'elevator' && (
        <S.TipsWrapper>
          <S.Tips
            elementName="camera_tips_button"
            onPress={() => {
              const target = route.params.target;
              if (isEntranceTarget(target)) {
                setIsEntranceGuideVisible(true);
              } else if (target === 'review' || target === 'toilet') {
                openGuide(target);
              }
            }}>
            <CircleInfoIcon />
            <S.Tip>{isEntrance ? '예시 사진 >' : '사진 촬영 팁  >'}</S.Tip>
          </S.Tips>
        </S.TipsWrapper>
      )}
      <S.TakenPhotosSection>
        <S.TakenPhotos>
          {photoFiles.length > 0 ? (
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
                    elementName="taken_photo_item"
                    style={{
                      opacity: isActive ? 0.5 : 1,
                      transform: [{scale: isActive ? 1.05 : 1}],
                    }}
                    key={item.uri}
                    onLongPress={drag}
                    onPress={() => openPreview(photoFiles.indexOf(item))}>
                    <S.Thumbnail
                      source={{
                        uri: ImageFileUtils.filepathFromImageFile(item),
                      }}
                    />
                    <S.CloseButton
                      elementName="taken_photo_delete_button"
                      onPress={() => onPressX(item)}>
                      <CircleCloseIcon width={24} height={24} />
                    </S.CloseButton>
                  </S.TakenPhotoItem>
                )}
                ListFooterComponent={
                  isEntrance ? (
                    <S.PlaceholderRow>
                      {ENTRANCE_PHOTO_SLOT_PLACEHOLDERS.slice(
                        photoFiles.length,
                      ).map((placeholder, i) => (
                        <S.PlaceholderSlot key={i}>
                          {placeholder && (
                            <S.PlaceholderImage source={placeholder} />
                          )}
                        </S.PlaceholderSlot>
                      ))}
                    </S.PlaceholderRow>
                  ) : null
                }
              />
            </GestureHandlerRootView>
          ) : isEntrance ? (
            <S.PlaceholderRow>
              {ENTRANCE_PHOTO_SLOT_PLACEHOLDERS.map((placeholder, i) => (
                <S.PlaceholderSlot key={i}>
                  {placeholder && <S.PlaceholderImage source={placeholder} />}
                </S.PlaceholderSlot>
              ))}
            </S.PlaceholderRow>
          ) : null}
        </S.TakenPhotos>
        {photoFiles.length === 0 && (
          <S.PhotoCaption>
            최대 {photoLimit}장까지 촬영할 수 있어요
            {'\n음량 조절 버튼으로도 촬영이 가능해요'}
          </S.PhotoCaption>
        )}
      </S.TakenPhotosSection>
      <S.ActionsWrapper>
        {visibleTooltip !== null && (
          <S.TooltipAnchor pointerEvents="none">
            <Tooltip
              text={
                visibleTooltip === 'albumLocked'
                  ? '1개의 장소를 현장 등록하면\n앨범 등록이 가능해요'
                  : visibleTooltip === 'albumActivated'
                    ? '이제, 앨범에 있는 사진을\n바로 등록할 수 있어요!'
                    : '사진 촬영이 어렵다면\n가이드의 도움을 받을 수 있어요!'
              }
              tailPosition={visibleTooltip === 'guideIntro' ? 104 : 48}
            />
          </S.TooltipAnchor>
        )}
        <S.AlbumButton
          elementName="camera_album_button"
          disabled={!isAlbumUploadAllowed}
          accessibilityRole="button"
          accessibilityLabel="앨범에서 사진 선택"
          accessibilityState={{disabled: !isAlbumUploadAllowed}}
          onPress={() => {
            if (!isAlbumUploadAllowed) {
              ToastUtils.show(
                '1개의 장소를 현장 등록하면 앨범 등록이 가능해요',
              );
              return;
            }
            selectFromAlbum();
          }}>
          <AlbumIcon width={28} height={28} color="white" />
          <S.AlbumButtonText>앨범</S.AlbumButtonText>
        </S.AlbumButton>
        {isEntrance && (
          <S.GuideButton
            elementName="camera_guide_button"
            accessibilityRole="button"
            accessibilityLabel="촬영 가이드"
            accessibilityState={{selected: isGuideOverlayEnabled}}
            onPress={() => setIsGuideOverlayEnabled(on => !on)}>
            <GuideIcon
              width={28}
              height={28}
              color={isGuideOverlayEnabled ? color.yellow : 'white'}
            />
            <S.GuideButtonText isOn={isGuideOverlayEnabled}>
              가이드
            </S.GuideButtonText>
          </S.GuideButton>
        )}
        <S.CaptureButton
          elementName="camera_capture_button"
          disabled={!canTakeMore || isTakingPhoto}
          onPress={handleCapturePress}>
          <S.CaptureInnerDeco />
        </S.CaptureButton>
        {device?.hasFlash && (
          <S.FlashButton
            elementName="camera_flash_button"
            accessibilityRole="button"
            accessibilityLabel="플래시"
            accessibilityState={{selected: flash === 'on'}}
            onPress={toggleFlash}>
            {flash === 'on' ? (
              <FlashOnIcon width={28} height={28} />
            ) : (
              <FlashOffIcon width={28} height={28} />
            )}
            <S.FlashButtonText>플래시</S.FlashButtonText>
          </S.FlashButton>
        )}
        <S.TimerButton
          elementName="camera_timer_button"
          logParams={{timerSeconds}}
          accessibilityRole="button"
          accessibilityLabel="타이머"
          onPress={cycleTimer}>
          <ClockIcon
            width={24}
            height={24}
            color={timerSeconds === 0 ? 'white' : color.yellow}
          />
          <S.TimerButtonText isOn={timerSeconds !== 0}>
            {timerSeconds === 0 ? '타이머' : `${timerSeconds}초`}
          </S.TimerButtonText>
        </S.TimerButton>
      </S.ActionsWrapper>
      {isEntranceGuideVisible && (
        <EntrancePhotoGuideCarousel
          onDone={() => setIsEntranceGuideVisible(false)}
        />
      )}
    </ScreenLayout>
  );
}

async function cropToRect(taken: PhotoFile) {
  const isLandscape =
    taken.orientation === 'landscape-left' ||
    taken.orientation === 'landscape-right';

  // 플랫폼별로 width/height swap 방향이 다름
  // Android: isLandscape일 때 taken.width가 실제 imageWidth
  // iOS: isLandscape일 때 taken.height가 실제 imageWidth
  const isIOS = Platform.OS === 'ios';
  const imageWidth = isLandscape
    ? isIOS
      ? taken.height
      : taken.width
    : isIOS
      ? taken.width
      : taken.height;
  const imageHeight = isLandscape
    ? isIOS
      ? taken.width
      : taken.height
    : isIOS
      ? taken.height
      : taken.width;

  const size = Math.min(imageWidth, imageHeight);

  const offset = {
    x: Math.floor(Math.max(0, (imageWidth - size) / 2)),
    y: Math.floor(Math.max(0, (imageHeight - size) / 2)),
  };

  const cropped = await ImageEditor.cropImage(
    ImageFileUtils.filepath(taken.path),
    {
      offset: {x: offset.x, y: offset.y},
      size: {width: size, height: size},
      // iOS 26에서 HEIC 입력이 후속 단계에서 실패하는 케이스가 있어 JPEG로 강제.
      format: 'jpeg',
    },
  );
  return {cropped, size};
}

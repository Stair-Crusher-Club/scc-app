import ImageEditor from '@react-native-community/image-editor';
import {useAtom, useAtomValue} from 'jotai';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  StyleProp,
  StyleSheet,
  TextStyle,
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import {
  ImagePickerResponse,
  launchImageLibrary,
  MediaType,
} from 'react-native-image-picker';
import Svg, {Line} from 'react-native-svg';
import {CameraCaptureError, PhotoFile} from 'react-native-vision-camera';

import CloseIcon from '@/assets/icon/close.svg';
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
  // 예시 사진 캐러셀이 떠 있는 동안은 미룬다 — 캐러셀에 가려진 채 5초 타이머가
  // 만료되어 툴팁을 아예 못 보는 문제가 있었다.
  const hasJudgedTooltipRef = useRef(false);
  useEffect(() => {
    // 캐러셀이 "곧 열릴 예정"인 경우까지 포함해야 한다. 같은 mount 의 effect flush 에서
    // 캐러셀 effect 가 setIsEntranceGuideVisible(true) 를 호출해도, 바로 뒤 실행되는 이
    // effect 는 그 렌더의 클로저(false)를 읽기 때문에 isEntranceGuideVisible 만으로는
    // 최초 진입을 못 막는다 — 캐러셀에 가린 채 5초 타이머가 소진되던 원인.
    const willOpenEntranceGuide = isEntrance && !hasShownGuideForEnterancePhoto;
    if (
      !isEntrance ||
      isEntranceGuideVisible ||
      willOpenEntranceGuide ||
      hasJudgedTooltipRef.current
    ) {
      return;
    }
    hasJudgedTooltipRef.current = true;
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
  }, [isEntrance, isEntranceGuideVisible, hasShownGuideForEnterancePhoto]);

  const tooltipOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visibleTooltip === null) {
      return;
    }
    tooltipOpacity.setValue(1);
    const timeout = setTimeout(() => {
      Animated.timing(tooltipOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(({finished}) => {
        if (finished) {
          setVisibleTooltip(null);
        }
      });
    }, 5000);
    return () => clearTimeout(timeout);
  }, [visibleTooltip, tooltipOpacity]);

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
      style={{
        backgroundColor: color.gray70v2,
        // Figma(min 694 / max 844): 헤더~버튼행 블록이 safe area 안에서 세로 중앙.
        justifyContent: 'center',
      }}>
      <S.Header>
        <S.HeaderCloseButton
          elementName="camera_close_button"
          accessibilityRole="button"
          accessibilityLabel="닫기"
          onPress={goBack}>
          {/* Figma(174:6980): 24x24 박스 안 글리프 14x14 → viewBox 16 그대로 렌더 */}
          <CloseIcon width={16} height={16} color="white" />
        </S.HeaderCloseButton>
        <S.SubmitButton
          onPress={() => confirm(photoFiles)}
          disabled={photoFiles.length === 0}>
          {`사진 등록(${photoFiles.length}/${photoLimit})`}
        </S.SubmitButton>
      </S.Header>
      <S.CameraContainer>
        {hasPermission && device ? (
          <S.CameraPreviewContainer>
            <CameraPreview ref={camera} device={device} />
            <CameraDeviceSelect device={device} onDeviceSelect={setDevice} />
            {isEntrance && isGuideOverlayEnabled && photoFiles.length === 0 && (
              <S.DoorFrameOverlay pointerEvents="none">
                <S.DoorFrameGroundLineLeft>
                  <GroundDashLine />
                </S.DoorFrameGroundLineLeft>
                <S.DoorFrameGroundLineRight>
                  <GroundDashLine />
                </S.DoorFrameGroundLineRight>
                <S.DoorFrameRect />
                <S.OverlayCaptionBox>
                  <ShadowedCaption
                    Caption={S.OverlayCaption}
                    text={'문을 프레임 안에\n맞춰주세요'}
                  />
                </S.OverlayCaptionBox>
              </S.DoorFrameOverlay>
            )}
            {isEntrance && isGuideOverlayEnabled && photoFiles.length === 1 && (
              <S.StairsOverlay pointerEvents="none">
                <ShadowedCaption
                  Caption={S.StairsOverlayCaption}
                  text={
                    '계단/경사로의 높이를 확인할 수 있게\n약간 측면에서 촬영해주세요'
                  }
                />
                {/* Figma(190:8386): 228.3x149.4 (+ stroke 1px 여유) */}
                <StairsOverlayIcon
                  width={230}
                  height={151}
                  style={{marginLeft: S.StairsOverlayIconOffset}}
                />
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
        {/* 가이드 버튼(입구 촬영에만 있다)으로 오버레이를 끄면 칩도 같이 감춘다.
            가이드 버튼이 없는 리뷰/화장실에서 숨기면 되살릴 방법이 없으므로 항상 노출. */}
        {route.params.target !== 'elevator' &&
          (!isEntrance || isGuideOverlayEnabled) && (
            <S.TipsAnchor>
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
                {/* Figma(174:6989): info-circle 20x20 */}
                <CircleInfoIcon width={20} height={20} />
                <S.Tip>{isEntrance ? '예시 사진 >' : '사진 촬영 팁  >'}</S.Tip>
              </S.Tips>
            </S.TipsAnchor>
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
      <S.TakenPhotosSection>
        <S.TakenPhotos>
          {photoFiles.length > 0 ? (
            <GestureHandlerRootView>
              <DraggableFlatList
                horizontal
                contentContainerStyle={{
                  justifyContent: 'center',
                  overflow: 'visible',
                  // 간격은 슬롯 자체의 marginHorizontal 로만 준다 (CameraScreen.style.ts
                  // PHOTO_SLOT_GAP 참조). 여기에 gap 을 두면 footer 경계에서 이중 계산된다.
                  paddingVertical: 6,
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
                      {/* Figma(btn_delete_img): 20x20 @ 슬롯 rel(40,-4) */}
                      <CircleCloseIcon width={20} height={20} />
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
        {!isEntrance && photoFiles.length === 0 && (
          <S.PhotoCaption>
            최대 {photoLimit}장까지 촬영할 수 있어요
          </S.PhotoCaption>
        )}
      </S.TakenPhotosSection>
      <S.ActionsWrapper>
        {visibleTooltip !== null && (
          <S.TooltipAnchor
            pointerEvents="none"
            style={{opacity: tooltipOpacity}}>
            <Tooltip
              text={
                visibleTooltip === 'albumLocked'
                  ? '1개의 장소를 현장 등록하면\n앨범 등록이 가능해요'
                  : visibleTooltip === 'albumActivated'
                    ? '이제, 앨범에 있는 사진을\n바로 등록할 수 있어요!'
                    : '사진 촬영이 어렵다면\n가이드의 도움을 받을 수 있어요!'
              }
              // Figma: 앨범 툴팁은 bubble x=28 · 꼬리 8(중심 13) → 절대 41,
              // 가이드 툴팁은 bubble x=12 · 꼬리 86(중심 91) → 절대 103.
              // 각 버튼 원 중심(앨범 42.5 / 가이드 103.5)을 가리킨다.
              bubbleLeft={visibleTooltip === 'guideIntro' ? 12 : 28}
              tailPosition={visibleTooltip === 'guideIntro' ? 91 : 13}
            />
          </S.TooltipAnchor>
        )}
        <S.SideButton
          left={20}
          elementName="camera_album_button"
          isDimmed={!isAlbumUploadAllowed}
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
          <S.SideButtonCircle>
            <AlbumIcon
              width={S.SIDE_BUTTON_ICON_SIZE}
              height={S.SIDE_BUTTON_ICON_SIZE}
              // Figma(174:6959): 비활성 앨범 아이콘은 #A0A2AE
              color={isAlbumUploadAllowed ? 'white' : color.gray40v2}
            />
          </S.SideButtonCircle>
          <S.SideButtonLabel>앨범</S.SideButtonLabel>
        </S.SideButton>
        {isEntrance && (
          <S.SideButton
            left={81}
            elementName="camera_guide_button"
            accessibilityRole="button"
            accessibilityLabel="촬영 가이드"
            accessibilityState={{selected: isGuideOverlayEnabled}}
            onPress={() => setIsGuideOverlayEnabled(on => !on)}>
            <S.SideButtonCircle>
              <GuideIcon
                width={S.SIDE_BUTTON_ICON_SIZE}
                height={S.SIDE_BUTTON_ICON_SIZE}
                color={isGuideOverlayEnabled ? color.yellow30 : 'white'}
              />
            </S.SideButtonCircle>
            <S.SideButtonLabel isOn={isGuideOverlayEnabled}>
              가이드
            </S.SideButtonLabel>
          </S.SideButton>
        )}
        <S.CaptureButton
          elementName="camera_capture_button"
          disabled={!canTakeMore || isTakingPhoto}
          onPress={handleCapturePress}>
          <S.CaptureInnerDeco />
        </S.CaptureButton>
        {device?.hasFlash && (
          <S.SideButton
            right={81}
            elementName="camera_flash_button"
            accessibilityRole="button"
            accessibilityLabel="플래시"
            accessibilityState={{selected: flash === 'on'}}
            onPress={toggleFlash}>
            <S.SideButtonCircle>
              {flash === 'on' ? (
                <FlashOnIcon
                  width={S.SIDE_BUTTON_ICON_SIZE}
                  height={S.SIDE_BUTTON_ICON_SIZE}
                />
              ) : (
                <FlashOffIcon
                  width={S.SIDE_BUTTON_ICON_SIZE}
                  height={S.SIDE_BUTTON_ICON_SIZE}
                />
              )}
            </S.SideButtonCircle>
            <S.SideButtonLabel>플래시</S.SideButtonLabel>
          </S.SideButton>
        )}
        <S.SideButton
          right={20}
          elementName="camera_timer_button"
          logParams={{timerSeconds}}
          accessibilityRole="button"
          accessibilityLabel="타이머"
          onPress={cycleTimer}>
          <S.SideButtonCircle>
            <ClockIcon
              width={S.SIDE_BUTTON_ICON_SIZE}
              height={S.SIDE_BUTTON_ICON_SIZE}
              color={timerSeconds === 0 ? 'white' : color.yellow30}
            />
          </S.SideButtonCircle>
          <S.SideButtonLabel isOn={timerSeconds !== 0}>
            {timerSeconds === 0 ? '타이머' : `${timerSeconds}초`}
          </S.SideButtonLabel>
        </S.SideButton>
      </S.ActionsWrapper>
      {isEntranceGuideVisible && (
        <EntrancePhotoGuideCarousel
          onDone={() => setIsEntranceGuideVisible(false)}
        />
      )}
    </ScreenLayout>
  );
}

/**
 * Figma(174:6996 / 190:8385) 는 동일한 DROP_SHADOW 를 **3겹** 쌓아 halo 를 진하게 만든다.
 * RN Text 는 textShadow 를 1겹만 지원하고, radius 를 키우면 두꺼워지는 대신 퍼져서 옅어진다.
 * 그래서 같은 문구를 겹쳐 그려 **그림자만 누적**시킨다 — 아래 겹의 글자는 맨 위 겹에 완전히
 * 가려지므로 글자 자체는 한 겹으로 보인다.
 */
const CAPTION_SHADOW_LAYERS = 3;

function ShadowedCaption({
  Caption,
  text,
}: {
  Caption: React.ComponentType<{
    style?: StyleProp<TextStyle>;
    children: React.ReactNode;
  }>;
  text: string;
}) {
  return (
    <S.CaptionStack>
      {/* 흐름에 놓인 맨 아래 겹이 스택 크기를 정하고, 나머지는 그 박스를 채운다. */}
      {Array.from({length: CAPTION_SHADOW_LAYERS - 1}).map((_, i) => (
        <Caption key={i} style={StyleSheet.absoluteFillObject}>
          {text}
        </Caption>
      ))}
      <Caption>{text}</Caption>
    </S.CaptionStack>
  );
}

// Figma(113:5048/5049): stroke white 2px, dash [4,4]. 컨테이너 폭 전체를 채운다.
function GroundDashLine() {
  return (
    <Svg width="100%" height={2}>
      <Line
        x1="0"
        y1="1"
        x2="100%"
        y2="1"
        stroke="white"
        strokeWidth={2}
        strokeDasharray="4,4"
      />
    </Svg>
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

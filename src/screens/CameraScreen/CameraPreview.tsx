import {useAppState} from '@react-native-community/hooks';
import {useIsFocused} from '@react-navigation/native';
import React, {forwardRef, useEffect, useState} from 'react';
import {ActivityIndicator} from 'react-native';
import Toast from 'react-native-root-toast';
import {
  Camera,
  CameraDevice,
  CameraRuntimeError,
} from 'react-native-vision-camera';

import * as S from './CameraPreview.style';

export default forwardRef<Camera, {device: CameraDevice}>(
  function CameraPreview(props, ref) {
    const [initialized, setInitialized] = useState(false);

    // check if camera page is active
    const isFocused = useIsFocused();
    const appState = useAppState();
    const isActive = isFocused && appState === 'active';

    // 카메라 변경 시 카메라 초기화 진행됨
    useEffect(() => {
      setInitialized(false);
    }, [props.device]);

    function handleCameraError(e: CameraRuntimeError) {
      Toast.show(`카메라 오류가 발생했습니다.\n${e.message}`);
    }

    return (
      <>
        <Camera
          photo
          ref={ref}
          style={{flex: 1}}
          device={props.device}
          isActive={isActive}
          zoom={props.device.neutralZoom}
          enableZoomGesture
          photoQualityBalance={'speed'}
          androidPreviewViewType="surface-view"
          onInitialized={() => {
            setInitialized(true);
          }}
          onError={handleCameraError}
        />
        {!initialized && (
          <S.Loading>
            <ActivityIndicator size="large" />
          </S.Loading>
        )}
      </>
    );
  },
);

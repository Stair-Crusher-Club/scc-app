import {isEmpty} from 'lodash';
import {useEffect, useRef, useState} from 'react';
import {
  Camera,
  CameraDevice,
  getCameraDevice,
  useCameraDevices,
  useCameraPermission,
} from 'react-native-vision-camera';

export default function useCamera() {
  const camera = useRef<Camera>(null);
  const {hasPermission, requestPermission} = useCameraPermission();
  const devices = useCameraDevices();
  const [device, setDevice] = useState<CameraDevice>();

  // 카메라 권한 체크
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // 기기의 카메라 중 어떤 카메라를 초기 카메라로 선택할지 결정
  useEffect(() => {
    const backCams = devices.filter(d => d.position === 'back');
    const multiCams = backCams.filter(d => d.isMultiCam);

    // 핀치투 줌이 가능한 카메라가 있다면 선택
    if (!isEmpty(multiCams)) {
      const bestDevice = getCameraDevice(multiCams, 'back', {
        physicalDevices: [
          'ultra-wide-angle-camera',
          'wide-angle-camera',
          'telephoto-camera',
        ],
      });
      setDevice(bestDevice);
      return;
    }

    // 후면 카메라 선택
    setDevice(getCameraDevice(backCams, 'back'));
  }, [devices]);

  function handleDeviceSelect(newDevice: CameraDevice) {
    setDevice(newDevice);
  }

  return {
    camera,
    hasPermission,
    device,
    setDevice: handleDeviceSelect,
  };
}

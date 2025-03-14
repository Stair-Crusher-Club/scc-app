import {isEmpty} from 'lodash';
import React, {useEffect, useState} from 'react';
import {CameraDevice, useCameraDevices} from 'react-native-vision-camera';

import * as S from './CameraDeviceSelect.style';

interface Props {
  device: CameraDevice;
  onDeviceSelect: (device: CameraDevice) => void;
}
export default function CameraDeviceSelect({device, onDeviceSelect}: Props) {
  const devices = useCameraDevices();
  const [availableDevices, setAvailableDevices] = useState<CameraDevice[]>([]);

  // 기기의 카메라 중 어떤 카메라를 초기 카메라로 선택할지 결정
  useEffect(() => {
    const backCams = devices.filter(d => d.position === 'back');
    const multiCams = backCams.filter(d => d.isMultiCam);

    // 멀티캠이 없지만 후면 카메라가 있으면 후면 카메라를 선택할 수 있게 한다.
    if (!isEmpty(backCams) && isEmpty(multiCams)) {
      setAvailableDevices(backCams);
    }
  }, [devices]);

  // 멀티카메라 지원 : 카메라 선택 기능 필요 없음
  if (availableDevices.length === 0) {
    return null;
  }

  return (
    <S.DeviceTypes>
      {availableDevices.length > 1 &&
        availableDevices.map(d => (
          <S.DeviceTypeButton
            key={d.id}
            selected={d === device}
            onPress={() => onDeviceSelect(d)}>
            <S.DeviceTypeText>{getDeviceTypeName(d)}</S.DeviceTypeText>
          </S.DeviceTypeButton>
        ))}
    </S.DeviceTypes>
  );
}

const getDeviceTypeName = (d: CameraDevice) => {
  if (isEmpty(d.physicalDevices)) {
    return '';
  }
  switch (d.physicalDevices[0]) {
    case 'ultra-wide-angle-camera':
      return 'UW';
    case 'wide-angle-camera':
      return 'W';
    case 'telephoto-camera':
      return 'TP';
  }
};

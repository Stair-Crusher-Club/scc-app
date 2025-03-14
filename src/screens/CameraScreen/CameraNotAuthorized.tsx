import React from 'react';

import * as S from './CameraNotAuthorized.style';

export default function CameraNotAuthorized() {
  return (
    <S.CameraNotAuthorized>
      <S.AccessDeniedText>카메라 권한이 필요합니다.</S.AccessDeniedText>
      <S.AccessDeniedText>설정에서 카메라 권한을 켜주세요.</S.AccessDeniedText>
    </S.CameraNotAuthorized>
  );
}

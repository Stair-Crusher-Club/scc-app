import Clipboard from '@react-native-clipboard/clipboard';
import React from 'react';

import CopyIcon from '@/assets/icon/ic_copy.svg';
import {useMe} from '@/atoms/Auth';
import {color} from '@/constant/color';
import ToastUtils from '@/utils/ToastUtils';

import * as S from './Row.style';

export default function IdRow() {
  const {userInfo} = useMe();

  function copyIdToClipboard() {
    if (userInfo?.id) {
      Clipboard.setString(userInfo.id);
      ToastUtils.show('ID가 복사되었습니다');
    }
  }

  return (
    <S.Row>
      <S.SectionLabel>ID</S.SectionLabel>
      <S.ValueRow>
        <S.SectionValue>{userInfo?.displayId ?? userInfo?.id}</S.SectionValue>
        <S.CopyButton
          elementName="setting_copy_id_button"
          activeOpacity={0.7}
          underlayColor={color.brand10}
          onPress={copyIdToClipboard}>
          <>
            <CopyIcon width={16} height={16} color={color.brandColor} />
            <S.CopyButtonText>복사</S.CopyButtonText>
          </>
        </S.CopyButton>
      </S.ValueRow>
    </S.Row>
  );
}

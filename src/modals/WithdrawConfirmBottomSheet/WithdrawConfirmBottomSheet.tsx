import React from 'react';

import DangerousIcon from '@/assets/icon/ic_dangerous.svg';
import {LogClick} from '@/logging/LogClick';
import {LogParamsProvider} from '@/logging/LogParamsProvider';

import BottomSheet from '../BottomSheet';
import * as S from './WithdrawConfirmBottomSheet.style';

interface Props {
  name: string;
  isVisible: boolean;
  onConfirmButtonPressed: () => void;
  onCloseButtonPressed: () => void;
}

export default function WithdrawConfirmBottomSheet({
  name,
  isVisible,
  onConfirmButtonPressed,
  onCloseButtonPressed,
}: Props) {
  return (
    <LogParamsProvider
      params={{bottom_sheet_type: 'withdraw_confirm', bottom_sheet_name: name}}>
      <BottomSheet isVisible={isVisible}>
        <S.ContentsContainer>
          <S.IconWrapper>
            <DangerousIcon />
          </S.IconWrapper>
          <S.Title>
            {
              '정말로 탈퇴할까요?\n더 이상 이동약자를 위해 계단을 정복할 수 없어요.'
            }
          </S.Title>
        </S.ContentsContainer>
        <S.ButtonContainer>
          <LogClick elementName="withdraw_confirm_bottom_sheet_confirm_button">
            <S.WithdrawButton onPress={onConfirmButtonPressed}>
              <S.WithdrawButtonText>회원 탈퇴</S.WithdrawButtonText>
            </S.WithdrawButton>
          </LogClick>
          <LogClick elementName="withdraw_confirm_bottom_sheet_cancel_button">
            <S.CancelButton onPress={onCloseButtonPressed}>
              <S.CancelButtonText>취소</S.CancelButtonText>
            </S.CancelButton>
          </LogClick>
        </S.ButtonContainer>
      </BottomSheet>
    </LogParamsProvider>
  );
}

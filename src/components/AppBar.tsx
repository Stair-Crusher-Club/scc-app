import React from 'react';

import ExitIcon from '@/assets/icon/ic_exit.svg';
import {color} from '@/constant/color';

import * as S from './AppBar.style';

interface CloseAppBarProps {
  title?: string;
  showSeparator?: boolean;
  onTapCloseButton: () => void;
}

export const CloseAppBar = ({
  title,
  showSeparator = false,
  onTapCloseButton,
}: CloseAppBarProps) => {
  return (
    <S.Container>
      <S.ContentsContainer>
        <S.SpaceButton />
        <S.Title>{title}</S.Title>
        <S.CloseButton onPress={onTapCloseButton}>
          <ExitIcon width={24} height={24} color={color.black} />
        </S.CloseButton>
      </S.ContentsContainer>
      {showSeparator && <S.Separator />}
    </S.Container>
  );
};

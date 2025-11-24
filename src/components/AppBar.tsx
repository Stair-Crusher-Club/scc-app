import React, {useCallback} from 'react';
import {Alert} from 'react-native';

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
  const handleCloseButtonPress = useCallback(() => {
    Alert.alert(
      '정말 페이지를 나가시겠어요?',
      '',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '나가기',
          onPress: onTapCloseButton,
          style: 'destructive',
        },
      ],
    );
  }, [onTapCloseButton]);

  return (
    <S.Container>
      <S.ContentsContainer>
        <S.SpaceButton />
        <S.Title>{title}</S.Title>
        <S.CloseButton
          elementName="app_bar_close_button"
          onPress={handleCloseButtonPress}>
          <ExitIcon width={24} height={24} color={color.black} />
        </S.CloseButton>
      </S.ContentsContainer>
      {showSeparator && <S.Separator />}
    </S.Container>
  );
};

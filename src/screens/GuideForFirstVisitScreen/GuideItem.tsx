import React from 'react';

import CheckIcon from '@/assets/icon/ic_check.svg';
import {color} from '@/constant/color';

import * as S from './GuideItem.style';

interface GuideItemProps {
  title: string;
  description: string;
}

export default function GuideItem({title, description}: GuideItemProps) {
  return (
    <S.GuideItem>
      <CheckIcon width={24} height={24} color={color.success} />
      <S.ContentsContainer>
        <S.Title>{title}</S.Title>
        <S.Description>{description}</S.Description>
      </S.ContentsContainer>
    </S.GuideItem>
  );
}

import React from 'react';

import * as S from './GuideItem.style';

interface GuideItemProps {
  title: string;
  description: string;
}

export default function GuideItem({title, description}: GuideItemProps) {
  return (
    <S.GuideItem>
      <S.Title>{title}</S.Title>
      <S.Description>{description}</S.Description>
    </S.GuideItem>
  );
}

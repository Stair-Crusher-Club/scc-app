import React from 'react';

import {PlaceListItem} from '@/generated-sources/openapi';

import * as S from './MyConqueredPlaceItem.style';

interface MyConqueredPlaceItemProps {
  item: PlaceListItem;
  onClick: () => void;
}

const MyConqueredPlaceItem = ({item, onClick}: MyConqueredPlaceItemProps) => {
  return (
    <S.Container onPress={onClick}>
      <S.ContentsContainer>
        <S.Title>{item.place.name}</S.Title>
        <S.Address>{item.place.address}</S.Address>
      </S.ContentsContainer>
    </S.Container>
  );
};

export default MyConqueredPlaceItem;

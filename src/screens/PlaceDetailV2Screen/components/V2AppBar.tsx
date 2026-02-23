import {useNavigation} from '@react-navigation/core';
import React from 'react';
import styled from 'styled-components/native';

import LeftArrowIcon from '@/assets/icon/ic_arrow_left.svg';
import BookmarkIconOff from '@/assets/icon/ic_bookmark.svg';
import BookmarkIconOn from '@/assets/icon/ic_bookmark_on.svg';
import ShareIcon from '@/assets/icon/ic_share.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface V2AppBarProps {
  isFavorite?: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
  placeName?: string;
  showTitle?: boolean;
}

export default function V2AppBar({
  isFavorite,
  onToggleFavorite,
  onShare,
  placeName,
  showTitle = false,
}: V2AppBarProps) {
  const navigation = useNavigation();

  return (
    <AppBarContainer>
      <SccPressable
        elementName="place_detail_v2_back_button"
        onPress={() => navigation.goBack()}>
        <LeftArrowIcon width={24} height={24} color={color.black} />
      </SccPressable>
      <TitleContainer>
        {showTitle && placeName ? (
          <TitleText numberOfLines={1}>{placeName}</TitleText>
        ) : null}
      </TitleContainer>
      <RightActions>
        <SccPressable
          elementName="place_detail_v2_toggle_favorite_button"
          logParams={{isFavoritePlace: isFavorite}}
          onPress={onToggleFavorite}>
          {isFavorite ? (
            <BookmarkIconOn width={24} height={24} color={color.brandColor} />
          ) : (
            <BookmarkIconOff width={24} height={24} color={color.black} />
          )}
        </SccPressable>
        <SccPressable
          elementName="place_detail_v2_share_button"
          onPress={onShare}>
          <ShareIcon width={24} height={24} color={color.black} />
        </SccPressable>
      </RightActions>
    </AppBarContainer>
  );
}

const AppBarContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding-horizontal: 20px;
  padding-vertical: 10px;
  height: 50px;
  background-color: ${color.white};
`;

const TitleContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding-horizontal: 8px;
`;

const TitleText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 16px;
  color: ${color.black};
`;

const RightActions = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

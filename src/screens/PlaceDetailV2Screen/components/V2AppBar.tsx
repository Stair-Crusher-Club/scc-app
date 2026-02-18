import {useNavigation} from '@react-navigation/core';
import React from 'react';
import styled from 'styled-components/native';

import LeftArrowIcon from '@/assets/icon/ic_arrow_left.svg';
import BookmarkIconOff from '@/assets/icon/ic_bookmark.svg';
import BookmarkIconOn from '@/assets/icon/ic_bookmark_on.svg';
import ShareIcon from '@/assets/icon/ic_share.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';

interface V2AppBarProps {
  isFavorite?: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
}

export default function V2AppBar({
  isFavorite,
  onToggleFavorite,
  onShare,
}: V2AppBarProps) {
  const navigation = useNavigation();

  return (
    <AppBarContainer>
      <SccPressable
        elementName="place_detail_v2_back_button"
        onPress={() => navigation.goBack()}>
        <LeftArrowIcon width={24} height={24} color={color.black} />
      </SccPressable>
      <Spacer />
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
`;

const Spacer = styled.View`
  flex: 1;
`;

const RightActions = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

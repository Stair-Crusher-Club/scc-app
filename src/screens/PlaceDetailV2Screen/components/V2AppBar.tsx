import {useNavigation} from '@react-navigation/core';
import React from 'react';
import styled from 'styled-components/native';

import BackIcon from '@/assets/icon/ic_v2_arrow_back.svg';
import BookmarkIcon from '@/assets/icon/ic_v2_bookmark.svg';
import BookmarkOnIcon from '@/assets/icon/ic_v2_bookmark_on.svg';
import ShareIcon from '@/assets/icon/ic_v2_share.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

const ICON_COLOR = '#16181C';

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
        <BackIcon width={24} height={24} color={ICON_COLOR} />
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
            <BookmarkOnIcon width={24} height={24} color={color.brandColor} />
          ) : (
            <BookmarkIcon width={24} height={24} color={ICON_COLOR} />
          )}
        </SccPressable>
        <SccPressable
          elementName="place_detail_v2_share_button"
          onPress={onShare}>
          <ShareIcon width={24} height={24} color={ICON_COLOR} />
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
  align-items: flex-start;
  justify-content: center;
  padding-horizontal: 8px;
`;

const TitleText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: #16181c;
`;

const RightActions = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

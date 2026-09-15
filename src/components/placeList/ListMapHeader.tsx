import React from 'react';
import styled from 'styled-components/native';

import CloseIcon from '@/assets/icon/close.svg';
import MapIcon from '@/assets/icon/ic_map.svg';
import MenuIcon from '@/assets/icon/ic_menu.svg';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface ListMapHeaderProps {
  viewMode: 'list' | 'map';
  title: string;
  onToggleViewMode: () => void;
  onClose: () => void;
  toggleElementName: string;
  closeElementName: string;
}

export default function ListMapHeader({
  viewMode,
  title,
  onToggleViewMode,
  onClose,
  toggleElementName,
  closeElementName,
}: ListMapHeaderProps) {
  return (
    <HeaderRow $isMapMode={viewMode === 'map'}>
      <HeaderLeftToggle
        elementName={toggleElementName}
        activeOpacity={0.8}
        onPress={onToggleViewMode}>
        {viewMode === 'list' ? (
          <MapIcon width={24} height={24} color={color.black} />
        ) : (
          <MenuIcon width={24} height={24} color={color.black} />
        )}
        <HeaderToggleText>
          {viewMode === 'list' ? '지도' : '목록'}
        </HeaderToggleText>
      </HeaderLeftToggle>
      <HeaderTitle numberOfLines={1}>{title}</HeaderTitle>
      <SccTouchableOpacity
        elementName={closeElementName}
        activeOpacity={0.8}
        hitSlop={14}
        onPress={onClose}>
        <CloseIcon width={16} height={16} color={color.black} />
      </SccTouchableOpacity>
    </HeaderRow>
  );
}

const HeaderRow = styled.View<{$isMapMode: boolean}>`
  flex-direction: row;
  align-items: center;
  padding-horizontal: 20px;
  padding-vertical: 7px;
  gap: 12px;
  background-color: ${color.white};
`;

const HeaderLeftToggle = styled(SccTouchableOpacity)`
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 38px;
`;

const HeaderToggleText = styled.Text`
  font-size: 10px;
  font-family: ${font.pretendardRegular};
  color: ${color.black};
`;

const HeaderTitle = styled.Text`
  flex: 1;
  font-size: 18px;
  font-family: ${font.pretendardSemibold};
  color: ${color.black};
`;

import React from 'react';
import {Image} from 'react-native';

import {BadgeShell, BadgeText} from '@/components/BadgeShell';
import GradientBorderPill from '@/components/GradientBorderPill';
import SccRemoteImage from '@/components/SccRemoteImage';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {PlaceListNameChipDto} from '@/generated-sources/openapi';

const savedListBadgeImage = require('@/assets/img/ic_saved_list_badge.png');

interface PlaceListNameChipProps extends PlaceListNameChipDto {
  onPress?: () => void;
  elementName?: string;
  logParams?: Record<string, unknown>;
  /** 칩 노출(impression) 자체를 로깅할지. 기존 PlaceTags 칩은 항상 true였다. */
  trackView?: boolean;
}

/**
 * 저장리스트 이름칩 — 앱 전체(검색 카드/PDP/저장리스트 상세헤더/모음 페이지)에서
 * 이 칩의 유일한 구현. 두 번째 칩 컴포넌트를 만들면 spec 위반.
 *
 * 아이콘/배경색/테두리색이 전부 미지정이면 현행 PlaceTags와 픽셀 동일하게 렌더한다
 * (fallback 분기가 아니라 이 컴포넌트의 기본 렌더링).
 */
export default function PlaceListNameChip({
  text,
  iconUrl,
  backgroundColor,
  borderColor,
  onPress,
  elementName,
  logParams,
  trackView,
}: PlaceListNameChipProps) {
  if (!iconUrl && !backgroundColor && !borderColor) {
    const pill = (
      <GradientBorderPill
        borderWidth={1}
        gradientId="tag-gradient"
        contentStyle={{
          paddingTop: 4,
          paddingBottom: 4,
          paddingLeft: 6,
          paddingRight: 8,
          gap: 4,
        }}>
        <Image
          source={savedListBadgeImage}
          style={{width: 16, height: 16}}
          resizeMode="contain"
        />
        <BadgeText textColor={color.gray80}>{text}</BadgeText>
      </GradientBorderPill>
    );
    if (!onPress) {
      return pill;
    }
    return (
      <SccTouchableOpacity
        elementName={elementName ?? 'place_list_name_chip'}
        logParams={logParams}
        trackView={trackView}
        onPress={onPress}>
        {pill}
      </SccTouchableOpacity>
    );
  }

  const content = (
    <>
      {iconUrl ? (
        <SccRemoteImage
          imageUrl={iconUrl}
          style={{width: 16, height: 16}}
          wrapperBackgroundColor={null}
        />
      ) : null}
      <BadgeText textColor={color.gray80v2}>{text}</BadgeText>
    </>
  );

  if (!onPress) {
    return (
      <BadgeShell
        backgroundColor={backgroundColor ?? color.white}
        textColor={color.gray80v2}
        borderColor={borderColor ?? undefined}
        borderRadius={100}
        paddingHorizontal={6}
        style={{paddingRight: 8}}>
        {content}
      </BadgeShell>
    );
  }

  return (
    <BadgeShell
      backgroundColor={backgroundColor ?? color.white}
      textColor={color.gray80v2}
      borderColor={borderColor ?? undefined}
      borderRadius={100}
      paddingHorizontal={6}
      style={{paddingRight: 8}}
      elementName={elementName ?? 'place_list_name_chip'}
      logParams={logParams}
      trackView={trackView}
      onPress={onPress}>
      {content}
    </BadgeShell>
  );
}

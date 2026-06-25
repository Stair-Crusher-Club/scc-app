import React from 'react';
import {Image} from 'react-native';

import GradientBorderPill from '@/components/GradientBorderPill';
import {BadgeText} from '@/components/BadgeShell';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {PlaceTagDto, PlaceTagTypeDto} from '@/generated-sources/openapi';
import useNavigation from '@/navigation/useNavigation';

const savedListBadgeImage = require('@/assets/img/ic_saved_list_badge.png');

interface PlaceTagsProps {
  tags: PlaceTagDto[];
}

export default function PlaceTags({tags}: PlaceTagsProps) {
  const navigation = useNavigation();

  if (tags.length === 0) {
    return null;
  }

  // 스크롤은 부모(접근레벨 배지까지 포함한 한 줄)가 담당 — 여기선 배지들만 나열.
  return <>{tags.map((tag, index) => renderTag(tag, index, navigation))}</>;
}

function renderTag(
  tag: PlaceTagDto,
  index: number,
  navigation: ReturnType<typeof useNavigation>,
): React.ReactElement {
  switch (tag.type) {
    case PlaceTagTypeDto.PlaceList: {
      const placeListId = tag.placeListId;
      return (
        <SccTouchableOpacity
          key={index}
          elementName="place_tag_place_list"
          trackView
          logParams={{placeListId}}
          onPress={() => {
            if (placeListId) {
              navigation.navigate('PlaceListDetail', {
                placeListId,
                initialViewMode: 'list',
              });
            }
          }}
          style={{marginRight: 4}}>
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
            {/* 그라데이션 원 + 흰색 북마크 — Figma node 9068-2112 에서 추출한 3x PNG */}
            <Image
              source={savedListBadgeImage}
              style={{width: 16, height: 16}}
              resizeMode="contain"
            />
            <BadgeText textColor={color.gray80}>{tag.name}</BadgeText>
          </GradientBorderPill>
        </SccTouchableOpacity>
      );
    }
    default: {
      const _exhaustiveCheck: never = tag.type;
      return _exhaustiveCheck;
    }
  }
}

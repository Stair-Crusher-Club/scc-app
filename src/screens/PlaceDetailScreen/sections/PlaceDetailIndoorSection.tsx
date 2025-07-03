import React from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {AccessibilityInfoDto} from '@/generated-sources/openapi';
import PlaceIndoorInfo from '@/screens/PlaceDetailScreen/components/PlaceIndoorInfo';
import PlaceReviewSummaryInfo from '@/screens/PlaceDetailScreen/components/PlaceReviewSummaryInfo';
import PlaceVisitReviewInfo from '@/screens/PlaceDetailScreen/components/PlaceVisitReviewInfo';

interface Props {
  accessibility?: AccessibilityInfoDto;
}

export default function PlaceDetailIndoorSection({accessibility}: Props) {
  if (!accessibility?.placeAccessibility) {
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
        gap: 32,
        paddingVertical: 32,
        paddingHorizontal: 20,
        backgroundColor: color.white,
      }}>
      <PlaceIndoorInfo accessibility={accessibility} />
      <Divider />
      <PlaceReviewSummaryInfo accessibility={accessibility} />
      <Divider />
      <PlaceVisitReviewInfo accessibility={accessibility} />
    </View>
  );
}

const Divider = styled.View({height: 1, backgroundColor: color.gray20});

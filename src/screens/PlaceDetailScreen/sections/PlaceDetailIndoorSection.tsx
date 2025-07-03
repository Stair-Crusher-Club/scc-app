import dayjs from 'dayjs';
import React from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';

import PlusIcon from '@/assets/icon/ic_plus.svg';
import {SccButton} from '@/components/atoms';
import {CommentBlock} from '@/components/molecules';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {AccessibilityInfoDto, Place} from '@/generated-sources/openapi';
import useNavigation from '@/navigation/useNavigation';
import PlaceDetailCommentSection from '@/screens/PlaceDetailScreen/components/PlaceDetailCommentSection';
import PlaceIndoorInfo from '@/screens/PlaceDetailScreen/components/PlaceIndoorInfo';
import PlaceReviewSummaryInfo from '@/screens/PlaceDetailScreen/components/PlaceReviewSummaryInfo';
import PlaceVisitReviewInfo from '@/screens/PlaceDetailScreen/components/PlaceVisitReviewInfo';
import {useCheckAuth} from '@/utils/checkAuth';

import ImageList from '../components/PlaceDetailImageList';
import PlaceDoorInfo from '../components/PlaceDoorInfo';
import PlaceEntranceStepInfo from '../components/PlaceEntranceStepInfo';
import PlaceFloorInfo from '../components/PlaceFloorInfo';
import PlaceDetailCrusher from './PlaceDetailCrusher';
import * as S from './PlaceDetailEntranceSection.style';

interface Props {
  accessibility?: AccessibilityInfoDto;
}

export default function PlaceDetailIndoorSection({accessibility}: Props) {
  const navigation = useNavigation();
  const checkAuth = useCheckAuth();

  if (!accessibility?.placeAccessibility) {
    return null;
  }

  const {images, registeredUserName, createdAt} =
    accessibility.placeAccessibility;
  const comments = accessibility.placeAccessibilityComments;

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

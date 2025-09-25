import dayjs from 'dayjs';
import React from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {AccessibilityInfoDto, Place} from '@/generated-sources/openapi';
import {useUpvoteToggle} from '@/hooks/useUpvoteToggle';
import useNavigation from '@/navigation/useNavigation';
import PlaceDetailCommentSection from '@/screens/PlaceDetailScreen/components/PlaceDetailCommentSection';
import {useCheckAuth} from '@/utils/checkAuth';

import FeedbackButton from '@/components/FeedbackButton';
import ImageList from '../components/PlaceDetailImageList';
import PlaceDoorInfo from '../components/PlaceDoorInfo';
import PlaceEntranceStepInfo from '../components/PlaceEntranceStepInfo';
import PlaceFloorInfo from '../components/PlaceFloorInfo';
import {UserInteractionHandlers} from '../types';
import PlaceDetailCrusher from './PlaceDetailCrusher';
import * as S from './PlaceDetailEntranceSection.style';

interface Props extends UserInteractionHandlers {
  accessibility?: AccessibilityInfoDto;
  place: Place;
  isAccessibilityRegistrable?: boolean;
  onRegister?: () => void;
}

export default function PlaceDetailEntranceSection({
  accessibility,
  place,
  isAccessibilityRegistrable,
  onRegister,
  showNegativeFeedbackBottomSheet,
}: Props) {
  const navigation = useNavigation();
  const checkAuth = useCheckAuth();

  const {isUpvoted, totalUpvoteCount, toggleUpvote} = useUpvoteToggle({
    initialIsUpvoted: accessibility?.placeAccessibility?.isUpvoted ?? false,
    initialTotalCount: accessibility?.placeAccessibility?.totalUpvoteCount,
    targetId: accessibility?.placeAccessibility?.id,
    targetType: 'PLACE_ACCESSIBILITY',
    placeId: place.id,
  });

  if (!accessibility?.placeAccessibility) {
    return (
      <NoPlaceEntranceInfoSection
        isAccessibilityRegistrable={isAccessibilityRegistrable ?? false}
        onRegister={onRegister}
      />
    );
  }

  const {images, registeredUserName, createdAt} =
    accessibility.placeAccessibility;
  const comments = accessibility.placeAccessibilityComments;

  function handlePressAddComment() {
    navigation.navigate('AddComment', {type: 'place', placeId: place.id});
  }

  return (
    <S.Section>
      <S.Row>
        <S.Title>입구 접근성</S.Title>
        <S.Updated>{dayjs(createdAt.value).format('YYYY. MM. DD')}</S.Updated>
      </S.Row>
      <ImageList images={images ?? []} roundCorners />
      <PlaceFloorInfo accessibility={accessibility} />
      <PlaceEntranceStepInfo accessibility={accessibility} />
      <PlaceDoorInfo accessibility={accessibility} />
      <FeedbackButton
        upvoted={isUpvoted}
        total={totalUpvoteCount}
        onPressUpvote={toggleUpvote}
        onPressInfoUpdateRequest={() =>
          showNegativeFeedbackBottomSheet?.('PLACE_ACCESSIBILITY')
        }
        onPressAnalytics={() =>
          navigation.navigate('UpvoteAnalytics', {
            targetType: 'PLACE_ACCESSIBILITY',
            targetId: accessibility?.placeAccessibility?.id || '',
          })
        }
      />
      <Divider />
      <View>
        <PlaceDetailCommentSection
          comments={comments}
          commentTarget="place"
          onAddComment={handlePressAddComment}
          checkAuth={checkAuth}
          title="매장 입구 정보 의견 남기기"
        />
        <PlaceDetailCrusher
          crusherGroupIcon={
            accessibility.placeAccessibility?.challengeCrusherGroup?.icon
          }
          crusherNames={registeredUserName ? [registeredUserName] : []}
        />
      </View>
    </S.Section>
  );
}

const Divider = styled.View({height: 1, backgroundColor: color.gray20});

function NoPlaceEntranceInfoSection({
  isAccessibilityRegistrable,
  onRegister,
}: {
  isAccessibilityRegistrable: boolean;
  onRegister?: () => void;
}) {
  return (
    <S.Section>
      <S.Row>
        <S.Title>입구 접근성</S.Title>
      </S.Row>
      <S.EmptyInfoContent>
        <ImageList images={[]} roundCorners />
        <PlaceFloorInfo accessibility={undefined} />
        <PlaceEntranceStepInfo accessibility={undefined} />
        <PlaceDoorInfo accessibility={undefined} />
        <SccButton
          text={
            isAccessibilityRegistrable
              ? '정보 등록하기'
              : '서비스 지역이 아닙니다'
          }
          style={{
            borderRadius: 10,
          }}
          fontSize={18}
          fontFamily={font.pretendardBold}
          isDisabled={!isAccessibilityRegistrable}
          onPress={onRegister}
          elementName="place_detail_entrance_register"
        />
      </S.EmptyInfoContent>
    </S.Section>
  );
}

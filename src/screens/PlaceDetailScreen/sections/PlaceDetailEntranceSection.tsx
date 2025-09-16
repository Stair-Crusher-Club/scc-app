import dayjs from 'dayjs';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {AccessibilityInfoDto, Place} from '@/generated-sources/openapi';
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
  updateUpvoteStatus,
}: Props) {
  const navigation = useNavigation();
  const checkAuth = useCheckAuth();

  const [isUpvoted, setIsUpvoted] = useState(false);
  const [totalUpvoteCount, setTotalUpvoteCount] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    setIsUpvoted(accessibility?.placeAccessibility?.isUpvoted ?? false);
    setTotalUpvoteCount(accessibility?.totalFavoriteCount);
  }, [accessibility]);

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

  const toggleUpvote = async () => {
    checkAuth(async () => {
      const placeAccessibilityId = accessibility?.placeAccessibility?.id;
      if (placeAccessibilityId) {
        setIsUpvoted(!isUpvoted);
        setTotalUpvoteCount(prev => {
          const currentCount = prev ?? 0;
          return isUpvoted ? currentCount - 1 : currentCount + 1;
        });
        const success = await updateUpvoteStatus?.({
          id: placeAccessibilityId,
          newUpvotedStatus: !isUpvoted,
          targetType: 'PLACE_ACCESSIBILITY',
        });
        if (!success) {
          setIsUpvoted(isUpvoted);
        }
      }
    });
  };

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

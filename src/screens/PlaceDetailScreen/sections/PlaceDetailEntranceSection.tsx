import dayjs from 'dayjs';
import React from 'react';

import PlusIcon from '@/assets/icon/ic_plus.svg';
import {CommentBlock} from '@/components/molecules';
import {color} from '@/constant/color';
import {AccessibilityInfoDto, Place} from '@/generated-sources/openapi';
import useNavigation from '@/navigation/useNavigation';
import {useCheckAuth} from '@/utils/checkAuth';

import ImageList from '../components/PlaceDetailImageList';
import PlaceDoorInfo from '../components/PlaceDoorInfo';
import PlaceEntranceStepInfo from '../components/PlaceEntranceStepInfo';
import PlaceFloorInfo from '../components/PlaceFloorInfo';
import PlaceDetailCrusher from './PlaceDetailCrusher';
import * as S from './PlaceDetailEntranceSection.style';

interface Props {
  accessibility?: AccessibilityInfoDto;
  place: Place;
}

export default function PlaceDetailEntranceSection({
  accessibility,
  place,
}: Props) {
  const navigation = useNavigation();
  const checkAuth = useCheckAuth();

  if (!accessibility?.placeAccessibility) {
    return null;
  }

  const {images, registeredUserName, createdAt} =
    accessibility.placeAccessibility;
  const comments = accessibility.placeAccessibilityComments;

  function handlePressAddComment() {
    navigation.navigate('AddComment', {type: 'place', id: place.id});
  }

  return (
    <S.Section>
      <S.Row>
        <S.Title>매장 입구 정보</S.Title>
        <S.Updated>{dayjs(createdAt.value).format('YYYY. MM. DD')}</S.Updated>
      </S.Row>
      <ImageList images={images ?? []} />
      <PlaceFloorInfo accessibility={accessibility} />
      <PlaceEntranceStepInfo accessibility={accessibility} />
      <PlaceDoorInfo accessibility={accessibility} />
      <S.Comments>
        {comments.map(comment => (
          <CommentBlock key={comment.id} info={comment} />
        ))}
        <S.AddCommentButton
          onPress={() => checkAuth(() => handlePressAddComment())}>
          <PlusIcon width={12} height={12} color={color.blue60} />
          <S.AddCommentText>의견 추가하기</S.AddCommentText>
        </S.AddCommentButton>
      </S.Comments>
      <PlaceDetailCrusher
        crusherGroupIcon={
          accessibility.placeAccessibility?.challengeCrusherGroup?.icon
        }
        crusherName={registeredUserName}
      />
    </S.Section>
  );
}

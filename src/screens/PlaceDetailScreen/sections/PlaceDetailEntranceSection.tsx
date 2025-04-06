import dayjs from 'dayjs';
import React from 'react';

import PlusIcon from '@/assets/icon/ic_plus.svg';
import {SccButton} from '@/components/atoms';
import {CommentBlock} from '@/components/molecules';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
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
  isAccessibilityRegistrable?: boolean;
  onRegister?: () => void;
}

export default function PlaceDetailEntranceSection({
  accessibility,
  place,
  isAccessibilityRegistrable,
  onRegister,
}: Props) {
  const navigation = useNavigation();
  const checkAuth = useCheckAuth();

  const handlePressAddComment = () => {
    navigation.navigate('AddComment', {type: 'place', id: place.id});
  };

  return (
    <S.Section>
      <S.Row>
        <S.Title>매장 입구 정보</S.Title>
        {accessibility?.placeAccessibility?.createdAt && (
          <S.Updated>
            {dayjs(accessibility.placeAccessibility.createdAt.value).format(
              'YYYY. MM. DD',
            )}
          </S.Updated>
        )}
      </S.Row>
      <ImageList images={accessibility?.placeAccessibility?.images ?? []} />
      <PlaceFloorInfo accessibility={accessibility} />
      <PlaceEntranceStepInfo accessibility={accessibility} />
      <PlaceDoorInfo accessibility={accessibility} />
      {accessibility?.placeAccessibility ? (
        <S.Comments>
          {accessibility.placeAccessibilityComments.map(comment => (
            <CommentBlock key={comment.id} info={comment} />
          ))}
          <S.AddCommentButton
            onPress={() => checkAuth(() => handlePressAddComment())}>
            <PlusIcon width={12} height={12} color={color.blue60} />
            <S.AddCommentText>의견 추가하기</S.AddCommentText>
          </S.AddCommentButton>
        </S.Comments>
      ) : (
        <SccButton
          text={
            isAccessibilityRegistrable
              ? '정보 등록하기'
              : '서비스 지역이 아닙니다'
          }
          fontFamily={font.pretendardBold}
          isDisabled={!isAccessibilityRegistrable}
          onPress={onRegister}
        />
      )}
      {accessibility?.placeAccessibility && (
        <PlaceDetailCrusher
          crusherGroupIcon={
            accessibility.placeAccessibility.challengeCrusherGroup?.icon
          }
          crusherName={accessibility.placeAccessibility.registeredUserName}
        />
      )}
    </S.Section>
  );
}

import React from 'react';
import {Platform} from 'react-native';
import Toast from 'react-native-root-toast';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {ToiletReviewDto, Location} from '@/generated-sources/openapi';
import useNavigateWithLocationCheck from '@/hooks/useNavigateWithLocationCheck';
import useNavigation from '@/navigation/useNavigation';
import {useCheckAuth} from '@/utils/checkAuth';

import PlaceDetailPlaceToiletReviewItem from '../../PlaceDetailScreen/components/PlaceToiletReviewItem';
import {EmptyStateCard} from '../components/AccessibilityInfoComponents';

interface Props {
  toiletReviews: ToiletReviewDto[];
  placeId: string;
  placeName: string;
  placeLocation?: Location;
  placeAddress: string;
  isAccessibilityRegistrable?: boolean;
}

export default function V2RestroomTab({
  toiletReviews,
  placeId,
  placeName,
  placeLocation,
  placeAddress,
  isAccessibilityRegistrable: _isAccessibilityRegistrable,
}: Props) {
  const navigation = useNavigation();
  const checkAuth = useCheckAuth();
  const {navigateWithLocationCheck, LocationConfirmModal} =
    useNavigateWithLocationCheck();

  const handleToiletReviewPress = () => {
    if (Platform.OS === 'web') {
      Toast.show('준비 중입니다 💪', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
      return;
    }
    checkAuth(async () => {
      await navigateWithLocationCheck({
        targetLocation: placeLocation,
        placeName: placeName,
        address: placeAddress,
        type: 'place',
        onNavigate: () => {
          navigation.navigate('ReviewForm/Toilet', {
            placeId,
          });
        },
      });
    });
  };

  if (toiletReviews.length === 0) {
    return (
      <EmptyStateWrapper>
        <EmptyStateCard
          title={'아직 등록된 화장실 정보가 없어요🥲'}
          description={
            '장애인 화장실이 있었나요?\n정보를 등록해주시면 필요한 분들에게 큰 도움이 돼요.'
          }
          buttonText="장애인 화장실 정보 등록"
          onPress={handleToiletReviewPress}
          elementName="place_detail_restroom_tab_empty_register"
        />
        {LocationConfirmModal}
      </EmptyStateWrapper>
    );
  }

  return (
    <Container>
      <SectionContainer>
        <ItemList>
          {toiletReviews.map((review, idx) => (
            <React.Fragment key={review.id}>
              <PlaceDetailPlaceToiletReviewItem
                placeId={placeId}
                review={review}
              />
              {idx !== toiletReviews.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </ItemList>
      </SectionContainer>
      {LocationConfirmModal}
    </Container>
  );
}

const Container = styled.View`
  background-color: ${color.white};
`;

const SectionContainer = styled.View`
  padding-vertical: 32px;
  padding-horizontal: 20px;
  gap: 20px;
`;

const EmptyStateWrapper = styled.View`
  flex: 1;
  background-color: ${color.gray5};
  padding-top: 20px;
`;

const ItemList = styled.View`
  flex-direction: column;
  gap: 20px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${color.gray20};
`;


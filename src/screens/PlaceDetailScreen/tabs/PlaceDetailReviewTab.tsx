import React from 'react';
import {Platform, View} from 'react-native';
import Toast from 'react-native-root-toast';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {Place, PlaceReviewDto} from '@/generated-sources/openapi';
import useNavigateWithLocationCheck from '@/hooks/useNavigateWithLocationCheck';
import useNavigation from '@/navigation/useNavigation';
import {useCheckAuth} from '@/utils/checkAuth';

import PlaceIndoorInfo from '../components/PlaceIndoorInfo';
import PlaceReviewSummaryInfo from '../components/PlaceReviewSummaryInfo';
import PlaceVisitReviewInfo from '../components/PlaceVisitReviewInfo';

interface Props {
  reviews: PlaceReviewDto[];
  place: Place;
  isAccessibilityRegistrable?: boolean;
}

export default function PlaceDetailReviewTab({
  reviews,
  place,
  isAccessibilityRegistrable,
}: Props) {
  const navigation = useNavigation();
  const checkAuth = useCheckAuth();
  const {navigateWithLocationCheck, LocationConfirmModal} =
    useNavigateWithLocationCheck();

  const handleReviewPress = () => {
    if (Platform.OS === 'web') {
      Toast.show('준비 중입니다 💪', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
      return;
    }
    checkAuth(async () => {
      await navigateWithLocationCheck({
        targetLocation: place.location,
        placeName: place.name,
        address: place.address,
        type: 'place',
        onNavigate: () => {
          navigation.navigate('ReviewForm/Place', {
            placeId: place.id,
          });
        },
      });
    });
  };

  if (reviews.length === 0) {
    return (
      <EmptyContainer>
        <EmptyText>아직 등록된 방문 리뷰가 없습니다.</EmptyText>
        {isAccessibilityRegistrable && (
          <SccButton
            text="리뷰 작성하기"
            style={{borderRadius: 10}}
            fontSize={16}
            fontFamily={font.pretendardBold}
            onPress={handleReviewPress}
            elementName="place_detail_review_tab_write_empty"
          />
        )}
        {LocationConfirmModal}
      </EmptyContainer>
    );
  }

  return (
    <Container>
      <View
        style={{
          gap: 32,
          paddingVertical: 32,
          paddingHorizontal: 20,
        }}>
        <PlaceIndoorInfo reviews={reviews} />
        <Divider />
        <PlaceReviewSummaryInfo
          reviews={reviews}
          placeId={place.id}
          placeName={place.name}
          placeLocation={place.location}
          placeAddress={place.address}
        />
        <Divider />
        <PlaceVisitReviewInfo reviews={reviews} placeId={place.id} />
      </View>
      <BottomPadding />
      {LocationConfirmModal}
    </Container>
  );
}

const Container = styled.View`
  background-color: ${color.white};
`;

const EmptyContainer = styled.View`
  background-color: ${color.white};
  padding: 40px 20px;
  gap: 16px;
  align-items: center;
`;

const EmptyText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 14px;
  color: ${color.gray40};
  text-align: center;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${color.gray20};
`;

const BottomPadding = styled.View`
  height: 100px;
`;

import React from 'react';
import {Platform, View} from 'react-native';
import Toast from 'react-native-root-toast';
import styled from 'styled-components/native';

import PlusIcon from '@/assets/icon/ic_plus.svg';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
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
  isAccessibilityRegistrable: _isAccessibilityRegistrable,
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
      <EmptyStateContainer>
        <EmptyStateTextBlock>
          <EmptyStateTitle>
            {'아직 등록된  방문 리뷰가 없어요🥲'}
          </EmptyStateTitle>
          <EmptyStateDescription>
            {
              '장소 내부 리뷰는 공간 이용 여부를\n결정할 수 있는 중요한 정보에요!'
            }
          </EmptyStateDescription>
        </EmptyStateTextBlock>
        <EmptyStateCTAButton
          elementName="place_detail_review_tab_empty_write"
          onPress={handleReviewPress}>
          <PlusIcon width={20} height={20} color={color.brand40} />
          <EmptyStateCTAText>내부 리뷰 작성하기</EmptyStateCTAText>
        </EmptyStateCTAButton>
        {LocationConfirmModal}
      </EmptyStateContainer>
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

const EmptyStateContainer = styled.View`
  flex: 1;
  background-color: ${color.gray5};
  padding-top: 40px;
  padding-horizontal: 20px;
  padding-bottom: 20px;
  gap: 16px;
`;

const EmptyStateTextBlock = styled.View`
  gap: 8px;
  align-items: center;
`;

const EmptyStateTitle = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.gray80};
  text-align: center;
`;

const EmptyStateDescription = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 15px;
  line-height: 24px;
  letter-spacing: -0.3px;
  color: ${color.gray50};
  text-align: center;
`;

const EmptyStateCTAButton = styled(SccTouchableOpacity)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background-color: ${color.white};
  border-width: 1px;
  border-color: ${color.brand40};
  border-radius: 8px;
  padding-vertical: 12px;
  padding-horizontal: 28px;
`;

const EmptyStateCTAText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 16px;
  line-height: 24px;
  color: ${color.brand40};
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${color.gray20};
`;

const BottomPadding = styled.View`
  height: 100px;
`;

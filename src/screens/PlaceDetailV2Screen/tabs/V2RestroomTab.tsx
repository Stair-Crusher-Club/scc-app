import React from 'react';
import {Platform} from 'react-native';
import Toast from 'react-native-root-toast';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ToiletReviewDto, Location} from '@/generated-sources/openapi';
import useNavigateWithLocationCheck from '@/hooks/useNavigateWithLocationCheck';
import useNavigation from '@/navigation/useNavigation';
import {useCheckAuth} from '@/utils/checkAuth';

import PlaceDetailPlaceToiletReviewItem from '../../PlaceDetailScreen/components/PlaceToiletReviewItem';
import {StrokeCTAButton} from '../components/AccessibilityInfoComponents';

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
      <EmptyStateContainer>
        <EmptyStateTextBlock>
          <EmptyStateTitle>
            {'아직 등록된 화장실 정보가 없어요🥲'}
          </EmptyStateTitle>
          <EmptyStateDescription>
            {
              '장애인 화장실이 있었나요?\n정보를 등록해주시면 필요한 분들에게 큰 도움이 돼요.'
            }
          </EmptyStateDescription>
        </EmptyStateTextBlock>
        <StrokeCTAButton
          text="장애인 화장실 정보 등록"
          onPress={handleToiletReviewPress}
          elementName="place_detail_restroom_tab_empty_register"
        />
        {LocationConfirmModal}
      </EmptyStateContainer>
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
      <BottomPadding />
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

const ItemList = styled.View`
  flex-direction: column;
  gap: 20px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${color.gray20};
`;

const BottomPadding = styled.View`
  height: 100px;
`;

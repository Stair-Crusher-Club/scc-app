import React from 'react';
import {Platform} from 'react-native';
import Toast from 'react-native-root-toast';
import styled from 'styled-components/native';

import PlusIcon from '@/assets/icon/ic_plus.svg';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ToiletReviewDto, Location} from '@/generated-sources/openapi';
import useNavigateWithLocationCheck from '@/hooks/useNavigateWithLocationCheck';
import useNavigation from '@/navigation/useNavigation';
import {useCheckAuth} from '@/utils/checkAuth';

import PlaceDetailPlaceToiletReviewItem from '../components/PlaceToiletReviewItem';

interface Props {
  toiletReviews: ToiletReviewDto[];
  placeId: string;
  placeName: string;
  placeLocation?: Location;
  placeAddress: string;
  isAccessibilityRegistrable?: boolean;
}

export default function PlaceDetailRestroomTab({
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
        <EmptyStateCTAButton
          elementName="place_detail_restroom_tab_empty_register"
          onPress={handleToiletReviewPress}>
          <PlusIcon width={20} height={20} color={color.brand40} />
          <EmptyStateCTAText>장애인 화장실 정보 등록</EmptyStateCTAText>
        </EmptyStateCTAButton>
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
  letter-spacing: -0.32px;
  color: ${color.brand40};
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

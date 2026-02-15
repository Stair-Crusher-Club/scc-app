import React from 'react';
import {Platform} from 'react-native';
import Toast from 'react-native-root-toast';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
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
  isAccessibilityRegistrable,
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
      <EmptyContainer>
        <EmptyText>아직 등록된 장애인 화장실 정보가 없습니다.</EmptyText>
        {isAccessibilityRegistrable && (
          <SccButton
            text="화장실 정보 등록하기"
            style={{borderRadius: 10}}
            fontSize={16}
            fontFamily={font.pretendardBold}
            onPress={handleToiletReviewPress}
            elementName="place_detail_restroom_tab_write_empty"
          />
        )}
        {LocationConfirmModal}
      </EmptyContainer>
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

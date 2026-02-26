import React, {useMemo} from 'react';
import {Platform} from 'react-native';
import Toast from 'react-native-root-toast';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {Place, PlaceReviewDto} from '@/generated-sources/openapi';
import useNavigateWithLocationCheck from '@/hooks/useNavigateWithLocationCheck';
import useNavigation from '@/navigation/useNavigation';
import {useCheckAuth} from '@/utils/checkAuth';

import PlaceReviewSummaryInfo from '../../PlaceDetailScreen/components/PlaceReviewSummaryInfo';
import PlaceVisitReviewInfo from '../../PlaceDetailScreen/components/PlaceVisitReviewInfo';
import {EmptyStateCard} from '../components/AccessibilityInfoComponents';

interface Props {
  reviews: PlaceReviewDto[];
  place: Place;
  isAccessibilityRegistrable?: boolean;
}

export default function V2ReviewTab({
  reviews,
  place,
  isAccessibilityRegistrable: _isAccessibilityRegistrable,
}: Props) {
  const navigation = useNavigation();
  const checkAuth = useCheckAuth();
  const {navigateWithLocationCheck, LocationConfirmModal} =
    useNavigateWithLocationCheck();

  // 최신순 정렬
  const sortedReviews = useMemo(
    () =>
      [...reviews].sort(
        (a, b) => (b.createdAt?.value ?? 0) - (a.createdAt?.value ?? 0),
      ),
    [reviews],
  );

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
      <EmptyStateWrapper>
        <EmptyStateCard
          title={'아직 등록된 방문 리뷰가 없어요🥲'}
          description={
            '방문 리뷰는 공간 이용 여부를\n결정할 수 있는 중요한 정보에요!'
          }
          buttonText="방문 리뷰 작성하기"
          onPress={handleReviewPress}
          elementName="v2_review_tab_empty_write"
        />
        {LocationConfirmModal}
      </EmptyStateWrapper>
    );
  }

  return (
    <Container>
      <Section>
        <SectionTitle>방문 리뷰</SectionTitle>
      </Section>
      <Content>
        <PlaceReviewSummaryInfo
          reviews={sortedReviews}
          placeId={place.id}
          placeName={place.name}
          placeLocation={place.location}
          placeAddress={place.address}
          hideWriteButton
        />
        <Divider />
        <PlaceVisitReviewInfo reviews={sortedReviews} placeId={place.id} />
      </Content>
      {LocationConfirmModal}
    </Container>
  );
}

const Container = styled.View`
  background-color: ${color.white};
`;

const Section = styled.View`
  padding: 20px;
  gap: 16px;
`;

const SectionTitle = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.gray90};
`;

const Content = styled.View`
  padding: 20px;
  gap: 32px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${color.gray20};
`;

const EmptyStateWrapper = styled.View`
  flex: 1;
  background-color: ${color.gray5};
  padding-top: 20px;
`;

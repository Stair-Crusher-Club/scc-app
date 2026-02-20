import React from 'react';
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
import {StrokeCTAButton} from '../components/AccessibilityInfoComponents';

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
            {'아직 등록된 방문 리뷰가 없어요🥲'}
          </EmptyStateTitle>
          <EmptyStateDescription>
            {
              '장소 내부 리뷰는 공간 이용 여부를\n결정할 수 있는 중요한 정보에요!'
            }
          </EmptyStateDescription>
        </EmptyStateTextBlock>
        <StrokeCTAButton
          text="내부 리뷰 작성하기"
          onPress={handleReviewPress}
          elementName="v2_review_tab_empty_write"
        />
        {LocationConfirmModal}
      </EmptyStateContainer>
    );
  }

  return (
    <Container>
      <Section>
        <SectionTitle>방문 리뷰</SectionTitle>
      </Section>
      <Content>
        <PlaceReviewSummaryInfo
          reviews={reviews}
          placeId={place.id}
          placeName={place.name}
          placeLocation={place.location}
          placeAddress={place.address}
        />
        <Divider />
        <PlaceVisitReviewInfo reviews={reviews} placeId={place.id} />
      </Content>
      <BottomPadding />
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

const BottomPadding = styled.View`
  height: 100px;
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


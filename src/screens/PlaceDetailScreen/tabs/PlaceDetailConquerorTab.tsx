import React from 'react';
import styled from 'styled-components/native';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {AccessibilityInfoV2Dto} from '@/generated-sources/openapi';
import {useMe} from '@/atoms/Auth';

import PlaceDetailCrusher from '../sections/PlaceDetailCrusher';

interface Props {
  accessibility?: AccessibilityInfoV2Dto;
  onPressRegister?: () => void;
}

export default function PlaceDetailConquerorTab({
  accessibility,
  onPressRegister,
}: Props) {
  const {userInfo} = useMe();
  const nickname = userInfo?.nickname || '회원';

  const placeRegisteredUserName =
    accessibility?.placeAccessibility?.registeredUserName;
  const buildingRegisteredUserName =
    accessibility?.buildingAccessibility?.registeredUserName;

  const hasAnyInfo =
    !!accessibility?.placeAccessibility ||
    !!accessibility?.buildingAccessibility;

  if (!hasAnyInfo) {
    return (
      <EmptyStateContainer>
        <EmptyStateTextBlock>
          <EmptyStateTitle>이 장소의 정복자가 아직 없어요</EmptyStateTitle>
          <EmptyStateDescription>
            {`지금 바로 정보를 등록하시면\n${nickname}님이 첫번째 정복자 되실 수 있어요!`}
          </EmptyStateDescription>
        </EmptyStateTextBlock>
        <EmptyStateCTAButton
          elementName="place_detail_conqueror_tab_empty_register"
          onPress={onPressRegister}>
          <EmptyStateCTAIcon>🚩</EmptyStateCTAIcon>
          <EmptyStateCTAText>
            정보 등록하고 첫번째 정복자가 되기!
          </EmptyStateCTAText>
        </EmptyStateCTAButton>
      </EmptyStateContainer>
    );
  }

  return (
    <Container>
      {accessibility?.placeAccessibility && (
        <Section>
          <SectionTitle>매장 접근성 정복자</SectionTitle>
          <PlaceDetailCrusher
            crusherGroupIcon={
              accessibility.placeAccessibility.challengeCrusherGroup?.icon
            }
            crusherNames={
              placeRegisteredUserName ? [placeRegisteredUserName] : []
            }
          />
        </Section>
      )}

      {accessibility?.buildingAccessibility && (
        <>
          <Divider />
          <Section>
            <SectionTitle>건물 정보 정복자</SectionTitle>
            <PlaceDetailCrusher
              crusherGroupIcon={
                accessibility.buildingAccessibility.challengeCrusherGroup?.icon
              }
              crusherNames={
                buildingRegisteredUserName ? [buildingRegisteredUserName] : []
              }
            />
          </Section>
        </>
      )}

      <BottomPadding />
    </Container>
  );
}

const Container = styled.View`
  background-color: ${color.white};
`;

const Section = styled.View`
  padding-vertical: 24px;
  padding-horizontal: 20px;
  gap: 16px;
`;

const SectionTitle = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.gray80};
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

const EmptyStateCTAIcon = styled.Text`
  font-size: 20px;
`;

const EmptyStateCTAText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.brand40};
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${color.gray20};
  margin-horizontal: 20px;
`;

const BottomPadding = styled.View`
  height: 100px;
`;

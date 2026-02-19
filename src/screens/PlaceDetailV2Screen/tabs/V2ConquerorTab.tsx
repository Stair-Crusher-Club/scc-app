import React from 'react';
import {Image} from 'react-native';
import styled from 'styled-components/native';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {AccessibilityInfoV2Dto} from '@/generated-sources/openapi';
import {useMe} from '@/atoms/Auth';

interface CrusherItem {
  name: string;
  source: 'place' | 'building';
  challengeCrusherGroup?: {icon?: {imageUrl: string}};
}

interface Props {
  accessibility?: AccessibilityInfoV2Dto;
  onPressRegister?: () => void;
}

export default function V2ConquerorTab({
  accessibility,
  onPressRegister,
}: Props) {
  const {userInfo} = useMe();
  const nickname = userInfo?.nickname || '회원';

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
          elementName="v2_conqueror_tab_empty_register"
          onPress={onPressRegister}>
          <EmptyStateCTAIcon>🚩</EmptyStateCTAIcon>
          <EmptyStateCTAText>
            정보 등록하고 첫번째 정복자가 되기!
          </EmptyStateCTAText>
        </EmptyStateCTAButton>
      </EmptyStateContainer>
    );
  }

  const crushers: CrusherItem[] = [];
  if (accessibility?.placeAccessibility?.registeredUserName) {
    crushers.push({
      name: accessibility.placeAccessibility.registeredUserName,
      source: 'place',
      challengeCrusherGroup: accessibility.placeAccessibility
        .challengeCrusherGroup
        ? {icon: accessibility.placeAccessibility.challengeCrusherGroup.icon}
        : undefined,
    });
  }
  if (accessibility?.buildingAccessibility?.registeredUserName) {
    crushers.push({
      name: accessibility.buildingAccessibility.registeredUserName,
      source: 'building',
      challengeCrusherGroup: accessibility.buildingAccessibility
        .challengeCrusherGroup
        ? {icon: accessibility.buildingAccessibility.challengeCrusherGroup.icon}
        : undefined,
    });
  }

  return (
    <Container>
      {crushers.map((crusher, index) => (
        <React.Fragment key={`${crusher.source}-${index}`}>
          {index > 0 && <RowDivider />}
          <CrusherRow>
            <ProfileIcon />
            <UserName>{crusher.name}</UserName>
          </CrusherRow>
          {crusher.challengeCrusherGroup && (
            <B2BLabelContainer>
              {crusher.challengeCrusherGroup.icon && (
                <B2BIcon
                  source={{uri: crusher.challengeCrusherGroup.icon.imageUrl}}
                  resizeMode="contain"
                />
              )}
              <B2BText>이 계단뿌셔클럽과 함께했어요.</B2BText>
            </B2BLabelContainer>
          )}
        </React.Fragment>
      ))}
      <BottomPadding />
    </Container>
  );
}

// ──────────────── 스타일 ────────────────

const Container = styled.View`
  background-color: ${color.white};
`;

const CrusherRow = styled.View`
  padding-horizontal: 20px;
  min-height: 72px;
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const ProfileIcon = styled.View`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background-color: ${color.gray10};
  border-width: 1px;
  border-color: ${color.gray20};
`;

const UserName = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 15px;
  line-height: 22px;
  color: ${color.gray90};
`;

const RowDivider = styled.View`
  height: 1px;
  background-color: ${color.gray20};
`;

const B2BLabelContainer = styled.View`
  background-color: ${color.gray15};
  border-radius: 5px;
  height: 34px;
  margin-horizontal: 20px;
  margin-top: 0px;
  margin-bottom: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 2px;
`;

const B2BIcon = styled(Image)`
  height: 20px;
  width: 20px;
`;

const B2BText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 14px;
  line-height: 20px;
  color: #6a6a73;
`;

// Empty state
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

const BottomPadding = styled.View`
  height: 100px;
`;

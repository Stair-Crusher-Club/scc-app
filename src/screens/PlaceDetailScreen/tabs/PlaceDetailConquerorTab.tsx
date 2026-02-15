import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {AccessibilityInfoV2Dto} from '@/generated-sources/openapi';

import PlaceDetailCrusher from '../sections/PlaceDetailCrusher';

interface Props {
  accessibility?: AccessibilityInfoV2Dto;
}

export default function PlaceDetailConquerorTab({accessibility}: Props) {
  const placeRegisteredUserName =
    accessibility?.placeAccessibility?.registeredUserName;
  const buildingRegisteredUserName =
    accessibility?.buildingAccessibility?.registeredUserName;

  const hasAnyInfo =
    !!accessibility?.placeAccessibility ||
    !!accessibility?.buildingAccessibility;

  if (!hasAnyInfo) {
    return (
      <EmptyContainer>
        <EmptyText>아직 정복자가 없습니다.</EmptyText>
      </EmptyContainer>
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
  color: ${color.gray80};
`;

const EmptyContainer = styled.View`
  background-color: ${color.white};
  padding: 40px 20px;
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
  margin-horizontal: 20px;
`;

const BottomPadding = styled.View`
  height: 100px;
`;

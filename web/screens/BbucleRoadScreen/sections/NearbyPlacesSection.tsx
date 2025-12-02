import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, Linking, TextInput, useWindowDimensions } from 'react-native';
import styled from 'styled-components/native';

import SccRemoteImage from '@/components/SccRemoteImage';
import ImageUploader from '../components/ImageUploader';
import { useEditMode } from '../context/EditModeContext';
import { DESKTOP_BREAKPOINT } from '../constants/layout';

interface NearbyPlacesSectionProps {
  title: string;
  mapImageUrl: string;
  listImageUrl: string;
  naverListUrl?: string;
  morePlacesUrl?: string;
  sectionId?: string;
}

const DEFAULT_NAVER_LIST_URL = 'https://map.naver.com';
const DEFAULT_MORE_PLACES_URL = 'https://map.naver.com';

export default function NearbyPlacesSection({
  title,
  mapImageUrl,
  listImageUrl,
  naverListUrl = DEFAULT_NAVER_LIST_URL,
  morePlacesUrl = DEFAULT_MORE_PLACES_URL,
  sectionId,
}: NearbyPlacesSectionProps) {
  const editContext = useEditMode();
  const isEditMode = editContext?.isEditMode ?? false;
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= DESKTOP_BREAKPOINT;

  const handleNaverListPress = () => {
    Linking.openURL(naverListUrl);
  };

  const handleMorePlacesPress = () => {
    Linking.openURL(morePlacesUrl);
  };

  const updateNearbyPlacesSection = useCallback(
    (updates: Partial<NearbyPlacesSectionProps>) => {
      if (!editContext) return;
      editContext.updateData((prev) => ({
        ...prev,
        nearbyPlacesSection: prev.nearbyPlacesSection
          ? { ...prev.nearbyPlacesSection, ...updates }
          : null,
      }));
    },
    [editContext],
  );

  const handleMapImageChange = useCallback(
    (url: string) => {
      updateNearbyPlacesSection({ mapImageUrl: url });
    },
    [updateNearbyPlacesSection],
  );

  const handleListImageChange = useCallback(
    (url: string) => {
      updateNearbyPlacesSection({ listImageUrl: url });
    },
    [updateNearbyPlacesSection],
  );

  const handleTitleChange = useCallback(
    (text: string) => {
      updateNearbyPlacesSection({ title: text });
    },
    [updateNearbyPlacesSection],
  );

  return (
    <div id={sectionId}>
      <Container>
        <ContentWrapper>
        <TitleSection>
          <SubTitle>계뿌클 픽!</SubTitle>
          {isEditMode ? (
            <MainTitleInput
              value={title}
              onChangeText={handleTitleChange}
              placeholder="타이틀을 입력하세요"
              placeholderTextColor="#999"
            />
          ) : (
            <MainTitle>{title}</MainTitle>
          )}
        </TitleSection>

        {/* 지도 이미지 */}
        {mapImageUrl ? (
          <ImageContainer>
            <SccRemoteImage
              imageUrl={mapImageUrl}
              resizeMode="contain"
              style={{ borderRadius: 12 }}
            />
            {isEditMode && (
              <ImageOverlay>
                <ImageUploader
                  currentImageUrl={mapImageUrl}
                  onUploadComplete={handleMapImageChange}
                  compact
                />
              </ImageOverlay>
            )}
          </ImageContainer>
        ) : (
          isEditMode && (
            <EmptyImagePlaceholder>
              <EmptyImageText>지도 이미지를 업로드하세요</EmptyImageText>
              <ImageUploader
                onUploadComplete={handleMapImageChange}
                buttonText="이미지 업로드"
              />
            </EmptyImagePlaceholder>
          )
        )}

        {/* 장소 목록 이미지 */}
        {listImageUrl ? (
          <ImageContainer>
            <SccRemoteImage
              imageUrl={listImageUrl}
              resizeMode="contain"
              style={{ borderRadius: 12 }}
            />
            {isEditMode && (
              <ImageOverlay>
                <ImageUploader
                  currentImageUrl={listImageUrl}
                  onUploadComplete={handleListImageChange}
                  compact
                />
              </ImageOverlay>
            )}
          </ImageContainer>
        ) : (
          isEditMode && (
            <EmptyImagePlaceholder>
              <EmptyImageText>장소 목록 이미지를 업로드하세요</EmptyImageText>
              <ImageUploader
                onUploadComplete={handleListImageChange}
                buttonText="이미지 업로드"
              />
            </EmptyImagePlaceholder>
          )
        )}

        <ButtonContainer style={!isDesktop ? { flexDirection: 'column' } : undefined}>
          <PrimaryButton onPress={handleNaverListPress}>
            <PrimaryButtonText>네이버 리스트</PrimaryButtonText>
          </PrimaryButton>
          <PrimaryButton onPress={handleMorePlacesPress}>
            <PrimaryButtonText>더 많은 장소 확인하기</PrimaryButtonText>
          </PrimaryButton>
        </ButtonContainer>
        </ContentWrapper>
      </Container>
    </div>
  );
}

const Container = styled(View)`
  padding-top: 140px;
  width: 100%;
`;

const ContentWrapper = styled(View)`
  align-items: center;
  gap: 60px;
  width: 100%;
  padding: 0 16px;
`;

const TitleSection = styled(View)`
  align-items: center;
  gap: 20px;
  max-width: 800px;
  width: 100%;
`;

const SubTitle = styled(Text)`
  font-size: 24px;
  font-weight: 600;
  color: #0c76f7;
  text-align: center;
  letter-spacing: -0.456px;
`;

const MainTitle = styled(Text)`
  font-size: 40px;
  font-weight: 700;
  color: #000000;
  text-align: center;
  line-height: 54px;
`;

const MainTitleInput = styled(TextInput)`
  font-size: 40px;
  font-weight: 700;
  color: #000000;
  text-align: center;
  line-height: 54px;
  max-width: 800px;
  width: 100%;
`;

const ImageContainer = styled(View)`
  max-width: 1020px;
  width: 100%;
  position: relative;
`;

const ButtonContainer = styled(View)`
  flex-direction: row;
  gap: 16px;
  justify-content: center;
`;

const PrimaryButton = styled(TouchableOpacity)`
  padding: 16px 32px;
  border-radius: 100px;
  background-color: #0c76f7;
`;

const PrimaryButtonText = styled(Text)`
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
`;

const ImageOverlay = styled(View)`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
`;

const EmptyImagePlaceholder = styled(View)`
  max-width: 1020px;
  width: 100%;
  padding: 60px;
  background-color: #fff;
  border: 2px dashed #ddd;
  border-radius: 12px;
  align-items: center;
  gap: 16px;
`;

const EmptyImageText = styled(Text)`
  font-size: 16px;
  color: #666;
`;

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, Linking, TextInput } from 'react-native';
import styled from 'styled-components/native';

import SccRemoteImage from '@/components/SccRemoteImage';
import ImageUploader from '../components/ImageUploader';
import { useEditMode } from '../context/EditModeContext';

interface NearbyPlacesSectionProps {
  title: string;
  mapImageUrl: string;
  listImageUrl: string;
  naverListUrl?: string;
  morePlacesUrl?: string;
}

const DEFAULT_NAVER_LIST_URL = 'https://map.naver.com';
const DEFAULT_MORE_PLACES_URL = 'https://map.naver.com';

export default function NearbyPlacesSection({
  title,
  mapImageUrl,
  listImageUrl,
  naverListUrl = DEFAULT_NAVER_LIST_URL,
  morePlacesUrl = DEFAULT_MORE_PLACES_URL,
}: NearbyPlacesSectionProps) {
  const editContext = useEditMode();
  const isEditMode = editContext?.isEditMode ?? false;

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

        <ButtonContainer>
          <PrimaryButton onPress={handleNaverListPress}>
            <PrimaryButtonText>네이버 리스트</PrimaryButtonText>
          </PrimaryButton>
          <PrimaryButton onPress={handleMorePlacesPress}>
            <PrimaryButtonText>더 많은 장소 확인하기</PrimaryButtonText>
          </PrimaryButton>
        </ButtonContainer>
      </ContentWrapper>
    </Container>
  );
}

const Container = styled(View)`
  background-color: #f7f8fa;
  padding-top: 140px;
  width: 100%;
`;

const ContentWrapper = styled(View)`
  align-items: center;
  gap: 60px;
  width: 100%;
`;

const TitleSection = styled(View)`
  align-items: center;
  gap: 20px;
  width: 800px;
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
  width: 800px;
`;

const ImageContainer = styled(View)`
  width: 1020px;
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
  width: 1020px;
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

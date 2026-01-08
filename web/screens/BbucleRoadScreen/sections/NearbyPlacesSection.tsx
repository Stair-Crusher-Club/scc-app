import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image } from 'react-native';
import styled from 'styled-components/native';

import { SccPressable } from '@/components/atoms';
import SccRemoteImage from '@/components/SccRemoteImage';
import { color } from '@/constant/color';
import IcOutWhite from '@/assets/icon/ic_out_white.svg';
import ImageUploader from '../components/ImageUploader';
import { useEditMode } from '../context/EditModeContext';
import { useResponsive } from '../context/ResponsiveContext';
import type { NearbyPlacesSectionData, NearbyPlaceData } from '../config/bbucleRoadData';

interface NearbyPlacesSectionProps {
  nearbyPlacesSection: NearbyPlacesSectionData;
  sectionId?: string;
}

const DEFAULT_NAVER_LIST_URL = 'https://map.naver.com';
const DEFAULT_MORE_PLACES_URL = 'https://map.naver.com';

// URL 열기 (딥링크/웹링크 모두 지원, iOS Safari 호환)
const openUrl = (url: string) => {
  const link = document.createElement('a');
  link.href = url;
  // 웹 링크는 새 탭에서 열기
  if (url.startsWith('http://') || url.startsWith('https://')) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/** 접근레벨별 색상 설정 */
const ACCESS_LEVEL_COLORS: Record<number, { background: string; text: string }> = {
  0: { background: '#e6f5ec', text: '#06903b' },
  1: { background: '#f0f9e7', text: '#6ac40f' },
  2: { background: '#fff8e0', text: '#ffc109' },
  3: { background: '#ffefe0', text: '#ff8c00' },
  4: { background: '#ffe8e8', text: '#e52123' },
  5: { background: '#f0e8ff', text: '#8b00ff' },
};

const getAccessLevelColors = (level: number) => {
  return ACCESS_LEVEL_COLORS[level] ?? ACCESS_LEVEL_COLORS[0];
};

/** 장소 카드 컴포넌트 */
function PlaceCard({
  place,
  isDesktop,
}: {
  place: NearbyPlaceData;
  isDesktop: boolean;
}) {
  const imageUrlsToRender = [...place.imageUrls, null, null, null].slice(0, 3)
  const levelColors = getAccessLevelColors(place.accessLevel);

  return (
    <CardContainer isDesktop={isDesktop}>
      <CardContent isDesktop={isDesktop}>
        {/* 상단 콘텐츠: 배지 + 장소정보 (flex: 1로 남은 공간 차지) */}
        <TopContent isDesktop={isDesktop}>
          {/* 접근레벨 태그 */}
          <AccessLevelBadge backgroundColor={levelColors.background}>
            <AccessLevelText textColor={levelColors.text}>접근레벨 {place.accessLevel}</AccessLevelText>
          </AccessLevelBadge>

          {/* 장소 정보 */}
          <PlaceInfo>
            <PlaceName>{place.name}</PlaceName>
            <PlaceAddress>{place.address}</PlaceAddress>
            <PlaceHours>{place.businessHours}</PlaceHours>

            {/* 접근성 태그들 */}
            <TagsContainer>
              {place.tags.map((tag, idx) => (
                <Tag key={idx}>
                  <TagText>{tag}</TagText>
                </Tag>
              ))}
            </TagsContainer>
          </PlaceInfo>
        </TopContent>

        {/* 이미지 3개 (항상 하단에 고정) */}
        <ImagesRow isDesktop={isDesktop}>
          {imageUrlsToRender.map((url, idx) => (
            url != null
              ? (
                <PlaceImageWrapper key={idx} isDesktop={isDesktop}>
                  <PlaceImage source={{ uri: url }} resizeMode="cover" />
                </PlaceImageWrapper>
              )
              : (
                <PlaceImageWrapper key={idx} isDesktop={isDesktop}>
                  <DummyImage />
                </PlaceImageWrapper>
              )
          ))}
        </ImagesRow>
      </CardContent>
    </CardContainer>
  );
}

export default function NearbyPlacesSection({
  nearbyPlacesSection,
  sectionId,
}: NearbyPlacesSectionProps) {
  const editContext = useEditMode();
  const isEditMode = editContext?.isEditMode ?? false;
  const { isDesktop } = useResponsive();
  const iconSize = isDesktop ? 24 : 18;

  const {
    titleLine1,
    titleLine2,
    mapImageUrl,
    mobileMapImageUrl,
    places = [],
    naverListUrl = DEFAULT_NAVER_LIST_URL,
    morePlacesUrl = DEFAULT_MORE_PLACES_URL,
    wheelchairUserTipHtml,
  } = nearbyPlacesSection;

  const handleNaverListPress = useCallback(() => {
    openUrl(naverListUrl);
  }, [naverListUrl]);

  const handleMorePlacesPress = useCallback(() => {
    openUrl(morePlacesUrl);
  }, [morePlacesUrl]);

  const updateNearbyPlacesSection = useCallback(
    (updates: Partial<NearbyPlacesSectionData>) => {
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

  const handleMobileMapImageChange = useCallback(
    (url: string) => {
      updateNearbyPlacesSection({ mobileMapImageUrl: url });
    },
    [updateNearbyPlacesSection],
  );

  const handleTitleLine1Change = useCallback(
    (text: string) => {
      updateNearbyPlacesSection({ titleLine1: text });
    },
    [updateNearbyPlacesSection],
  );

  const handleTitleLine2Change = useCallback(
    (text: string) => {
      updateNearbyPlacesSection({ titleLine2: text });
    },
    [updateNearbyPlacesSection],
  );

  return (
    <div id={sectionId}>
      <Container isDesktop={isDesktop}>
        <ContentWrapper isDesktop={isDesktop}>
          <TitleSection>
            <SubTitle isDesktop={isDesktop}>계뿌클 픽!</SubTitle>
            {isEditMode ? (
              <>
                <TitleLine1Input
                  value={titleLine1}
                  onChangeText={handleTitleLine1Change}
                  placeholder="타이틀 1줄 (검정)"
                  placeholderTextColor={color.gray40}
                  isDesktop={isDesktop}
                />
                <TitleLine2Input
                  value={titleLine2}
                  onChangeText={handleTitleLine2Change}
                  placeholder="타이틀 2줄 (파랑)"
                  placeholderTextColor={color.gray40}
                  isDesktop={isDesktop}
                />
              </>
            ) : (
              <>
                <TitleLine1 isDesktop={isDesktop}>{titleLine1}</TitleLine1>
                <TitleLine2 isDesktop={isDesktop}>{titleLine2}</TitleLine2>
              </>
            )}
          </TitleSection>

          {/* 지도 이미지 - 모바일에서 mobileMapImageUrl이 있으면 사용 */}
          {(() => {
            const activeMapImageUrl = !isDesktop && mobileMapImageUrl ? mobileMapImageUrl : mapImageUrl;
            const activeHandler = !isDesktop && mobileMapImageUrl ? handleMobileMapImageChange : handleMapImageChange;

            return activeMapImageUrl ? (
              <MapImageContainer isDesktop={isDesktop}>
                {isEditMode ? (
                  <>
                    <SccRemoteImage
                      imageUrl={activeMapImageUrl}
                      resizeMode="contain"
                      style={{ borderRadius: 12 }}
                    />
                    <ImageOverlay>
                      <ImageUploader
                        currentImageUrl={activeMapImageUrl}
                        onUploadComplete={activeHandler}
                        compact
                      />
                    </ImageOverlay>
                  </>
                ) : (
                  <TouchableOpacity onPress={handleMorePlacesPress} activeOpacity={0.8}>
                    <SccRemoteImage
                      imageUrl={activeMapImageUrl}
                      resizeMode="contain"
                      style={{ borderRadius: 12 }}
                    />
                  </TouchableOpacity>
                )}
              </MapImageContainer>
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
            );
          })()}

          {/* Edit Mode: 모바일 이미지 관리 (데스크탑에서 편집 시) */}
          {isEditMode && isDesktop && (
            <MobileImageSection>
              <MobileImageLabel>모바일용 지도 이미지 (선택사항)</MobileImageLabel>
              {mobileMapImageUrl ? (
                <MobileImagePreview>
                  <SccRemoteImage
                    imageUrl={mobileMapImageUrl}
                    resizeMode="contain"
                    style={{ borderRadius: 8, maxHeight: 200 }}
                    wrapperBackgroundColor={null}
                  />
                  <MobileImageActions>
                    <ImageUploader
                      currentImageUrl={mobileMapImageUrl}
                      onUploadComplete={handleMobileMapImageChange}
                      compact
                    />
                  </MobileImageActions>
                </MobileImagePreview>
              ) : (
                <ImageUploader
                  onUploadComplete={handleMobileMapImageChange}
                  buttonText="모바일 이미지 업로드"
                />
              )}
            </MobileImageSection>
          )}

          {/* 장소 카드 목록 */}
          {places.length > 0 && <PlacesContainer isDesktop={isDesktop}>
            {places.map((place, index) => (
              <React.Fragment key={place.id}>
                <PlaceCard place={place} isDesktop={isDesktop} />
                {/* 모바일에서만 구분선 */}
                {!isDesktop && index < places.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </PlacesContainer>}

          <ButtonContainer isDesktop={isDesktop}>
            <NaverListButton
              as={SccPressable}
              isDesktop={isDesktop}
              onPress={handleNaverListPress}
              elementName="bbucle-road-naver-list"
              logParams={{ url: naverListUrl, isDesktop }}
              disableLogging={isEditMode}
            >
              <NaverListButtonText isDesktop={isDesktop}>네이버 지도로 모아보기</NaverListButtonText>
            </NaverListButton>
            <PrimaryButton
              as={SccPressable}
              isDesktop={isDesktop}
              onPress={handleMorePlacesPress}
              elementName="bbucle-road-nearby-more"
              logParams={{ url: morePlacesUrl, isDesktop }}
              disableLogging={isEditMode}
            >
              <PrimaryButtonText isDesktop={isDesktop}>접근성 정보 자세히보기</PrimaryButtonText>
              <IcOutWhite width={iconSize} height={iconSize} viewBox="0 0 24 24" style={{'margin-left': '-6px'}} />
            </PrimaryButton>
          </ButtonContainer>

          {/* 이미 다녀온 휠체어 사용자의 후기 팁 박스 (optional) */}
          {wheelchairUserTipHtml && (
            <WheelchairUserTipBox isDesktop={isDesktop}>
              <WheelchairUserTipTitle isDesktop={isDesktop}>
                이미 다녀온 휠체어 사용자의 후기🦽
              </WheelchairUserTipTitle>
              <WheelchairUserTipContent isDesktop={isDesktop}>
                <div dangerouslySetInnerHTML={{ __html: wheelchairUserTipHtml }} />
              </WheelchairUserTipContent>
            </WheelchairUserTipBox>
          )}
        </ContentWrapper>
      </Container>
    </div>
  );
}

const Container = styled(View)<{ isDesktop: boolean }>`
  padding-vertical: ${({ isDesktop }) => (isDesktop ? '140px' : '80px')};
  width: 100%;
  background-color: ${color.gray10};
`;

const ContentWrapper = styled(View)<{ isDesktop: boolean }>`
  align-items: center;
  gap: ${({ isDesktop }) => (isDesktop ? '60px' : '40px')};
  width: 100%;
  max-width: 1020px;
  padding: 0 16px;
  align-self: center;
`;

const TitleSection = styled(View)`
  align-items: center;
  gap: 0;
  max-width: 800px;
  width: 100%;
  padding: 0 16px;
`;

const SubTitle = styled(Text)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '24px' : '18px')};
  font-weight: 600;
  color: ${color.brand40};
  text-align: center;
  letter-spacing: -0.456px;
  margin-bottom: 20px;
`;

const TitleLine1 = styled(Text)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '40px' : '24px')};
  font-weight: 700;
  color: ${color.black};
  text-align: center;
  line-height: ${({ isDesktop }) => (isDesktop ? '54px' : '34px')};
`;

const TitleLine2 = styled(Text)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '40px' : '24px')};
  font-weight: 700;
  color: #0e64d3;
  text-align: center;
  line-height: ${({ isDesktop }) => (isDesktop ? '54px' : '34px')};
`;

const TitleLine1Input = styled(TextInput)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '40px' : '24px')};
  font-weight: 700;
  color: ${color.black};
  text-align: center;
  width: 100%;
`;

const TitleLine2Input = styled(TextInput)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '40px' : '24px')};
  font-weight: 700;
  color: #0e64d3;
  text-align: center;
  width: 100%;
`;

const MapImageContainer = styled(View)<{ isDesktop: boolean }>`
  max-width: 1020px;
  width: ${({ isDesktop }) => (isDesktop ? '100%' : 'calc(100% + 32px)')};
  margin-horizontal: ${({ isDesktop }) => (isDesktop ? '0' : '-16px')};
  position: relative;
`;

/* 장소 카드 목록 컨테이너 */
const PlacesContainer = styled(View)<{ isDesktop: boolean }>`
  display: flex;
  flex-direction: ${({ isDesktop }) => (isDesktop ? 'row' : 'column')};
  flex-wrap: ${({ isDesktop }) => (isDesktop ? 'wrap' : 'nowrap')};
  gap: 20px;
  justify-content: center;
  width: 100%;
`;

/* 장소 카드 */
const CardContainer = styled(View)<{ isDesktop: boolean }>`
  background-color: ${({ isDesktop }) => (isDesktop ? color.white : 'transparent')};
  border-radius: ${({ isDesktop }) => (isDesktop ? '14px' : '0')};
  padding: ${({ isDesktop }) => (isDesktop ? '14px' : '0')};
  overflow: hidden;
  width: ${({ isDesktop }) => (isDesktop ? 'auto' : '100%')};
  ${({ isDesktop }) => isDesktop && 'flex: 1; height: 280px;'}
`;

const CardContent = styled(View)<{ isDesktop: boolean }>`
  ${({ isDesktop }) => isDesktop && 'flex: 1;'}
  gap: 8px;
`;

const TopContent = styled(View)<{ isDesktop: boolean }>`
  ${({ isDesktop }) => isDesktop && 'flex: 1;'}
  gap: 8px;
`;

/* 접근레벨 배지 */
const AccessLevelBadge = styled(View)<{ backgroundColor: string }>`
  background-color: ${({ backgroundColor }) => backgroundColor};
  border-radius: 6px;
  padding: 4px 6px;
  align-self: flex-start;
`;

const AccessLevelText = styled(Text)<{ textColor: string }>`
  font-family: Pretendard;
  font-size: 12px;
  font-weight: 500;
  color: ${({ textColor }) => textColor};
  line-height: 15.6px;
`;

/* 장소 정보 */
const PlaceInfo = styled(View)`
  gap: 4px;
`;

const PlaceName = styled(Text)`
  font-family: Pretendard;
  font-size: 16px;
  font-weight: 600;
  color: ${color.black};
  line-height: 20.8px;
`;

const PlaceAddress = styled(Text)`
  font-family: Pretendard;
  font-size: 12px;
  font-weight: 400;
  color: #6a6a73;
  line-height: 14.4px;
`;

const PlaceHours = styled(Text)`
  font-family: Pretendard;
  font-size: 13px;
  font-weight: 400;
  color: #3a3c45;
  line-height: 18px;
  margin-top: 4px;
`;

/* 태그 */
const TagsContainer = styled(View)`
  flex-direction: row;
  gap: 6px;
  margin-top: 4px;
`;

const Tag = styled(View)`
  background-color: #eff6ff;
  border-radius: 4px;
  padding: 4px;
`;

const TagText = styled(Text)`
  font-family: Pretendard;
  font-size: 10px;
  font-weight: 400;
  color: #6a6a73;
  line-height: 12px;
`;

/* 이미지 목록 */
const ImagesRow = styled(View)<{ isDesktop: boolean }>`
  flex-direction: row;
  gap: 4px;
  height: ${({ isDesktop }) => (isDesktop ? '95px' : '100px')};
  margin-top: 4px;
`;

const PlaceImageWrapper = styled(View)<{ isDesktop: boolean }>`
  flex: 1;
  height: 100%;
  border-radius: 4px;
  overflow: hidden;
  background-color: #d9d9d9;
`;

const PlaceImage = styled(Image)`
  width: 100%;
  height: 100%;
`;

const DummyImage = styled(Image)`
  width: 100%;
  height: 100%;
`;

/* 구분선 (모바일용) */
const Divider = styled(View)`
  height: 1px;
  background-color: #eff0f2;
  width: 100%;
`;

const ButtonContainer = styled(View)<{ isDesktop: boolean }>`
  flex-direction: ${({ isDesktop }) => (isDesktop ? 'row' : 'column')};
  gap: ${({ isDesktop }) => (isDesktop ? '16px' : '8px')};
  justify-content: center;
  width: ${({ isDesktop }) => (isDesktop ? 'auto' : '100%')};
`;

const NaverListButton = styled(TouchableOpacity)<{ isDesktop: boolean }>`
  display: flex;
  ${({ isDesktop }) => (isDesktop ? '' : 'width: 100%')};
  padding-vertical: ${({ isDesktop }) => (isDesktop ? '20px' : '12px')};
  padding-horizontal: ${({ isDesktop }) => (isDesktop ? '40px' : 'auto')};
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 100px;
  border: 1px solid ${color.brand40};
  background-color: ${color.white};
`;

const NaverListButtonText = styled(Text)<{ isDesktop: boolean }>`
  text-align: center;
  font-family: ${({ isDesktop }) => (isDesktop ? 'Pretendard-Bold' : 'Pretendard-Medium')};
  font-size: ${({ isDesktop }) => (isDesktop ? '20px' : '16px')};
  color: #0e64d3;
  letter-spacing: -0.36px;
  line-height: ${({ isDesktop }) => (isDesktop ? '28px' : '24px')};
`;

const PrimaryButton = styled(TouchableOpacity)<{ isDesktop: boolean }>`
  display: flex;
  flex-direction: row;
  ${({ isDesktop }) => (isDesktop ? '' : 'width: 100%')};
  padding-vertical: ${({ isDesktop }) => (isDesktop ? '20px' : '12px')};
  padding-horizontal: ${({ isDesktop }) => (isDesktop ? '40px' : 'auto')};
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 100px;
  background-color: ${color.brand40};
`;

const PrimaryButtonText = styled(Text)<{ isDesktop: boolean }>`
  text-align: center;
  font-family: ${({ isDesktop }) => (isDesktop ? 'Pretendard-SemiBold' : 'Pretendard-Medium')};
  font-weight: 600;
  font-size: ${({ isDesktop }) => (isDesktop ? '20px' : '16px')};;
  line-height: ${({ isDesktop }) => (isDesktop ? '28px' : '24px')};;
  color: ${color.white};
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
  background-color: ${color.white};
  border: 2px dashed ${color.gray25};
  border-radius: 12px;
  align-items: center;
  gap: 16px;
`;

const EmptyImageText = styled(Text)`
  font-family: Pretendard;
  font-size: 16px;
  color: ${color.gray60};
`;

/* 모바일 이미지 관리 섹션 (데스크탑 Edit Mode) */
const MobileImageSection = styled(View)`
  max-width: 1020px;
  width: 100%;
  padding: 20px;
  background-color: ${color.gray10};
  border-radius: 12px;
  gap: 12px;
`;

const MobileImageLabel = styled(Text)`
  font-family: Pretendard;
  font-size: 14px;
  font-weight: 600;
  color: ${color.gray80};
`;

const MobileImagePreview = styled(View)`
  position: relative;
  max-width: 400px;
`;

const MobileImageActions = styled(View)`
  position: absolute;
  top: 8px;
  right: 8px;
`;

/* 휠체어 사용자 팁 박스 */
const WheelchairUserTipBox = styled(View)<{ isDesktop: boolean }>`
  background-color: ${color.white};
  border-radius: 4px;
  padding: 16px;
  gap: 6px;
  width: ${({ isDesktop }) => (isDesktop ? '100%' : '100%')};
`;

const WheelchairUserTipTitle = styled(Text)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: 15px;
  font-weight: 700;
  line-height: 24px;
  color: #0e64d3;
`;

const WheelchairUserTipContent = styled(View)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: 15px;
  font-weight: 400;
  line-height: 26px;
  color: #24262b;
`;

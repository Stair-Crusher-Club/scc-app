import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import styled from 'styled-components/native';
import type {
  BbucleRoadRouteSectionDto,
  BbucleRoadRouteDto,
  BbucleRoadClickableRegionDto,
  BbucleRoadRouteIconTypeDto,
} from '@/generated-sources/openapi';
import type { ExtendedRouteDto } from '../config/bbucleRoadData';

import { color } from '@/constant/color';
import Logger from '@/logging/Logger';
import SccRemoteImage from '@/components/SccRemoteImage';
import HtmlContentWrapper from '../components/HtmlContentWrapper';
import InteractiveImage from '../components/InteractiveImage';
import RegionDetailModal from '../components/RegionDetailModal';
import ImageUploader from '../components/ImageUploader';
import { useEditMode } from '../context/EditModeContext';
import { useResponsive } from '../context/ResponsiveContext';

// Extended routeSection with descriptionHtml and two-line title support
interface ExtendedRouteSectionDto extends Omit<BbucleRoadRouteSectionDto, 'routes' | 'title'> {
  titleLine1: string;
  titleLine2: string;
  routes: ExtendedRouteDto[];
}

interface RouteSectionProps {
  routeSection: ExtendedRouteSectionDto;
  sectionId?: string;
}

const ICON_MAP: Record<BbucleRoadRouteIconTypeDto, string> = {
  SUBWAY: '🚇',
  TAXI: '🚕',
  CAR: '🚗',
  BUS: '🚌',
};

const ICON_OPTIONS: BbucleRoadRouteIconTypeDto[] = ['SUBWAY', 'TAXI', 'CAR', 'BUS'];

export default function RouteSection({ routeSection, sectionId }: RouteSectionProps) {
  const editContext = useEditMode();
  const isEditMode = editContext?.isEditMode ?? false;
  const { isDesktop } = useResponsive();

  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [selectedRegion, setSelectedRegion] =
    useState<BbucleRoadClickableRegionDto | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const selectedRoute = routeSection.routes[selectedRouteIndex];

  const handleTabPress = useCallback((index: number, route: ExtendedRouteDto) => {
    // View mode에서만 로깅
    if (!isEditMode) {
      Logger.logElementClick({
        name: 'bbucle-road-route-tab',
        currScreenName: 'BbucleRoad',
        extraParams: {
          tabIndex: index,
          tabLabel: route.tabLabel,
          tabIconType: route.tabIconType,
          isDesktop,
        },
      });
    }
    setSelectedRouteIndex(index);
  }, [isEditMode]);

  const handleRegionPress = useCallback(
    (region: BbucleRoadClickableRegionDto) => {
      setSelectedRegion(region);
      setIsModalVisible(true);
    },
    [],
  );

  const handleModalClose = useCallback(() => {
    setIsModalVisible(false);
    setSelectedRegion(null);
  }, []);

  // Edit mode handlers
  const updateRouteSection = useCallback(
    (updater: (prev: BbucleRoadRouteSectionDto) => BbucleRoadRouteSectionDto) => {
      if (!editContext) return;
      editContext.updateData((prev) => ({
        ...prev,
        routeSection: updater(prev.routeSection!),
      }));
    },
    [editContext],
  );

  const handleAddRoute = useCallback(() => {
    const newRoute: ExtendedRouteDto = {
      id: `route-${Date.now()}`,
      tabLabel: '새 동선',
      tabIconType: 'SUBWAY',
      descriptionImageUrl: '',
      descriptionHtml: '',
      interactiveImage: {
        url: '',
        clickableRegions: [],
      },
    };

    updateRouteSection((prev) => ({
      ...prev,
      routes: [...prev.routes, newRoute],
    }));

    // 새 탭으로 이동
    setSelectedRouteIndex(routeSection.routes.length);
  }, [updateRouteSection, routeSection.routes.length]);

  const handleDeleteRoute = useCallback(
    (index: number) => {
      if (routeSection.routes.length <= 1) {
        alert('최소 1개의 동선이 필요합니다.');
        return;
      }

      updateRouteSection((prev) => ({
        ...prev,
        routes: prev.routes.filter((_, i) => i !== index),
      }));

      // 선택된 탭 조정
      if (selectedRouteIndex >= routeSection.routes.length - 1) {
        setSelectedRouteIndex(Math.max(0, selectedRouteIndex - 1));
      }
    },
    [updateRouteSection, routeSection.routes.length, selectedRouteIndex],
  );

  const handleUpdateRoute = useCallback(
    (index: number, updates: Partial<BbucleRoadRouteDto>) => {
      updateRouteSection((prev) => ({
        ...prev,
        routes: prev.routes.map((route, i) =>
          i === index ? { ...route, ...updates } : route,
        ),
      }));
    },
    [updateRouteSection],
  );

  const handleDescriptionImageChange = useCallback(
    (url: string) => {
      handleUpdateRoute(selectedRouteIndex, { descriptionImageUrl: url });
    },
    [handleUpdateRoute, selectedRouteIndex],
  );

  const handleInteractiveImageChange = useCallback(
    (url: string) => {
      handleUpdateRoute(selectedRouteIndex, {
        interactiveImage: {
          ...selectedRoute.interactiveImage,
          url,
        },
      });
    },
    [handleUpdateRoute, selectedRouteIndex, selectedRoute?.interactiveImage],
  );

  // Region 변경은 이제 EditModeContext에서 처리됨

  const handleTabLabelChange = useCallback(
    (index: number, label: string) => {
      handleUpdateRoute(index, { tabLabel: label });
    },
    [handleUpdateRoute],
  );

  const handleIconTypeChange = useCallback(
    (index: number, iconType: BbucleRoadRouteIconTypeDto) => {
      handleUpdateRoute(index, { tabIconType: iconType });
    },
    [handleUpdateRoute],
  );

  return (
    <div id={sectionId}>
      <Container isDesktop={isDesktop}>
        <TitleSection>
          {isEditMode ? (
            <>
              <TitleLine1Input
                value={routeSection.titleLine1 ?? ''}
                onChangeText={(text) => updateRouteSection((prev) => ({ ...prev, titleLine1: text }))}
                placeholder="타이틀 1줄 (검정)"
                placeholderTextColor={color.gray40}
                isDesktop={isDesktop}
              />
              <TitleLine2Input
                value={routeSection.titleLine2 ?? ''}
                onChangeText={(text) => updateRouteSection((prev) => ({ ...prev, titleLine2: text }))}
                placeholder="타이틀 2줄 (파랑)"
                placeholderTextColor={color.gray40}
                isDesktop={isDesktop}
              />
            </>
          ) : (
            <>
              <TitleLine1 isDesktop={isDesktop}>{routeSection.titleLine1}</TitleLine1>
              <TitleLine2 isDesktop={isDesktop}>{routeSection.titleLine2}</TitleLine2>
            </>
          )}
        </TitleSection>

      {/* Tabs */}
      <TabsContainer isDesktop={isDesktop} horizontal showsHorizontalScrollIndicator={false}>
        {routeSection.routes.map((route, index) => (
          <TabWrapper key={route.id}>
            <TabButton
              isDesktop={isDesktop}
              active={index === selectedRouteIndex}
              onPress={() => handleTabPress(index, route)}
            >
              {isEditMode ? (
                <IconSelector
                  onPress={() => {
                    const currentIndex = ICON_OPTIONS.indexOf(route.tabIconType);
                    const nextIndex = (currentIndex + 1) % ICON_OPTIONS.length;
                    handleIconTypeChange(index, ICON_OPTIONS[nextIndex]);
                  }}
                >
                  <TabIcon>{ICON_MAP[route.tabIconType]}</TabIcon>
                </IconSelector>
              ) : (
                <TabIcon>{ICON_MAP[route.tabIconType]}</TabIcon>
              )}
              {isEditMode ? (
                <TabLabelInput
                  value={route.tabLabel}
                  onChangeText={(text) => handleTabLabelChange(index, text)}
                />
              ) : (
                <TabLabel>
                  {route.tabLabel}
                </TabLabel>
              )}
            </TabButton>
            {isEditMode && (
              <TabDeleteButton onPress={() => handleDeleteRoute(index)}>
                <TabDeleteButtonText>×</TabDeleteButtonText>
              </TabDeleteButton>
            )}
          </TabWrapper>
        ))}

        {/* Add Tab Button */}
        {isEditMode && (
          <AddTabButton onPress={handleAddRoute}>
            <AddTabButtonText>+</AddTabButtonText>
          </AddTabButton>
        )}
      </TabsContainer>

      {/* Content */}
      {selectedRoute && (
        <ContentContainer isDesktop={isDesktop}>
          {/* Description HTML */}
          <DescriptionHtmlContainer isDesktop={isDesktop}>
            {selectedRoute.descriptionHtml ? (
              <HtmlContentWrapper isDesktop={isDesktop}>
                <div
                  dangerouslySetInnerHTML={{ __html: selectedRoute.descriptionHtml }}
                />
              </HtmlContentWrapper>
            ) : selectedRoute.descriptionImageUrl ? (
              <DescriptionImageWrapper>
                <SccRemoteImage
                  imageUrl={selectedRoute.descriptionImageUrl}
                  resizeMode="contain"
                  style={{ borderRadius: 8 }}
                />
              </DescriptionImageWrapper>
            ) : null}
          </DescriptionHtmlContainer>

          {/* Interactive Map Image */}
          <InteractiveImageContainer isDesktop={isDesktop}>
            {selectedRoute.interactiveImage.url ? (
              <InteractiveImage
                interactiveImage={selectedRoute.interactiveImage}
                onRegionPress={handleRegionPress}
                onImageChange={isEditMode ? handleInteractiveImageChange : undefined}
                routeIndex={selectedRouteIndex}
              />
            ) : (
              isEditMode && (
                <EmptyImagePlaceholder>
                  <EmptyImageText>인터랙티브 이미지를 업로드하세요</EmptyImageText>
                  <ImageUploader
                    onUploadComplete={handleInteractiveImageChange}
                    buttonText="이미지 업로드"
                  />
                </EmptyImagePlaceholder>
              )
            )}
          </InteractiveImageContainer>
        </ContentContainer>
      )}

      {/* Region Detail Modal */}
        <RegionDetailModal
          visible={isModalVisible}
          region={selectedRegion}
          onClose={handleModalClose}
        />
      </Container>
    </div>
  );
}

const Container = styled(View)<{ isDesktop: boolean }>`
  padding-vertical: ${({ isDesktop }) => (isDesktop ? '120px' : '60px')};
  padding-horizontal: 16px;
  max-width: 1020px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
`;

const TitleSection = styled(View)`
  align-items: center;
  gap: 0;
  max-width: 800px;
  width: 100%;
  padding: 0 16px;
  margin-bottom: 40px;
  align-self: center;
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

const TabsContainer = styled(ScrollView)<{ isDesktop: boolean }>`
  flex-direction: row;
  margin-bottom: ${({ isDesktop }) => (isDesktop ? '40px' : '24px')};
`;

const TabWrapper = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-right: 8px;
`;

const TabButton = styled(TouchableOpacity)<{ isDesktop: boolean, active: boolean }>`
  flex-direction: row;
  align-items: center;
  padding: ${({ isDesktop }) => (isDesktop ? '12px 20px' : '6px 14px 6px 12px')};
  border-radius: 24px;
  background-color: ${({ active }) => (active ? color.iosBlue : color.gray30)};
`;

const IconSelector = styled(TouchableOpacity)`
  margin-right: 8px;
`;

const TabIcon = styled(Text)`
  font-size: 18px;
  margin-right: 8px;
`;

const TabLabel = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  color: ${color.white};
`;

const TabLabelInput = styled(TextInput)`
  font-size: 14px;
  font-weight: 600;
  color: ${color.white};
  padding: 0;
`;

const TabDeleteButton = styled(TouchableOpacity)`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background-color: ${color.danger};
  align-items: center;
  justify-content: center;
  margin-left: -8px;
  margin-top: -12px;
`;

const TabDeleteButtonText = styled(Text)`
  color: ${color.white};
  font-size: 14px;
  font-weight: 700;
`;

const AddTabButton = styled(TouchableOpacity)`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${color.gray20};
  align-items: center;
  justify-content: center;
`;

const AddTabButtonText = styled(Text)`
  font-size: 24px;
  color: ${color.gray60};
`;

const ContentContainer = styled(View)<{ isDesktop: boolean }>`
  flex-direction: ${({ isDesktop }) => (isDesktop ? 'row' : 'column-reverse')};
  align-items: ${({ isDesktop }) => (isDesktop ? 'flex-start' : 'stretch')};
  justify-content: ${({ isDesktop }) => (isDesktop ? 'center' : 'flex-start')};
  gap: 30px;
`;

const DescriptionHtmlContainer = styled(View)<{ isDesktop: boolean }>`
  width: ${({ isDesktop }) => (isDesktop ? '37%' : '100%')};
  border-radius: 8px;
  overflow: hidden;
  ${({ isDesktop }) => (isDesktop ? 'flex: 2;' : 'flex-shrink: 0;')};
`;

const DescriptionImageWrapper = styled(View)`
  position: relative;
`;

const InteractiveImageContainer = styled(View)<{ isDesktop: boolean }>`
  width: ${({ isDesktop }) => (isDesktop ? '60%' : '100%')};
  border-radius: 8px;
  overflow: hidden;
  ${({ isDesktop }) => (isDesktop ? 'flex: 3;' : 'flex-shrink: 0;')};
`;

const EmptyImagePlaceholder = styled(View)`
  padding: 40px;
  background-color: ${color.gray5};
  border: 2px dashed ${color.gray25};
  border-radius: 8px;
  align-items: center;
  gap: 16px;
`;

const EmptyImageText = styled(Text)`
  font-size: 14px;
  color: ${color.gray60};
`;

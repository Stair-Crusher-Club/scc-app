import {useSetAtom} from 'jotai';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Animated, Easing, Image, Linking} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import styled from 'styled-components/native';

import AnnouncementCharacter from '@/assets/icon/ic_announcement_character.svg';
import {SccPressable} from '@/components/SccPressable';
import Skeleton from '@/components/Skeleton';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {HomeAnnouncementDto} from '@/generated-sources/openapi';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import useNavigation from '@/navigation/useNavigation';
import {searchModeAtom} from '@/screens/SearchScreen/atoms';
import {isAppDeepLink} from '@/utils/deepLinkUtils';

const CARD_HEIGHT = 120;
const CHARACTER_SIZE = 90;

// Sprite positioning from Figma design
// 조회하기: w=203.81% h=145.42% left=2.32% top=-15.43%
// 등록하기: w=231.25% h=165% left=-100.85% top=-31.11%

const SEARCH_SPRITE = {
  width: CHARACTER_SIZE * 2.0381,
  height: CHARACTER_SIZE * 1.4542,
  left: CHARACTER_SIZE * 0.0232,
  top: CHARACTER_SIZE * -0.1543,
};

const CONQUER_SPRITE = {
  width: CHARACTER_SIZE * 2.3125,
  height: CHARACTER_SIZE * 1.65,
  left: CHARACTER_SIZE * -1.0085,
  top: CHARACTER_SIZE * -0.3111,
};

const ANNOUNCEMENT_HEIGHT = 52;
const ANNOUNCEMENT_RADIUS = 12;

const ROLLING_INTERVAL_MS = 5000;
const ANIMATION_DURATION_MS = 600;
const ITEM_HEIGHT = 24;

// Render current ± WINDOW_HALF items (total 5).
// Items at absolute coordinates; scrollPosition accumulates and never resets.
const WINDOW_HALF = 2;

interface QuickMenuSectionProps {
  announcements: HomeAnnouncementDto[];
  isLoading: boolean;
}

export default function QuickMenuSection({
  announcements,
  isLoading,
}: QuickMenuSectionProps) {
  const navigation = useNavigation();
  const setSearchMode = useSetAtom(searchModeAtom);

  const goToSearchPlace = () => {
    setSearchMode('place');
    navigation.navigate('Search', {
      initKeyword: '맛집',
      toMap: false,
      fromLookup: true,
    });
  };

  const goToConquer = () => {
    navigation.navigate('SearchUnconqueredPlaces', {});
  };

  // Announcement rolling animation
  const len = announcements.length;

  // scrollPosition: accumulated translateY. Never reset.
  // slot N is visible when scrollPosition = -N * ITEM_HEIGHT.
  const scrollPosition = useRef(new Animated.Value(0)).current;
  const scrollPosRef = useRef(0);

  const renderCenterRef = useRef(0);
  const [renderCenter, setRenderCenter] = useState(0);

  // Mirror animated value to JS ref
  useEffect(() => {
    const id = scrollPosition.addListener(({value}) => {
      scrollPosRef.current = value;
    });
    return () => scrollPosition.removeListener(id);
  }, [scrollPosition]);

  // Render only items within [renderCenter - WINDOW_HALF, renderCenter + WINDOW_HALF].
  const items = useMemo(() => {
    if (len <= 1) {
      return announcements.map((a, i) => ({announcement: a, slot: i}));
    }
    return Array.from({length: WINDOW_HALF * 2 + 1}, (_, i) => {
      const slot = renderCenter - WINDOW_HALF + i;
      const ringIdx = ((slot % len) + len) % len;
      return {announcement: announcements[ringIdx], slot};
    });
  }, [announcements, renderCenter, len]);

  const updateCenter = useCallback((newCenter: number) => {
    renderCenterRef.current = newCenter;
    setRenderCenter(newCenter);
  }, []);

  // Auto scroll (only when screen is focused)
  const isFocused = useIsFocused();

  useEffect(() => {
    if (len <= 1 || !isFocused) {
      return;
    }

    const timer = setInterval(() => {
      const currentSlot = Math.round(-scrollPosRef.current / ITEM_HEIGHT);
      const targetPos = -(currentSlot + 1) * ITEM_HEIGHT;

      Animated.timing(scrollPosition, {
        toValue: targetPos,
        duration: ANIMATION_DURATION_MS,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start(({finished}) => {
        if (!finished) {
          return;
        }
        updateCenter(currentSlot + 1);
      });
    }, ROLLING_INTERVAL_MS);

    return () => {
      clearInterval(timer);
      scrollPosition.stopAnimation();
    };
  }, [isFocused, len, scrollPosition, updateCenter]);

  return (
    <LogParamsProvider params={{displaySectionName: 'quick_menu_section'}}>
      <Container>
        <SectionTitle>빠른 메뉴</SectionTitle>
        <ContentColumn>
          <CardsRow>
            <SccPressable
              elementName="home_v2_quick_action_search"
              onPress={goToSearchPlace}
              style={{flex: 1}}>
              <SearchActionCard>
                <CardTextContainer>
                  <ActionTitle>조회하기</ActionTitle>
                  <ActionDescription>
                    접근성 기준으로{'\n'}장소 탐색하기
                  </ActionDescription>
                </CardTextContainer>
                <CharacterWrapper>
                  <Image
                    source={require('@/assets/img/quick_action_character.png')}
                    style={{
                      position: 'absolute',
                      width: SEARCH_SPRITE.width,
                      height: SEARCH_SPRITE.height,
                      left: SEARCH_SPRITE.left,
                      top: SEARCH_SPRITE.top,
                    }}
                    resizeMode="cover"
                  />
                </CharacterWrapper>
              </SearchActionCard>
            </SccPressable>
            <SccPressable
              elementName="home_v2_quick_action_conquer"
              onPress={goToConquer}
              style={{flex: 1}}>
              <ConquerActionCard>
                <CardTextContainer>
                  <ActionTitle>등록하기</ActionTitle>
                  <ActionDescription>
                    정복 안 된 장소만{'\n'}모아보기
                  </ActionDescription>
                </CardTextContainer>
                <CharacterWrapper>
                  <Image
                    source={require('@/assets/img/quick_action_character.png')}
                    style={{
                      position: 'absolute',
                      width: CONQUER_SPRITE.width,
                      height: CONQUER_SPRITE.height,
                      left: CONQUER_SPRITE.left,
                      top: CONQUER_SPRITE.top,
                    }}
                    resizeMode="cover"
                  />
                </CharacterWrapper>
              </ConquerActionCard>
            </SccPressable>
          </CardsRow>
          {isLoading && announcements.length === 0 ? (
            <Skeleton style={{height: ANNOUNCEMENT_HEIGHT, borderRadius: ANNOUNCEMENT_RADIUS, width: 350}} />
          ) : len > 0 ? (
            <AnnouncementContainer>
              <AnnouncementTextContainer>
                <Animated.View
                  style={{transform: [{translateY: scrollPosition}]}}>
                  {items.map(item => (
                    <AnnouncementSlot
                      key={item.slot}
                      style={{top: item.slot * ITEM_HEIGHT}}>
                      <AnnouncementItem
                        announcement={item.announcement}
                        trackView={item.slot === renderCenter}
                      />
                    </AnnouncementSlot>
                  ))}
                </Animated.View>
              </AnnouncementTextContainer>
              <AnnouncementCharacterContainer>
                <AnnouncementCharacter width={121} height={33} />
              </AnnouncementCharacterContainer>
            </AnnouncementContainer>
          ) : null}
        </ContentColumn>
      </Container>
    </LogParamsProvider>
  );
}

interface AnnouncementItemProps {
  announcement: HomeAnnouncementDto;
  trackView?: boolean;
}

function AnnouncementItem({
  announcement,
  trackView = false,
}: AnnouncementItemProps) {
  const navigation = useNavigation();

  const openAnnouncement = async () => {
    const url = announcement.linkUrl;

    if (isAppDeepLink(url)) {
      await Linking.openURL(url);
    } else {
      navigation.navigate('Webview', {
        fixedTitle: '공지사항',
        url: url,
      });
    }
  };

  return (
    <SccPressable
      elementName="home_v2_announcement"
      logParams={{announcement_id: announcement.id}}
      trackView={trackView}
      onPress={openAnnouncement}>
      <AnnouncementText numberOfLines={1}>{announcement.text}</AnnouncementText>
    </SccPressable>
  );
}

const Container = styled.View`
  padding-top: 24px;
  padding-bottom: 20px;
  padding-horizontal: 20px;
  gap: 16px;
`;

const SectionTitle = styled.Text`
  color: #16181c;
  font-size: 20px;
  font-family: ${font.pretendardSemibold};
  letter-spacing: -0.4px;
  line-height: 28px;
`;

const ContentColumn = styled.View`
  gap: 12px;
  align-items: flex-end;
`;

const CardsRow = styled.View`
  flex-direction: row;
  gap: 12px;
  align-self: stretch;
`;

const BaseActionCard = styled.View`
  border-radius: 12px;
  height: ${CARD_HEIGHT}px;
  padding: 16px 15px;
  position: relative;
`;

const SearchActionCard = styled(BaseActionCard)`
  background-color: ${color.quickActionGreen};
`;

const ConquerActionCard = styled(BaseActionCard)`
  background-color: ${color.quickActionBlue};
`;

const CardTextContainer = styled.View`
  gap: 2px;
`;

const ActionTitle = styled.Text`
  color: ${color.gray80v2};
  font-size: 18px;
  font-family: ${font.pretendardBold};
  line-height: 26px;
  letter-spacing: -0.36px;
`;

const ActionDescription = styled.Text`
  color: ${color.gray50v2};
  font-size: 13px;
  font-family: ${font.pretendardRegular};
  line-height: 18px;
  letter-spacing: -0.26px;
`;

const CharacterWrapper = styled.View`
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: ${CHARACTER_SIZE}px;
  height: ${CHARACTER_SIZE}px;
  overflow: hidden;
`;

const AnnouncementContainer = styled.View`
  background-color: ${color.gray15};
  border-radius: ${ANNOUNCEMENT_RADIUS}px;
  padding-left: 16px;
  padding-right: 12px;
  padding-vertical: 14px;
  height: ${ANNOUNCEMENT_HEIGHT}px;
  overflow: hidden;
  flex-direction: row;
  align-items: center;
`;

const AnnouncementTextContainer = styled.View`
  flex: 1;
  height: ${ITEM_HEIGHT}px;
  overflow: hidden;
`;

const AnnouncementCharacterContainer = styled.View`
  position: absolute;
  right: -2px;
  top: 19px;
`;

const AnnouncementSlot = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  height: ${ITEM_HEIGHT}px;
  justify-content: center;
`;

const AnnouncementText = styled.Text`
  color: ${color.gray80v2};
  font-size: 16px;
  line-height: 24px;
  font-family: ${font.pretendardMedium};
  letter-spacing: -0.32px;
`;

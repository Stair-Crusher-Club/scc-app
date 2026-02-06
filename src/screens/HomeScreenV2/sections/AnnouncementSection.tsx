import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Animated, Easing, Linking} from 'react-native';
import styled from 'styled-components/native';

import AnnouncementCharacter from '@/assets/icon/ic_announcement_character.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {HomeAnnouncementDto} from '@/generated-sources/openapi';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import useNavigation from '@/navigation/useNavigation';
import {isAppDeepLink} from '@/utils/deepLinkUtils';

const ROLLING_INTERVAL_MS = 5000;
const ANIMATION_DURATION_MS = 600;
const ITEM_HEIGHT = 24;

// Render current ± WINDOW_HALF items (total 5).
// Items at absolute coordinates; scrollPosition accumulates and never resets.
const WINDOW_HALF = 2;

interface AnnouncementSectionProps {
  announcements: HomeAnnouncementDto[];
}

export default function AnnouncementSection({
  announcements,
}: AnnouncementSectionProps) {
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

  // Auto scroll
  useEffect(() => {
    if (len <= 1) {
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

    return () => clearInterval(timer);
  }, [len, scrollPosition, updateCenter]);

  if (len === 0) {
    return null;
  }

  return (
    <LogParamsProvider params={{displaySectionName: 'announcement_section'}}>
      <Container>
        <TextContainer>
          <Animated.View style={{transform: [{translateY: scrollPosition}]}}>
            {items.map(item => (
              <AnnouncementSlot
                key={item.slot}
                style={{top: item.slot * ITEM_HEIGHT}}>
                <AnnouncementItem announcement={item.announcement} />
              </AnnouncementSlot>
            ))}
          </Animated.View>
        </TextContainer>
        <CharacterContainer>
          <AnnouncementCharacter width={121} height={33} />
        </CharacterContainer>
      </Container>
    </LogParamsProvider>
  );
}

interface AnnouncementItemProps {
  announcement: HomeAnnouncementDto;
}

function AnnouncementItem({announcement}: AnnouncementItemProps) {
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
      onPress={openAnnouncement}>
      <AnnouncementText numberOfLines={1}>{announcement.text}</AnnouncementText>
    </SccPressable>
  );
}

const Container = styled.View`
  margin-horizontal: 20px;
  background-color: ${color.white};
  border-radius: 12px;
  padding-left: 16px;
  padding-right: 12px;
  padding-vertical: 14px;
  height: 52px;
  overflow: hidden;
  flex-direction: row;
  align-items: center;
`;

const TextContainer = styled.View`
  flex: 1;
  height: ${ITEM_HEIGHT}px;
  overflow: hidden;
`;

const CharacterContainer = styled.View`
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
  color: ${color.gray80};
  font-size: 16px;
  line-height: 24px;
  font-family: ${font.pretendardMedium};
  letter-spacing: -0.32px;
`;

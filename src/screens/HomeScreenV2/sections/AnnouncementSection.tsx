import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Animated, Linking} from 'react-native';
import styled from 'styled-components/native';

import AnnouncementCharacter from '@/assets/icon/ic_announcement_character.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {HomeAnnouncementDto} from '@/generated-sources/openapi';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import useNavigation from '@/navigation/useNavigation';
import {isAppDeepLink} from '@/utils/deepLinkUtils';

const ROLLING_INTERVAL_MS = 5200; // 5.2 seconds (4s main banner × 1.3)
const ANIMATION_DURATION_MS = 300;
const ITEM_HEIGHT = 24;

interface AnnouncementSectionProps {
  announcements: HomeAnnouncementDto[];
}

export default function AnnouncementSection({
  announcements,
}: AnnouncementSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;
  const rollingTimer = useRef<NodeJS.Timeout | null>(null);

  const rollToNext = useCallback(() => {
    if (announcements.length <= 1) {
      return;
    }

    Animated.timing(translateY, {
      toValue: -ITEM_HEIGHT,
      duration: ANIMATION_DURATION_MS,
      useNativeDriver: true,
    }).start(() => {
      translateY.setValue(0);
      setCurrentIndex(prevIndex => (prevIndex + 1) % announcements.length);
    });
  }, [announcements.length, translateY]);

  useEffect(() => {
    if (announcements.length > 1) {
      rollingTimer.current = setInterval(rollToNext, ROLLING_INTERVAL_MS);
      return () => {
        if (rollingTimer.current) {
          clearInterval(rollingTimer.current);
        }
      };
    }
  }, [announcements.length, rollToNext]);

  if (announcements.length === 0) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex];
  const nextIndex = (currentIndex + 1) % announcements.length;
  const nextAnnouncement = announcements[nextIndex];

  return (
    <LogParamsProvider params={{displaySectionName: 'announcement_section'}}>
      <Container>
        <TextContainer>
          <AnnouncementItem
            announcement={currentAnnouncement}
            translateY={translateY}
          />
          {announcements.length > 1 && (
            <AnnouncementItem
              announcement={nextAnnouncement}
              translateY={translateY}
              isNext
            />
          )}
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
  translateY: Animated.Value;
  isNext?: boolean;
}

function AnnouncementItem({
  announcement,
  translateY,
  isNext = false,
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

  const animatedStyle = {
    transform: [
      {
        translateY: isNext ? Animated.add(translateY, ITEM_HEIGHT) : translateY,
      },
    ],
  };

  return (
    <SccPressable
      elementName="home_v2_announcement"
      logParams={{announcement_id: announcement.id}}
      onPress={openAnnouncement}
      style={isNext ? {position: 'absolute', top: 0, left: 0, right: 0} : {}}>
      <AnimatedItem style={animatedStyle}>
        <AnnouncementText numberOfLines={1}>
          {announcement.text}
        </AnnouncementText>
      </AnimatedItem>
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

const AnimatedItem = styled(Animated.View)`
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

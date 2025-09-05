import React, {useEffect, useState} from 'react';
import {
  LayoutRectangle,
  NativeScrollEvent,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';

import BackIcon from '@/assets/icon/ic_back.svg';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import useNavigation from '@/navigation/useNavigation';
import * as S from './StickyScrollNavigation.style';

interface Props {
  scrollContainer: React.RefObject<ScrollView | null>;
  scrollEventRef: React.RefObject<NativeScrollEvent | null>;
  menus: {label: string; y: number}[];
  placeName: string;
}
export default function ScrollNavigation({
  scrollContainer,
  scrollEventRef,
  menus,
  placeName,
}: Props) {
  const navigation = useNavigation();

  const [scrollY, setScrollY] = useState(0);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      const event = scrollEventRef.current ?? null;
      if (event) {
        setScrollY(event.contentOffset?.y ?? 0);
        const bottomOffset =
          (event.contentOffset?.y ?? 0) +
          (event.layoutMeasurement?.height ?? 0);
        setIsScrolledToBottom(
          bottomOffset >= (event.contentSize?.height ?? 0) - 2,
        );
      }
    }, 100);
    return () => clearInterval(interval);
  }, [scrollContainer, scrollEventRef]);
  const [navLayout, setNavLayout] = useState<LayoutRectangle>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const activeMenuIndex = findActiveIndex(
    scrollY + navLayout.height,
    menus.map(menu => menu.y),
    isScrolledToBottom,
  );
  const activeMenu = menus[activeMenuIndex];
  const edgeBackingTop = scrollY + navLayout.height - menus[0]?.y || 0;

  function scrollToMenu(index: number) {
    scrollContainer.current?.scrollTo({
      y: menus[index].y - navLayout.height + 1, // 1 for active ui
      animated: true,
    });
  }

  const showTitle = edgeBackingTop > 0;

  return (
    <View
      onLayout={e => {
        setNavLayout(e.nativeEvent.layout);
      }}
      style={{
        overflow: 'visible',
        backgroundColor: 'transparent',
        width: '100%',
      }}>
      <View
        style={{
          position: 'absolute',
          top: -edgeBackingTop,
          left: 0,
          right: 0,
          height: edgeBackingTop,
          backgroundColor: color.white,
        }}
      />
      <View
        style={{
          backgroundColor: color.white,
          paddingVertical: 10,
          paddingHorizontal: 20,
          flexDirection: 'row',
          gap: 18,
          alignItems: 'center',
          height: showTitle ? 48 : 0,
          opacity: showTitle ? 1 : 0,
        }}>
        <SccTouchableOpacity
          elementName="sticky_scroll_navigation_back_button"
          onPress={() => navigation.goBack()}
          style={{padding: 2}}>
          <BackIcon color={color.black} />
        </SccTouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            lineHeight: 28,
            fontFamily: font.pretendardMedium,
          }}>
          {placeName}
        </Text>
      </View>
      <S.StickyScrollNavigation show={true}>
        {menus.map((menu, index) => (
          <S.Menu
            key={menu.label}
            active={activeMenu === menu}
            elementName="sticky_navigation_menu"
            logParams={{menu}}
            onPress={() => scrollToMenu(index)}>
            <S.MenuTitle active={activeMenu === menu}>{menu.label}</S.MenuTitle>
          </S.Menu>
        ))}
      </S.StickyScrollNavigation>
    </View>
  );
}

function findActiveIndex(
  scrollY: number,
  scrollYs: number[],
  isScrolledToBottom: boolean,
) {
  const reversed = [...scrollYs].reverse();
  const index = reversed.findIndex(y => y <= scrollY);
  if (index === -1) {
    return 0;
  }
  if (isScrolledToBottom) {
    return scrollYs.length - 1;
  }
  return scrollYs.length - index - 1;
}

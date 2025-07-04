import React, {useState} from 'react';
import {
  LayoutChangeEvent,
  LayoutRectangle,
  ScrollView,
  View,
} from 'react-native';

import * as S from './StickyScrollNavigation.style';

interface Props {
  scrollContainer: React.RefObject<ScrollView>;
  scrollY: number;
  menus: {label: string; ref: React.RefObject<View>}[];
}
export default function ScrollNavigation({
  scrollContainer,
  scrollY,
  menus,
}: Props) {
  const [scrollYs, setScrollYs] = useState(menus.map(() => 0));
  const [navLayout, setNavLayout] = useState<LayoutRectangle>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const activeMenuIndex = findActiveIndex(scrollY + navLayout.height, scrollYs);
  const activeMenu = menus[activeMenuIndex];
  const edgeBackingTop = scrollY + navLayout.height - scrollYs[0];

  function scrollToMenu(index: number) {
    scrollContainer.current?.scrollTo({
      y: scrollYs[index] - navLayout.height + 1, // 1 for active ui
      animated: true,
    });
  }

  function onLayout(event: LayoutChangeEvent) {
    setNavLayout(event.nativeEvent.layout);
    menus.forEach((menu, index) => {
      menu.ref.current?.measure((_x, y, _w, _h, _px, _py) => {
        setScrollYs(prev => {
          const newScrollYs = [...prev];
          newScrollYs[index] = y;
          return newScrollYs;
        });
      });
    });
  }

  return (
    <View
      onLayout={e => onLayout(e)}
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
          backgroundColor: 'white',
        }}
      />
      <S.StickyScrollNavigation show={true}>
        {menus.map((menu, index) => (
          <S.Menu
            key={menu.label}
            active={activeMenu === menu}
            onPress={() => scrollToMenu(index)}>
            <S.MenuTitle active={activeMenu === menu}>{menu.label}</S.MenuTitle>
          </S.Menu>
        ))}
      </S.StickyScrollNavigation>
    </View>
  );
}

function findActiveIndex(scrollY: number, scrollYs: number[]) {
  const reversed = [...scrollYs].reverse();
  const index = reversed.findIndex(y => y <= scrollY);
  return scrollYs.length - index - 1;
}

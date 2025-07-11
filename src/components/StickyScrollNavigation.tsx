import React, {useState} from 'react';
import {LayoutRectangle, ScrollView, View} from 'react-native';

import * as S from './StickyScrollNavigation.style';

interface Props {
  scrollContainer: React.RefObject<ScrollView | null>;
  scrollY: number;
  menus: {label: string; y: number}[];
}
export default function ScrollNavigation({
  scrollContainer,
  scrollY,
  menus,
}: Props) {
  const [navLayout, setNavLayout] = useState<LayoutRectangle>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const activeMenuIndex = findActiveIndex(
    scrollY + navLayout.height,
    menus.map(menu => menu.y),
  );
  const activeMenu = menus[activeMenuIndex];
  const edgeBackingTop = scrollY + navLayout.height - menus[0]?.y || 0;

  function scrollToMenu(index: number) {
    scrollContainer.current?.scrollTo({
      y: menus[index].y - navLayout.height + 1, // 1 for active ui
      animated: true,
    });
  }

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
  if (index === -1) {
    return 0;
  }
  return scrollYs.length - index - 1;
}

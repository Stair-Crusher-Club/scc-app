import React, {useState} from 'react';
import {ScrollView, View} from 'react-native';

import * as S from './StickyScrollNavigation.style';

interface Props {
  scrollContainer: React.RefObject<ScrollView | null>;
  scrollY: number;
  menus: {label: string; ref: React.RefObject<View | null>}[];
}
export default function StickyScrollNavigation({
  scrollContainer,
  scrollY,
  menus,
}: Props) {
  const [scrollYs, setScrollYs] = useState(menus.map(() => 0));
  const activeMenuIndex = findActiveIndex(scrollY, scrollYs);
  const activeMenu = menus[activeMenuIndex];
  const hasActiveMenu = activeMenu !== undefined;

  function scrollToMenu(index: number) {
    scrollContainer.current?.scrollTo({
      y: scrollYs[index] - 50, // 타이틀이 노출되도록 살짝 조정
      animated: true,
    });
  }

  function onLayout() {
    menus.forEach((menu, index) => {
      menu.ref.current?.measure((_x, _y, _w, _h, _px, py) => {
        setScrollYs(prev => {
          const newScrollYs = [...prev];
          newScrollYs[index] = py;
          return newScrollYs;
        });
      });
    });
  }

  return (
    <S.Wrapper onLayout={onLayout}>
      <S.StickyScrollNavigation show={hasActiveMenu}>
        {menus.map((menu, index) => (
          <S.Menu
            elementName="building_form_navigation_menu"
            logParams={{menu: menu.label}}
            key={menu.label}
            active={activeMenu === menu}
            onPress={() => scrollToMenu(index)}>
            <S.MenuTitle active={activeMenu === menu}>{menu.label}</S.MenuTitle>
          </S.Menu>
        ))}
      </S.StickyScrollNavigation>
    </S.Wrapper>
  );
}

function findActiveIndex(scrollY: number, scrollYs: number[]) {
  const reversed = [...scrollYs].reverse();
  const index = reversed.findIndex(y => y <= scrollY);
  return scrollYs.length - index - 1;
}

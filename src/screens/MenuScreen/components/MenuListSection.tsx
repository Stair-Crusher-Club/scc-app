import React from 'react';

import MenuBookmarkIcon from '@/assets/icon/menu_ic_bookmark.svg';
import MenuCrusherIcon from '@/assets/icon/menu_ic_crusher.svg';
import MenuFlagIcon from '@/assets/icon/menu_ic_flag.svg';
import MenuReviewIcon from '@/assets/icon/menu_ic_review.svg';
import MenuSCCRoadIcon from '@/assets/icon/menu_ic_scc_road.svg';
import MenuSettingIcon from '@/assets/icon/menu_ic_setting.svg';
import MenuWheelChairIcon from '@/assets/icon/menu_ic_wheelchair.svg';
import MenuRow from '@/components/MenuRow';
import useNavigation from '@/navigation/useNavigation';

export default function MenuListSection() {
  const navigation = useNavigation();

  function goToConquerer() {
    navigation.navigate('Conquerer');
  }

  function goToSavedPlaces() {
    navigation.navigate('SavedPlaceLists');
  }

  function goToCrusherHistory() {
    navigation.navigate('CrusherActivity', {qr: undefined});
  }

  function goToSCCRoad() {
    navigation.navigate('Webview', {
      fixedTitle: '뿌클로드: 이동약자를 위한 진짜 리뷰',
      url: 'https://www.staircrusher.club/crusher_road',
    });
  }

  function goToReview() {
    navigation.navigate('Review');
  }

  function goToSettings() {
    navigation.navigate('Setting');
  }

  function goToToilet() {
    navigation.navigate('ToiletMap');
  }

  const menuItems = [
    {
      elementName: 'menu_favorite_places',
      title: '저장한 장소',
      icon: <MenuBookmarkIcon />,
      onPress: goToSavedPlaces,
    },
    {
      elementName: 'menu_conquerer_report',
      title: '정복한 장소',
      icon: <MenuFlagIcon />,
      onPress: goToConquerer,
    },
    {
      elementName: 'menu_review_report',
      title: '내 리뷰',
      icon: <MenuReviewIcon />,
      onPress: goToReview,
    },
    {
      elementName: 'menu_crusher_activity',
      title: '크러셔 활동',
      icon: <MenuCrusherIcon />,
      onPress: goToCrusherHistory,
    },
    {
      elementName: 'menu_challenge',
      title: '참여 챌린지 보기',
      hidden: true,
      disabled: true,
      badgeText: '준비중',
    },
    {
      elementName: 'menu_badge',
      title: '달성 뱃지 보기',
      hidden: true,
      disabled: true,
      badgeText: '준비중',
    },
    {
      elementName: 'menu_seoul_toilet',
      title: '서울 장애인 화장실 정보',
      icon: <MenuWheelChairIcon />,
      onPress: goToToilet,
    },
    {
      elementName: 'menu_bbucleroad',
      title: '뿌클로드: 이동약자를 위한 진짜 리뷰',
      icon: <MenuSCCRoadIcon />,
      onPress: goToSCCRoad,
    },
    {
      elementName: 'menu_social_login',
      title: '간편 로그인 설정',
      hidden: true,
      disabled: true,
      badgeText: '준비중',
    },
    {
      elementName: 'menu_settings',
      title: '설정',
      icon: <MenuSettingIcon />,
      onPress: goToSettings,
    },
    {
      elementName: 'menu_challenge',
      title: '참여 챌린지 보기',
      hidden: true,
      disabled: true,
      badgeText: '준비중',
    },
    {
      elementName: 'menu_badge',
      title: '달성 뱃지 보기',
      hidden: true,
      disabled: true,
      badgeText: '준비중',
    },
  ] as const;

  return (
    <>
      {menuItems.map(item => (
        <MenuRow key={`${item.elementName}-${item.title}`} {...item} />
      ))}
    </>
  );
}

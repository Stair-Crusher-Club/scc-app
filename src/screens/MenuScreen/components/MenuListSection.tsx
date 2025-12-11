import React from 'react';
import {View} from 'react-native';

import MenuBookmarkIcon from '@/assets/icon/menu_ic_bookmark.svg';
import MenuCrusherIcon from '@/assets/icon/menu_ic_crusher.svg';
import MenuFlagIcon from '@/assets/icon/menu_ic_flag.svg';
import MenuReviewIcon from '@/assets/icon/menu_ic_review.svg';
import MenuSCCRoadIcon from '@/assets/icon/menu_ic_scc_road.svg';
import MenuSettingIcon from '@/assets/icon/menu_ic_setting.svg';
import MenuWheelChairIcon from '@/assets/icon/menu_ic_wheelchair.svg';
import useNavigation from '@/navigation/useNavigation';

import MenuItem from './MenuItem';

export default function MenuListSection() {
  const navigation = useNavigation();

  function goToConquerer() {
    navigation.navigate('Conquerer');
  }

  function goToFavoritePlaces() {
    navigation.navigate('FavoritePlaces');
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

  return (
    <View>
      <MenuItem
        elementName="menu_favorite_places"
        onPress={goToFavoritePlaces}
        icon={<MenuBookmarkIcon />}
        text="저장한 장소"
      />
      <MenuItem
        elementName="menu_conquerer_report"
        onPress={goToConquerer}
        icon={<MenuFlagIcon />}
        text="정복한 장소"
      />
      <MenuItem
        elementName="menu_review_report"
        onPress={goToReview}
        icon={<MenuReviewIcon />}
        text="내 리뷰"
      />
      <MenuItem
        elementName="menu_crusher_activity"
        onPress={goToCrusherHistory}
        icon={<MenuCrusherIcon />}
        text="크러셔 활동"
      />
      <MenuItem
        elementName="menu_challenge"
        text="참여 챌린지 보기"
        showBadge
        hidden
      />
      <MenuItem
        elementName="menu_badge"
        text="달성 뱃지 보기"
        showBadge
        hidden
      />
      <MenuItem
        elementName="menu_seoul_toilet"
        onPress={goToToilet}
        icon={<MenuWheelChairIcon />}
        text="서울 장애인 화장실 정보"
      />
      <MenuItem
        elementName="menu_bbucleroad"
        onPress={goToSCCRoad}
        icon={<MenuSCCRoadIcon />}
        text="뿌클로드: 이동약자를 위한 진짜 리뷰"
      />
      <MenuItem
        elementName="menu_social_login"
        text="간편 로그인 설정"
        showBadge
        hidden
      />
      <MenuItem
        elementName="menu_settings"
        onPress={goToSettings}
        icon={<MenuSettingIcon />}
        text="설정"
      />
    </View>
  );
}

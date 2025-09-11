import React from 'react';

import RightAngleArrowIcon from '@/assets/icon/ic_angle_bracket_right.svg';
import MenuBookmarkIcon from '@/assets/icon/menu_ic_bookmark.svg';
import MenuCrusherIcon from '@/assets/icon/menu_ic_crusher.svg';
import MenuFlagIcon from '@/assets/icon/menu_ic_flag.svg';
import MenuReviewIcon from '@/assets/icon/menu_ic_review.svg';
import MenuSettingIcon from '@/assets/icon/menu_ic_setting.svg';
import MenuWheelChairIcon from '@/assets/icon/menu_ic_wheelchair.svg';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import useNavigation from '@/navigation/useNavigation';

import * as S from './MenuListSection.style';

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

  function goToReviews() {
    navigation.navigate('Webview', {
      fixedTitle: '뿌클로드: 이동약자를 위한 진짜 리뷰',
      url: 'https://www.staircrusher.club/crusher_road',
    });
  }

  function goToSettings() {
    navigation.navigate('Setting');
  }

  function goToToilet() {
    navigation.navigate('ToiletMap');
  }

  return (
    <S.MenuListSection>
      <SccTouchableOpacity
        elementName="menu_conquerer_report"
        onPress={goToConquerer}>
        <S.MenuItem>
          <S.MenuTitleWrapper>
            <MenuFlagIcon />
            <S.MenuTitle>정복한 장소</S.MenuTitle>
          </S.MenuTitleWrapper>
          <RightAngleArrowIcon color={color.gray50} />
        </S.MenuItem>
      </SccTouchableOpacity>
      <SccTouchableOpacity
        elementName="menu_favorite_places"
        onPress={goToFavoritePlaces}>
        <S.MenuItem>
          <S.MenuTitleWrapper>
            <MenuBookmarkIcon />
            <S.MenuTitle>저장한 장소</S.MenuTitle>
          </S.MenuTitleWrapper>
          <RightAngleArrowIcon color={color.gray30} />
        </S.MenuItem>
      </SccTouchableOpacity>
      <SccTouchableOpacity
        elementName="menu_crusher_activity"
        onPress={goToCrusherHistory}>
        <S.MenuItem>
          <S.MenuTitleWrapper>
            <MenuCrusherIcon />
            <S.MenuTitle>크러셔 활동</S.MenuTitle>
          </S.MenuTitleWrapper>
          <RightAngleArrowIcon color={color.gray30} />
        </S.MenuItem>
      </SccTouchableOpacity>
      <SccTouchableOpacity
        elementName="menu_challenge"
        style={{display: 'none'}}>
        <S.MenuItem>
          <S.MenuTitle disabled>참여 챌린지 보기</S.MenuTitle>
          <NotAvailableBadge />
          <RightAngleArrowIcon color={color.gray50} />
        </S.MenuItem>
      </SccTouchableOpacity>
      <SccTouchableOpacity elementName="menu_badge" style={{display: 'none'}}>
        <S.MenuItem>
          <S.MenuTitle disabled>달성 뱃지 보기</S.MenuTitle>
          <NotAvailableBadge />
          <RightAngleArrowIcon color={color.gray50} />
        </S.MenuItem>
      </SccTouchableOpacity>
      <SccTouchableOpacity elementName="menu_seoul_toilet" onPress={goToToilet}>
        <S.MenuItem>
          <S.MenuTitleWrapper>
            <MenuWheelChairIcon />
            <S.MenuTitle>서울 장애인 화장실 정보</S.MenuTitle>
          </S.MenuTitleWrapper>
          <RightAngleArrowIcon color={color.gray50} />
        </S.MenuItem>
      </SccTouchableOpacity>
      <SccTouchableOpacity elementName="menu_bbucleroad" onPress={goToReviews}>
        <S.MenuItem>
          <S.MenuTitleWrapper>
            <MenuReviewIcon />
            <S.MenuTitle>뿌클로드: 이동약자를 위한 진짜 리뷰</S.MenuTitle>
          </S.MenuTitleWrapper>
          <RightAngleArrowIcon color={color.gray50} />
        </S.MenuItem>
      </SccTouchableOpacity>
      <SccTouchableOpacity
        elementName="menu_social_login"
        style={{display: 'none'}}>
        <S.MenuItem>
          <S.MenuTitle disabled>간편 로그인 설정</S.MenuTitle>
          <NotAvailableBadge />
          <RightAngleArrowIcon color={color.gray50} />
        </S.MenuItem>
      </SccTouchableOpacity>
      <SccTouchableOpacity elementName="menu_settings" onPress={goToSettings}>
        <S.MenuItem>
          <S.MenuTitleWrapper>
            <MenuSettingIcon />
            <S.MenuTitle>설정</S.MenuTitle>
          </S.MenuTitleWrapper>
          <RightAngleArrowIcon color={color.gray50} />
        </S.MenuItem>
      </SccTouchableOpacity>
      <SccTouchableOpacity
        elementName="menu_challenge"
        style={{display: 'none'}}>
        <S.MenuItem>
          <S.MenuTitle disabled>참여 챌린지 보기</S.MenuTitle>
          <NotAvailableBadge />
          <RightAngleArrowIcon color={color.gray50} />
        </S.MenuItem>
      </SccTouchableOpacity>
      <SccTouchableOpacity elementName="menu_badge" style={{display: 'none'}}>
        <S.MenuItem>
          <S.MenuTitle disabled>달성 뱃지 보기</S.MenuTitle>
          <NotAvailableBadge />
          <RightAngleArrowIcon color={color.gray50} />
        </S.MenuItem>
      </SccTouchableOpacity>
      <SccTouchableOpacity elementName="menu_seoul_toilet" onPress={goToToilet}>
        <S.MenuItem>
          <S.MenuTitleWrapper>
            <MenuWheelChairIcon />
            <S.MenuTitle>서울 장애인 화장실 정보</S.MenuTitle>
          </S.MenuTitleWrapper>
          <RightAngleArrowIcon color={color.gray50} />
        </S.MenuItem>
      </SccTouchableOpacity>
      <SccTouchableOpacity elementName="menu_bbucleroad" onPress={goToReviews}>
        <S.MenuItem>
          <S.MenuTitleWrapper>
            <MenuReviewIcon />
            <S.MenuTitle>뿌클로드: 이동약자를 위한 진짜 리뷰</S.MenuTitle>
          </S.MenuTitleWrapper>
          <RightAngleArrowIcon color={color.gray50} />
        </S.MenuItem>
      </SccTouchableOpacity>
      <SccTouchableOpacity
        elementName="menu_social_login"
        style={{display: 'none'}}>
        <S.MenuItem>
          <S.MenuTitle disabled>간편 로그인 설정</S.MenuTitle>
          <NotAvailableBadge />
          <RightAngleArrowIcon color={color.gray50} />
        </S.MenuItem>
      </SccTouchableOpacity>
      <SccTouchableOpacity elementName="menu_settings" onPress={goToSettings}>
        <S.MenuItem>
          <S.MenuTitleWrapper>
            <MenuSettingIcon />
            <S.MenuTitle>설정</S.MenuTitle>
          </S.MenuTitleWrapper>
          <RightAngleArrowIcon color={color.gray50} />
        </S.MenuItem>
      </SccTouchableOpacity>
    </S.MenuListSection>
  );
}

const NotAvailableBadge = () => {
  return (
    <S.NotAvailableBadge>
      <S.NotAvailableText>준비중</S.NotAvailableText>
    </S.NotAvailableBadge>
  );
};

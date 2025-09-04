import React from 'react';
import {TouchableOpacity} from 'react-native';

import RightAngleArrowIcon from '@/assets/icon/ic_angle_bracket_right.svg';
import MenuBookmarkIcon from '@/assets/icon/menu_ic_bookmark.svg';
import MenuFlagIcon from '@/assets/icon/menu_ic_flag.svg';
import MenuReviewIcon from '@/assets/icon/menu_ic_review.svg';
import MenuSCCRoadIcon from '@/assets/icon/menu_ic_scc_road.svg';
import MenuSettingIcon from '@/assets/icon/menu_ic_setting.svg';
import MenuWheelChairIcon from '@/assets/icon/menu_ic_wheelchair.svg';
import {color} from '@/constant/color';
import {LogClick} from '@/logging/LogClick';
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
    <S.MenuListSection>
      <TouchableOpacity onPress={goToFavoritePlaces}>
        <S.MenuItem>
          <S.MenuTitleWrapper>
            <MenuBookmarkIcon />
            <S.MenuTitle>저장한 장소</S.MenuTitle>
          </S.MenuTitleWrapper>
          <RightAngleArrowIcon color={color.gray50} />
        </S.MenuItem>
      </TouchableOpacity>
      <LogClick elementName="menu_conquerer_report">
        <TouchableOpacity onPress={goToConquerer}>
          <S.MenuItem>
            <S.MenuTitleWrapper>
              <MenuFlagIcon />
              <S.MenuTitle>정복한 장소</S.MenuTitle>
            </S.MenuTitleWrapper>
            <RightAngleArrowIcon color={color.gray50} />
          </S.MenuItem>
        </TouchableOpacity>
      </LogClick>
      <TouchableOpacity onPress={goToReview}>
        <S.MenuItem>
          <S.MenuTitleWrapper>
            <MenuReviewIcon />
            <S.MenuTitle>내 리뷰</S.MenuTitle>
          </S.MenuTitleWrapper>
          <RightAngleArrowIcon color={color.gray50} />
        </S.MenuItem>
      </TouchableOpacity>
      <LogClick elementName="menu_challenge">
        <TouchableOpacity style={{display: 'none'}}>
          <S.MenuItem>
            <S.MenuTitle disabled>참여 챌린지 보기</S.MenuTitle>
            <NotAvailableBadge />
            <RightAngleArrowIcon color={color.gray50} />
          </S.MenuItem>
        </TouchableOpacity>
      </LogClick>
      <LogClick elementName="menu_badge">
        <TouchableOpacity style={{display: 'none'}}>
          <S.MenuItem>
            <S.MenuTitle disabled>달성 뱃지 보기</S.MenuTitle>
            <NotAvailableBadge />
            <RightAngleArrowIcon color={color.gray50} />
          </S.MenuItem>
        </TouchableOpacity>
      </LogClick>
      <LogClick elementName="menu_seoul_toilet">
        <TouchableOpacity onPress={goToToilet}>
          <S.MenuItem>
            <S.MenuTitleWrapper>
              <MenuWheelChairIcon />
              <S.MenuTitle>서울 장애인 화장실 정보</S.MenuTitle>
            </S.MenuTitleWrapper>
            <RightAngleArrowIcon color={color.gray50} />
          </S.MenuItem>
        </TouchableOpacity>
      </LogClick>
      <LogClick elementName="menu_bbucleroad">
        <TouchableOpacity onPress={goToSCCRoad}>
          <S.MenuItem>
            <S.MenuTitleWrapper>
              <MenuSCCRoadIcon />
              <S.MenuTitle>뿌클로드: 이동약자를 위한 진짜 리뷰</S.MenuTitle>
            </S.MenuTitleWrapper>
            <RightAngleArrowIcon color={color.gray50} />
          </S.MenuItem>
        </TouchableOpacity>
      </LogClick>
      <LogClick elementName="menu_social_login">
        <TouchableOpacity style={{display: 'none'}}>
          <S.MenuItem>
            <S.MenuTitle disabled>간편 로그인 설정</S.MenuTitle>
            <NotAvailableBadge />
            <RightAngleArrowIcon color={color.gray50} />
          </S.MenuItem>
        </TouchableOpacity>
      </LogClick>
      <LogClick elementName="menu_settings">
        <TouchableOpacity onPress={goToSettings}>
          <S.MenuItem>
            <S.MenuTitleWrapper>
              <MenuSettingIcon />
              <S.MenuTitle>설정</S.MenuTitle>
            </S.MenuTitleWrapper>
            <RightAngleArrowIcon color={color.gray50} />
          </S.MenuItem>
        </TouchableOpacity>
      </LogClick>
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

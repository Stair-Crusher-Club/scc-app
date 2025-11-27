import React from 'react';
import {View, Text} from 'react-native';

import ChevronRightIcon from '@/assets/icon/ic_chevron_right.svg';
import MenuBookmarkIcon from '@/assets/icon/menu_ic_bookmark.svg';
import MenuCrusherIcon from '@/assets/icon/menu_ic_crusher.svg';
import MenuFlagIcon from '@/assets/icon/menu_ic_flag.svg';
import MenuReviewIcon from '@/assets/icon/menu_ic_review.svg';
import MenuSCCRoadIcon from '@/assets/icon/menu_ic_scc_road.svg';
import MenuSettingIcon from '@/assets/icon/menu_ic_setting.svg';
import MenuWheelChairIcon from '@/assets/icon/menu_ic_wheelchair.svg';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import useNavigation from '@/navigation/useNavigation';

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
      <SccTouchableOpacity
        elementName="menu_favorite_places"
        onPress={goToFavoritePlaces}>
        <View className="flex-row justify-between items-center py-5 pl-5 pr-[15px]">
          <View className="flex-row justify-center items-center gap-[10px]">
            <MenuBookmarkIcon />
            <Text className="font-pretendard-regular text-base text-black">
              저장한 장소
            </Text>
          </View>
          <ChevronRightIcon width={20} height={20} color={color.gray30} />
        </View>
      </SccTouchableOpacity>
      <SccTouchableOpacity
        elementName="menu_conquerer_report"
        onPress={goToConquerer}>
        <View className="flex-row justify-between items-center py-5 pl-5 pr-[15px]">
          <View className="flex-row justify-center items-center gap-[10px]">
            <MenuFlagIcon />
            <Text className="font-pretendard-regular text-base text-black">
              정복한 장소
            </Text>
          </View>
          <ChevronRightIcon width={20} height={20} color={color.gray30} />
        </View>
      </SccTouchableOpacity>
      <SccTouchableOpacity
        elementName="menu_review_report"
        onPress={goToReview}>
        <View className="flex-row justify-between items-center py-5 pl-5 pr-[15px]">
          <View className="flex-row justify-center items-center gap-[10px]">
            <MenuReviewIcon />
            <Text className="font-pretendard-regular text-base text-black">
              내 리뷰
            </Text>
          </View>
          <ChevronRightIcon width={20} height={20} color={color.gray30} />
        </View>
      </SccTouchableOpacity>
      <SccTouchableOpacity
        elementName="menu_crusher_activity"
        onPress={goToCrusherHistory}>
        <View className="flex-row justify-between items-center py-5 pl-5 pr-[15px]">
          <View className="flex-row justify-center items-center gap-[10px]">
            <MenuCrusherIcon />
            <Text className="font-pretendard-regular text-base text-black">
              크러셔 활동
            </Text>
          </View>
          <ChevronRightIcon width={20} height={20} color={color.gray30} />
        </View>
      </SccTouchableOpacity>
      <SccTouchableOpacity
        elementName="menu_challenge"
        style={{display: 'none'}}>
        <View className="flex-row justify-between items-center py-5 pl-5 pr-[15px]">
          <Text className="font-pretendard-regular text-base text-gray-50">
            참여 챌린지 보기
          </Text>
          <NotAvailableBadge />
          <ChevronRightIcon width={20} height={20} color={color.gray30} />
        </View>
      </SccTouchableOpacity>
      <SccTouchableOpacity elementName="menu_badge" style={{display: 'none'}}>
        <View className="flex-row justify-between items-center py-5 pl-5 pr-[15px]">
          <Text className="font-pretendard-regular text-base text-gray-50">
            달성 뱃지 보기
          </Text>
          <NotAvailableBadge />
          <ChevronRightIcon width={20} height={20} color={color.gray30} />
        </View>
      </SccTouchableOpacity>
      <SccTouchableOpacity elementName="menu_seoul_toilet" onPress={goToToilet}>
        <View className="flex-row justify-between items-center py-5 pl-5 pr-[15px]">
          <View className="flex-row justify-center items-center gap-[10px]">
            <MenuWheelChairIcon />
            <Text className="font-pretendard-regular text-base text-black">
              서울 장애인 화장실 정보
            </Text>
          </View>
          <ChevronRightIcon width={20} height={20} color={color.gray30} />
        </View>
      </SccTouchableOpacity>
      <SccTouchableOpacity elementName="menu_bbucleroad" onPress={goToSCCRoad}>
        <View className="flex-row justify-between items-center py-5 pl-5 pr-[15px]">
          <View className="flex-row justify-center items-center gap-[10px]">
            <MenuSCCRoadIcon />
            <Text className="font-pretendard-regular text-base text-black">
              뿌클로드: 이동약자를 위한 진짜 리뷰
            </Text>
          </View>
          <ChevronRightIcon width={20} height={20} color={color.gray30} />
        </View>
      </SccTouchableOpacity>
      <SccTouchableOpacity
        elementName="menu_social_login"
        style={{display: 'none'}}>
        <View className="flex-row justify-between items-center py-5 pl-5 pr-[15px]">
          <Text className="font-pretendard-regular text-base text-gray-50">
            간편 로그인 설정
          </Text>
          <NotAvailableBadge />
          <ChevronRightIcon width={20} height={20} color={color.gray30} />
        </View>
      </SccTouchableOpacity>
      <SccTouchableOpacity elementName="menu_settings" onPress={goToSettings}>
        <View className="flex-row justify-between items-center py-5 pl-5 pr-[15px]">
          <View className="flex-row justify-center items-center gap-[10px]">
            <MenuSettingIcon />
            <Text className="font-pretendard-regular text-base text-black">
              설정
            </Text>
          </View>
          <ChevronRightIcon width={20} height={20} color={color.gray30} />
        </View>
      </SccTouchableOpacity>
      <SccTouchableOpacity
        elementName="menu_challenge"
        style={{display: 'none'}}>
        <View className="flex-row justify-between items-center py-5 pl-5 pr-[15px]">
          <Text className="font-pretendard-regular text-base text-gray-50">
            참여 챌린지 보기
          </Text>
          <NotAvailableBadge />
          <ChevronRightIcon width={20} height={20} color={color.gray30} />
        </View>
      </SccTouchableOpacity>
      <SccTouchableOpacity elementName="menu_badge" style={{display: 'none'}}>
        <View className="flex-row justify-between items-center py-5 pl-5 pr-[15px]">
          <Text className="font-pretendard-regular text-base text-gray-50">
            달성 뱃지 보기
          </Text>
          <NotAvailableBadge />
          <ChevronRightIcon width={20} height={20} color={color.gray30} />
        </View>
      </SccTouchableOpacity>
    </View>
  );
}

const NotAvailableBadge = () => {
  return (
    <View className="py-1 px-1.5 ml-2 mr-auto bg-gray-10 rounded-[10px]">
      <Text
        className="font-pretendard-regular text-xs text-gray-50"
        style={{lineHeight: 19}}>
        준비중
      </Text>
    </View>
  );
};

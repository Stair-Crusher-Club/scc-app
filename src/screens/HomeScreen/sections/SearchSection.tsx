import {useAtom, useAtomValue} from 'jotai';
import React from 'react';
import {Text, View} from 'react-native';

import MapIcon from '@/assets/icon/ic_map_detailed.svg';
import SearchIcon from '@/assets/icon/ic_search_detailed.svg';
import {
  hasShownCoachMarkForFirstVisitAtom,
  hasShownMapIconTooltipForFirstVisitAtom,
} from '@/atoms/User';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import useNavigation from '@/navigation/useNavigation';
import CoachMarkMapButton from '@/screens/HomeScreen/components/CoachMarkMapButton';
import CoachMarkTarget from '@/screens/HomeScreen/components/CoachMarkTarget';
import Tooltip from '@/screens/HomeScreen/components/Tooltip';
import SearchCategory from '@/screens/SearchScreen/components/SearchHeader/SearchCategory.tsx';

export default function SearchSection() {
  const navigation = useNavigation();
  const hasShownCoachMarkForFirstVisit = useAtomValue(
    hasShownCoachMarkForFirstVisitAtom,
  );
  const [
    hasShownMapIconTooltipForFirstVisit,
    setHasShownMapIconTooltipForFirstVisit,
  ] = useAtom(hasShownMapIconTooltipForFirstVisitAtom);

  const goToSearch = (initKeyword: string, toMap?: boolean) => {
    navigation.navigate('Search', {initKeyword, toMap});
  };

  return (
    <View className="bg-white pt-5 relative">
      <Text className="text-black text-xl font-pretendard-bold mx-5 pb-4">
        어느 장소를 정복할까요?
      </Text>

      <Tooltip
        visible={
          hasShownCoachMarkForFirstVisit && !hasShownMapIconTooltipForFirstVisit
        }
        onPressClose={() => {
          setHasShownMapIconTooltipForFirstVisit(true);
        }}
        style={{
          top: 0,
          left: 20,
        }}>{`지도 아이콘을 누르면\n지도 화면으로 바로 이동할 수 있어요.`}</Tooltip>
      <View className="flex-row bg-gray-10 rounded-lg mx-5 gap-2 pt-3 pb-[13px] px-3 items-center">
        <CoachMarkTarget
          id="map-icon"
          rx={100}
          ry={100}
          style={{
            alignSelf: 'flex-start',
            maxWidth: 50,
          }}
          renderItem={CoachMarkMapButton}>
          <SccPressable
            elementName="place_search_map_direct"
            onPress={() => {
              goToSearch('', true);
              setHasShownMapIconTooltipForFirstVisit(true);
            }}>
            <MapIcon width={24} height={24} />
          </SccPressable>
        </CoachMarkTarget>
        <SccPressable
          elementName="place_search_input"
          onPress={() => goToSearch('')}
          className="flex-row items-center flex-1">
          <Text className="flex-1 text-gray-50 text-base leading-6 font-pretendard-regular">
            장소, 주소 검색
          </Text>
          <SearchIcon width={24} height={24} color={color.gray70} />
        </SccPressable>
      </View>
      <View className="overflow-visible px-5 py-4">
        <SearchCategory onPressKeyword={goToSearch} />
      </View>
    </View>
  );
}

import {useSetAtom} from 'jotai';
import React from 'react';
import styled from 'styled-components/native';

import SearchIcon from '@/assets/icon/ic_search_detailed.svg';
import FlagIcon from '@/assets/icon/menu_ic_flag.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import useNavigation from '@/navigation/useNavigation';
import {searchModeAtom} from '@/screens/SearchScreen/atoms';

export default function QuickActionSection() {
  const navigation = useNavigation();
  const setSearchMode = useSetAtom(searchModeAtom);

  const goToSearchPlace = () => {
    setSearchMode('place');
    navigation.navigate('Search', {initKeyword: '', toMap: false});
  };

  const goToConquer = () => {
    setSearchMode('place');
    navigation.navigate('Search', {initKeyword: '', toMap: true});
  };

  return (
    <LogParamsProvider params={{displaySectionName: 'quick_action_section'}}>
      <Container>
        <SccPressable
          elementName="home_v2_quick_action_search"
          onPress={goToSearchPlace}
          style={{flex: 1}}>
          <ActionCard>
            <IconContainer style={{backgroundColor: color.brand10}}>
              <SearchIcon width={24} height={24} color={color.brand} />
            </IconContainer>
            <ActionTitle>조회하기</ActionTitle>
            <ActionDescription>장소 접근성 정보 확인</ActionDescription>
          </ActionCard>
        </SccPressable>
        <SccPressable
          elementName="home_v2_quick_action_conquer"
          onPress={goToConquer}
          style={{flex: 1}}>
          <ActionCard>
            <IconContainer style={{backgroundColor: color.orange10}}>
              <FlagIcon width={24} height={24} color={color.orange} />
            </IconContainer>
            <ActionTitle>정복하기</ActionTitle>
            <ActionDescription>접근성 정보 등록하기</ActionDescription>
          </ActionCard>
        </SccPressable>
      </Container>
    </LogParamsProvider>
  );
}

const Container = styled.View`
  flex-direction: row;
  padding-horizontal: 20px;
  gap: 12px;
  margin-bottom: 24px;
`;

const ActionCard = styled.View`
  background-color: ${color.white};
  border-radius: 12px;
  border-width: 1px;
  border-color: ${color.gray20};
  padding: 16px;
`;

const IconContainer = styled.View`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const ActionTitle = styled.Text`
  color: ${color.gray90};
  font-size: 16px;
  font-family: ${font.pretendardBold};
  margin-bottom: 4px;
`;

const ActionDescription = styled.Text`
  color: ${color.gray60};
  font-size: 13px;
  font-family: ${font.pretendardRegular};
`;

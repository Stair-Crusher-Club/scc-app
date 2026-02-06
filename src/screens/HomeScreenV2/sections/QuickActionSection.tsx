import {useSetAtom} from 'jotai';
import React from 'react';
import {Image} from 'react-native';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import useNavigation from '@/navigation/useNavigation';
import {filterAtom, searchModeAtom} from '@/screens/SearchScreen/atoms';

const CARD_HEIGHT = 120;
const CHARACTER_SIZE = 90;

// Sprite positioning from Figma design
// 조회하기: w=203.81% h=145.42% left=2.32% top=-15.43%
// 정복하기: w=231.25% h=165% left=-100.85% top=-31.11%

const SEARCH_SPRITE = {
  width: CHARACTER_SIZE * 2.0381,
  height: CHARACTER_SIZE * 1.4542,
  left: CHARACTER_SIZE * 0.0232,
  top: CHARACTER_SIZE * -0.1543,
};

const CONQUER_SPRITE = {
  width: CHARACTER_SIZE * 2.3125,
  height: CHARACTER_SIZE * 1.65,
  left: CHARACTER_SIZE * -1.0085,
  top: CHARACTER_SIZE * -0.3111,
};

export default function QuickActionSection() {
  const navigation = useNavigation();
  const setSearchMode = useSetAtom(searchModeAtom);
  const setFilter = useSetAtom(filterAtom);

  const goToSearchPlace = () => {
    setSearchMode('place');
    setFilter(prev => ({...prev, isRegistered: true}));
    navigation.navigate('Search', {initKeyword: '맛집', toMap: false});
  };

  const goToConquer = () => {
    navigation.navigate('SearchUnconqueredPlaces', {});
  };

  return (
    <LogParamsProvider params={{displaySectionName: 'quick_action_section'}}>
      <Container>
        <SccPressable
          elementName="home_v2_quick_action_search"
          onPress={goToSearchPlace}
          style={{flex: 1}}>
          <ActionCard>
            <TextContainer>
              <ActionTitle>조회하기</ActionTitle>
              <ActionDescription>
                접근성 기준으로{'\n'}장소 탐색하기
              </ActionDescription>
            </TextContainer>
            <CharacterWrapper>
              <Image
                source={require('@/assets/img/quick_action_character.png')}
                style={{
                  position: 'absolute',
                  width: SEARCH_SPRITE.width,
                  height: SEARCH_SPRITE.height,
                  left: SEARCH_SPRITE.left,
                  top: SEARCH_SPRITE.top,
                }}
                resizeMode="cover"
              />
            </CharacterWrapper>
          </ActionCard>
        </SccPressable>
        <SccPressable
          elementName="home_v2_quick_action_conquer"
          onPress={goToConquer}
          style={{flex: 1}}>
          <ActionCard>
            <TextContainer>
              <ActionTitle>정복하기</ActionTitle>
              <ActionDescription>
                정복 안 된 장소만{'\n'}모아보기
              </ActionDescription>
            </TextContainer>
            <CharacterWrapper>
              <Image
                source={require('@/assets/img/quick_action_character.png')}
                style={{
                  position: 'absolute',
                  width: CONQUER_SPRITE.width,
                  height: CONQUER_SPRITE.height,
                  left: CONQUER_SPRITE.left,
                  top: CONQUER_SPRITE.top,
                }}
                resizeMode="cover"
              />
            </CharacterWrapper>
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
  height: ${CARD_HEIGHT}px;
  padding: 16px 15px;
  position: relative;
`;

const TextContainer = styled.View`
  gap: 2px;
`;

const ActionTitle = styled.Text`
  color: ${color.gray70};
  font-size: 18px;
  font-family: ${font.pretendardBold};
  line-height: 26px;
  letter-spacing: -0.36px;
`;

const ActionDescription = styled.Text`
  color: ${color.gray50};
  font-size: 13px;
  font-family: ${font.pretendardRegular};
  line-height: 18px;
  letter-spacing: -0.26px;
`;

const CharacterWrapper = styled.View`
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: ${CHARACTER_SIZE}px;
  height: ${CHARACTER_SIZE}px;
  overflow: hidden;
`;

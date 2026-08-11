import {useSetAtom} from 'jotai';
import React from 'react';
import {Dimensions, Image} from 'react-native';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import useNavigation from '@/navigation/useNavigation';
import {searchModeAtom} from '@/screens/SearchScreen/atoms';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_HORIZONTAL_PADDING = 20;
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;
const CARD_HEIGHT = 120;
const CHARACTER_SIZE = CARD_WIDTH * 0.52; // ~90px on 390pt screen

// Sprite positioning from Figma design
// 조회하기: w=203.81% h=145.42% left=2.32% top=-15.43%
// 등록하기: w=231.25% h=165% left=-100.85% top=-31.11%

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

export default function QuickMenuSection() {
  const navigation = useNavigation();
  const setSearchMode = useSetAtom(searchModeAtom);

  const goToSearchPlace = () => {
    setSearchMode('place');
    navigation.navigate('Search', {
      initKeyword: '맛집',
      toMap: false,
      fromLookup: true,
    });
  };

  const goToConquer = () => {
    navigation.navigate('SearchUnconqueredPlaces', {});
  };

  return (
    <LogParamsProvider params={{displaySectionName: 'quick_menu_section'}}>
      <Container>
        <CardsRow>
          <SccPressable
            elementName="home_v2_quick_action_search"
            onPress={goToSearchPlace}
            style={{flex: 1}}>
            <SearchActionCard>
              <CardTextContainer>
                <ActionTitle>조회하기</ActionTitle>
                <ActionDescription>
                  접근성 기준으로{'\n'}장소 탐색하기
                </ActionDescription>
              </CardTextContainer>
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
            </SearchActionCard>
          </SccPressable>
          <SccPressable
            elementName="home_v2_quick_action_conquer"
            onPress={goToConquer}
            style={{flex: 1}}>
            <ConquerActionCard>
              <CardTextContainer>
                <ActionTitle>등록하기</ActionTitle>
                <ActionDescription>
                  정복 안 된 장소만{'\n'}모아보기
                </ActionDescription>
              </CardTextContainer>
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
            </ConquerActionCard>
          </SccPressable>
        </CardsRow>
      </Container>
    </LogParamsProvider>
  );
}

const Container = styled.View`
  padding-top: 24px;
  padding-bottom: 20px;
  padding-horizontal: 20px;
`;

const CardsRow = styled.View`
  flex-direction: row;
  gap: 12px;
`;

const BaseActionCard = styled.View`
  border-radius: 12px;
  height: ${CARD_HEIGHT}px;
  padding: 16px 15px;
  position: relative;
`;

const SearchActionCard = styled(BaseActionCard)`
  background-color: ${color.quickActionGreen};
`;

const ConquerActionCard = styled(BaseActionCard)`
  background-color: ${color.quickActionBlue};
`;

const CardTextContainer = styled.View`
  gap: 2px;
`;

const ActionTitle = styled.Text`
  color: ${color.gray80v2};
  font-size: 18px;
  font-family: ${font.pretendardBold};
  line-height: 26px;
  letter-spacing: -0.36px;
`;

const ActionDescription = styled.Text`
  color: ${color.gray50v2};
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

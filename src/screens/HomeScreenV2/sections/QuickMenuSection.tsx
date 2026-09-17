import {CommonActions, useIsFocused} from '@react-navigation/native';
import {useSetAtom} from 'jotai';
import React, {useEffect, useState} from 'react';
import {Dimensions, Image, View} from 'react-native';
import styled from 'styled-components/native';

import Tooltip from '@/components/Tooltip';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {HomeQuickActionChallengeDto} from '@/generated-sources/openapi';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import useNavigation from '@/navigation/useNavigation';
import ChallengeProgressBar from '@/screens/ChallengeDetailScreen/components/ChallengeProgressBar';
import {buildChallengeMapRoutes} from '@/screens/HomeScreenV2/sections/challengeMapRoutes';
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

// 스펙 확정 사항: "홈 진입마다, 몇 초 후 자동 소멸(영구 dismiss 없음)".
const TOOLTIP_VISIBLE_MS = 4000;

export default function QuickMenuSection({
  challenge,
}: {
  /** 홈 quick action 카드+툴팁 데이터. `getHomeScreenData` 응답의 `quickAction.challenge`
   * 그대로 — 서버가 카드와 툴팁 노출 여부(hasUnconqueredPlaceNearby)를 같은 챌린지 기준으로
   * 함께 판정해 내려준다. */
  challenge: HomeQuickActionChallengeDto | null | undefined;
}) {
  const navigation = useNavigation();
  const setSearchMode = useSetAtom(searchModeAtom);

  // 지도로 바로 보내되 챌린지 상세를 아래에 깔아, 지도를 닫으면 홈이 아니라 상세로 떨어지게 한다.
  // 이 컴포넌트는 Main 탭 네비게이터 안이라 useNavigation() 은 **탭** 네비게이터를 준다.
  // navigate 는 라우트 이름이 부모로 버블링돼 동작하지만, state 를 조립하는 dispatch 는
  // 버블링되지 않으므로 Main 을 담고 있는 루트 스택(getParent)으로 올려 보낸다.
  const goToChallengeMap = (challengeId: string) => {
    const rootNavigation = navigation.getParent() ?? navigation;
    rootNavigation.dispatch(state => {
      const routes = buildChallengeMapRoutes(
        state.routes,
        state.index,
        challengeId,
      );
      return CommonActions.reset({
        ...state,
        index: routes.length - 1,
        routes,
      });
    });
  };

  // 홈 탭에 진입(포커스)할 때마다 노출하고 몇 초 뒤 자동으로 닫는다. 영구 dismiss
  // atom을 두지 않는다 — 매번 다시 보여주는 게 스펙이 확정한 동작이다.
  const isFocused = useIsFocused();
  const [showNearbyTooltip, setShowNearbyTooltip] = useState(false);
  const hasUnconqueredPlaceNearby =
    challenge?.hasUnconqueredPlaceNearby ?? false;
  useEffect(() => {
    if (!isFocused || !hasUnconqueredPlaceNearby) {
      setShowNearbyTooltip(false);
      return;
    }
    setShowNearbyTooltip(true);
    const timer = setTimeout(
      () => setShowNearbyTooltip(false),
      TOOLTIP_VISIBLE_MS,
    );
    return () => clearTimeout(timer);
  }, [isFocused, hasUnconqueredPlaceNearby]);

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
        {challenge && (
          <View>
            {showNearbyTooltip && (
              <Tooltip
                text={`반경 500m내에 정복 안 된 ${challenge.displayName}이 있어요`}
                bubbleLeft={12}
                tailPosition={13}
                bubbleColor={color.gray90v2}
                // Figma 166:7422 실측: 툴팁 꼬리가 카드 상단에 살짝 걸친다.
                style={{marginBottom: -8}}
              />
            )}
            <SccPressable
              elementName="home_v2_ctpl_challenge_card"
              onPress={() => goToChallengeMap(challenge.challengeId)}>
              <ChallengeCard>
                <ChallengeCardHeader>
                  <ChallengeCardTitle numberOfLines={2}>
                    {`${challenge.displayName} 정복하기`}
                  </ChallengeCardTitle>
                  <ChallengeCardCount>
                    <ChallengeCardCountNumber>
                      {challenge.contributionsCount}
                    </ChallengeCardCountNumber>
                    <ChallengeCardCountGoal>
                      {` /${challenge.goal} 곳`}
                    </ChallengeCardCountGoal>
                  </ChallengeCardCount>
                </ChallengeCardHeader>
                <ChallengeProgressBar
                  size="home"
                  contributionsCount={challenge.contributionsCount}
                  goal={challenge.goal}
                  milestones={challenge.milestones}
                />
              </ChallengeCard>
            </SccPressable>
          </View>
        )}
      </Container>
    </LogParamsProvider>
  );
}

const Container = styled.View`
  padding-top: 24px;
  padding-bottom: 20px;
  padding-horizontal: 20px;
  gap: 12px;
`;

const CardsRow = styled.View`
  flex-direction: row;
  gap: 12px;
`;

const ChallengeCard = styled.View`
  background-color: ${color.gray15v2};
  border-radius: 12px;
  padding: 14px 16px 12px 16px;
  gap: 4px;
`;

const ChallengeCardHeader = styled.View`
  flex-direction: row;
  align-items: flex-end;
  gap: 20px;
`;

const ChallengeCardTitle = styled.Text`
  flex: 1;
  color: ${color.gray80v2};
  font-size: 18px;
  font-family: ${font.pretendardSemibold};
  line-height: 26px;
  letter-spacing: -0.36px;
`;

const ChallengeCardCount = styled.View`
  flex-direction: row;
  align-items: baseline;
`;

const ChallengeCardCountNumber = styled.Text`
  color: ${color.brand40};
  font-size: 24px;
  font-family: ${font.pretendardMedium};
  line-height: 32px;
`;

const ChallengeCardCountGoal = styled.Text`
  color: ${color.gray50v2};
  font-size: 15px;
  font-family: ${font.pretendardMedium};
  line-height: 22px;
  letter-spacing: -0.3px;
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

import React, {useCallback, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import FlagIcon from '@/assets/icon/ic_flag_colored.svg';
import PencilIcon from '@/assets/icon/ic_pencil_colored.svg';
import SirenIcon from '@/assets/icon/ic_siren_colored.svg';
import ThumbsUpYellowIcon from '@/assets/icon/ic_thumbsup_yellow.svg';
import MissionCompletedOverlay from '@/components/MissionCompletedOverlay/MissionCompletedOverlay';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {useCompleteUserTutorialUpvoteAccessibilityMission} from '@/hooks/useUserTutorialProgress';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {ScreenProps} from '@/navigation/Navigation.screens';
import V2AppBar from '@/screens/PlaceDetailV2Screen/components/V2AppBar';

const SCREEN_WIDTH = Dimensions.get('window').width;

// figma 1648:42184 의 body 컨테이너 비율 (390 × 1289). placeholder 자산이 정식 export 로 교체될 때까지
// 비율을 figma 기준으로 강제하여 스크롤 가능한 높이를 확보한다.
const PDP_BODY_FIGMA_WIDTH = 390;
const PDP_BODY_FIGMA_HEIGHT = 1289;
const PDP_BODY_RENDER_HEIGHT =
  (SCREEN_WIDTH * PDP_BODY_FIGMA_HEIGHT) / PDP_BODY_FIGMA_WIDTH;

const PLACE_NAME = '윌리가 너무 가고 싶어하는 카페';

type Phase = 'INITIAL_DIM' | 'AUTO_SCROLLING' | 'UPVOTE_DIM' | 'COMPLETED';

/**
 * 튜토리얼 미션 3 (UPVOTE_ACCESSIBILITY) 전용 가짜 PDP 화면.
 *
 * - 정적 PDP body 이미지를 ScrollView 안에 배치한다.
 * - 헤더 / 하단 floating bar 는 PlaceDetailV2Screen 의 스크롤 보간 로직과 동일하게 동작한다.
 * - 사용자가 스크롤을 시작하면 초기 dim 이 사라지고 자동으로 하단까지 scroll.
 * - 하단에 도달하면 도움돼요 spotlight + tooltip 노출.
 * - 도움돼요 탭 → `/completeUserTutorialUpvoteAccessibilityMission` 호출 → 완료 팝업.
 *
 * 실제 장소가 아니므로 `/giveUpvote` 는 호출하지 않는다.
 */
export default function TutorialUpvoteAccessibilityMissionScreen({
  navigation,
}: ScreenProps<'TutorialUpvoteAccessibilityMission'>) {
  const insets = useSafeAreaInsets();
  const completeMission = useCompleteUserTutorialUpvoteAccessibilityMission();

  const scrollViewRef = useRef<ScrollView>(null);
  const phaseRef = useRef<Phase>('INITIAL_DIM');
  const [phase, setPhaseState] = useState<Phase>('INITIAL_DIM');
  const setPhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);

  const [showAppBarTitle, setShowAppBarTitle] = useState(false);
  const bottomBarAnim = useRef(new Animated.Value(0)).current;

  // PlaceDetailV2Screen 와 동일하게 layout y 좌표를 ref 로 측정.
  const nameBottomYRef = useRef(220); // figma 기준 place name 하단 추정값 (status bar + app bar + name 영역 ≈ 220)
  const bottomBarLayoutRef = useRef({top: 0, bottom: 0});
  const [upvoteHolePosition, setUpvoteHolePosition] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollY = e.nativeEvent.contentOffset.y;
      const shouldShowTitle = scrollY > nameBottomYRef.current;
      setShowAppBarTitle(prev =>
        prev !== shouldShowTitle ? shouldShowTitle : prev,
      );

      // bottom bar slide-in: 스크롤이 일정 지점 이상이면 노출.
      const showBar = scrollY > 100;
      bottomBarAnim.setValue(showBar ? 1 : 0);
    },
    [bottomBarAnim],
  );

  const handleScrollBeginDrag = useCallback(() => {
    if (phaseRef.current !== 'INITIAL_DIM') {
      return;
    }
    setPhase('AUTO_SCROLLING');
    // 사용자의 스크롤 제스처 직후 자동으로 하단까지 이동.
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({animated: true});
    }, 50);
  }, [setPhase]);

  const handleMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (phaseRef.current !== 'AUTO_SCROLLING') {
        return;
      }
      const {contentOffset, contentSize, layoutMeasurement} = e.nativeEvent;
      const atBottom =
        contentOffset.y + layoutMeasurement.height >= contentSize.height - 8;
      if (atBottom) {
        setPhase('UPVOTE_DIM');
      }
    },
    [setPhase],
  );

  const handleUpvoteButtonLayout = useCallback((e: LayoutChangeEvent) => {
    const {x, y, width, height} = e.nativeEvent.layout;
    setUpvoteHolePosition({x, y, width, height});
  }, []);

  const handleBottomBarLayout = useCallback((e: LayoutChangeEvent) => {
    const {y, height} = e.nativeEvent.layout;
    bottomBarLayoutRef.current = {top: y, bottom: y + height};
  }, []);

  const handlePressUpvote = useCallback(() => {
    if (phaseRef.current === 'COMPLETED' || completeMission.isPending) {
      return;
    }
    completeMission.mutate(undefined, {
      onSuccess: () => {
        setPhase('COMPLETED');
      },
    });
  }, [completeMission, setPhase]);

  const handleClosePopup = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const description = `돋보기 획득!\n꼼꼼하고 다정하게 정보를\n살펴봐주셔서 고마워요!`;

  return (
    <Root>
      <LogParamsProvider
        params={{displaySectionName: 'tutorial_mission_3_upvote'}}>
        <SafeTop style={{height: insets.top}} />
        <ScrollView
          ref={scrollViewRef}
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBeginDrag}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}>
          <Image
            // TODO: figma 1648:42184 의 body 전체를 3x PNG 로 export 한 자산으로 교체.
            // 현재는 build 가 통과되도록 mission_complete_img_map.png 를 복사해둔 placeholder.
            source={require('@/assets/img/tutorial/tutorial_mission_3_pdp_body.png')}
            style={{
              width: SCREEN_WIDTH,
              height: PDP_BODY_RENDER_HEIGHT,
            }}
            resizeMode="cover"
          />
        </ScrollView>

        {/* Sticky header — V2AppBar 재사용. PDP 와 동일한 title appear 보간. */}
        <HeaderOverlay style={{top: insets.top}}>
          <V2AppBar
            placeName={PLACE_NAME}
            showTitle={showAppBarTitle}
            isFavorite={false}
            onToggleFavorite={() => {}}
            onShare={() => {}}
            onBack={() => navigation.goBack()}
          />
        </HeaderOverlay>

        {/* Sticky bottom bar — V2BottomBar 의 control variant 시각 복제. experiment 영향 배제. */}
        <Animated.View
          onLayout={handleBottomBarLayout}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            opacity: bottomBarAnim,
            transform: [
              {
                translateY: bottomBarAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
          }}>
          <Mission3BottomBar
            bottomInset={insets.bottom}
            onPressUpvote={handlePressUpvote}
            onUpvoteLayout={handleUpvoteButtonLayout}
          />
        </Animated.View>

        {/* State 1: 초기 dim + 스크롤 가이드. */}
        {phase === 'INITIAL_DIM' && (
          <InitialDimOverlay pointerEvents="none" style={{top: insets.top}}>
            <ArrowUp>↑</ArrowUp>
            <GuideText>
              <GuideHighlight>스크롤</GuideHighlight>하면 더 많은 정보를{'\n'}
              확인할 수 있어요
            </GuideText>
          </InitialDimOverlay>
        )}

        {/* State 3: 도움돼요 spotlight + tooltip. 4개 dim rect 로 hole 구성. */}
        {phase === 'UPVOTE_DIM' && upvoteHolePosition && (
          <SpotlightOverlay
            holeX={upvoteHolePosition.x}
            holeY={bottomBarLayoutRef.current.top + upvoteHolePosition.y}
            holeWidth={upvoteHolePosition.width}
            holeHeight={upvoteHolePosition.height}
          />
        )}

        {/* State 4: 미션 완료 팝업. */}
        <MissionCompletedOverlay
          isVisible={phase === 'COMPLETED'}
          itemImage={require('@/assets/img/tutorial/mission_complete_img_magnifier.png')}
          description={description}
          confirmElementName="tutorial_mission_3_completed_confirm"
          onClose={handleClosePopup}
        />
      </LogParamsProvider>
    </Root>
  );
}

interface Mission3BottomBarProps {
  bottomInset: number;
  onPressUpvote: () => void;
  onUpvoteLayout: (e: LayoutChangeEvent) => void;
}

/**
 * V2BottomBar 의 control variant 를 시각 복제한 튜토리얼 전용 floating bar.
 * 실제 PDP 의 experiment variant 영향을 받지 않도록 별도 컴포넌트로 분리.
 */
function Mission3BottomBar({
  bottomInset,
  onPressUpvote,
  onUpvoteLayout,
}: Mission3BottomBarProps) {
  return (
    <BarContainer bottomInset={bottomInset}>
      <BarRow>
        <UpvoteButton
          onLayout={onUpvoteLayout}
          elementName="tutorial_mission_3_upvote_button"
          onPress={onPressUpvote}>
          <ThumbsUpYellowIcon width={16} height={16} />
          <UpvoteText numberOfLines={1}>도움돼요</UpvoteText>
        </UpvoteButton>
        <NoopActionButton
          elementName="tutorial_mission_3_register_button"
          onPress={() => {}}>
          <FlagIcon width={16} height={16} />
          <NoopActionText numberOfLines={1}>정보등록</NoopActionText>
        </NoopActionButton>
        <NoopActionButton
          elementName="tutorial_mission_3_review_button"
          onPress={() => {}}>
          <PencilIcon width={16} height={16} />
          <NoopActionText numberOfLines={1}>리뷰작성</NoopActionText>
        </NoopActionButton>
        <NoopSirenButton
          elementName="tutorial_mission_3_siren_button"
          onPress={() => {}}>
          <SirenIcon width={20} height={20} />
        </NoopSirenButton>
      </BarRow>
    </BarContainer>
  );
}

interface SpotlightOverlayProps {
  holeX: number;
  holeY: number;
  holeWidth: number;
  holeHeight: number;
}

/**
 * 도움돼요 버튼 위치만 비워두고 나머지를 dim 처리하는 spotlight.
 * 4개의 dim rect (위/아래/왼쪽/오른쪽) 로 hole 을 구성한다.
 * tooltip 은 hole 위쪽에 표시한다.
 */
function SpotlightOverlay({
  holeX,
  holeY,
  holeWidth,
  holeHeight,
}: SpotlightOverlayProps) {
  const SCREEN_HEIGHT = Dimensions.get('window').height;
  return (
    <>
      {/* top rect */}
      <DimRect style={{top: 0, left: 0, right: 0, height: holeY}} />
      {/* bottom rect */}
      <DimRect
        style={{
          top: holeY + holeHeight,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      {/* left rect */}
      <DimRect
        style={{
          top: holeY,
          left: 0,
          width: holeX,
          height: holeHeight,
        }}
      />
      {/* right rect */}
      <DimRect
        style={{
          top: holeY,
          left: holeX + holeWidth,
          right: 0,
          height: holeHeight,
        }}
      />
      {/* tooltip */}
      <TooltipContainer style={{bottom: SCREEN_HEIGHT - holeY + 24}}>
        <TooltipText>[도움돼요]버튼을 눌러보세요!</TooltipText>
      </TooltipContainer>
    </>
  );
}

const Root = styled.View`
  flex: 1;
  background-color: ${color.white};
`;

const SafeTop = styled.View`
  background-color: ${color.white};
`;

const HeaderOverlay = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  background-color: ${color.white};
`;

const InitialDimOverlay = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.55);
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const ArrowUp = styled.Text`
  font-size: 64px;
  color: ${color.white};
`;

const GuideText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  text-align: center;
  color: ${color.white};
`;

const GuideHighlight = styled.Text`
  color: #ffe247;
  font-family: ${font.pretendardBold};
`;

const DimRect = styled.View`
  position: absolute;
  background-color: rgba(0, 0, 0, 0.55);
`;

const TooltipContainer = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  align-items: center;
`;

const TooltipText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: #ffe247;
`;

const BarContainer = styled.View<{bottomInset: number}>`
  background-color: ${color.white};
  shadow-color: #000;
  shadow-offset: 0px -4px;
  shadow-opacity: 0.12;
  shadow-radius: 16px;
  padding-top: 12px;
  padding-bottom: ${({bottomInset}) => 24 + bottomInset}px;
  padding-horizontal: 20px;
`;

const BarRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const UpvoteButton = styled(SccPressable)`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 0px;
  border-radius: 8px;
  overflow: hidden;
  background-color: ${color.brand40};
`;

const UpvoteText = styled.Text.attrs({
  style: {includeFontPadding: false, textAlignVertical: 'center'},
})`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  color: ${color.white};
  flex-shrink: 1;
`;

const NoopActionButton = styled(SccPressable)`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 0px;
  border-radius: 8px;
  overflow: hidden;
  background-color: ${color.gray15};
`;

const NoopActionText = styled.Text.attrs({
  style: {includeFontPadding: false, textAlignVertical: 'center'},
})`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  color: #24262b;
  flex-shrink: 1;
`;

const NoopSirenButton = styled(SccPressable)`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background-color: ${color.gray15};
`;

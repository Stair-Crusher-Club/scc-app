import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Defs, LinearGradient, Mask, Rect, Stop} from 'react-native-svg';
import styled from 'styled-components/native';

import DashedArrowUpIcon from '@/assets/icon/ic_dashed_arrow_up.svg';
import FlagIcon from '@/assets/icon/ic_flag_colored.svg';
import PencilIcon from '@/assets/icon/ic_pencil_colored.svg';
import SirenIcon from '@/assets/icon/ic_siren_colored.svg';
import ThumbsUpYellowIcon from '@/assets/icon/ic_thumbsup_yellow.svg';
import TooltipArrowIcon from '@/assets/icon/ic_tooltip_arrow.svg';
import MissionCompletedOverlay from '@/components/MissionCompletedOverlay/MissionCompletedOverlay';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {useCompleteUserTutorialUpvoteAccessibilityMission} from '@/hooks/useUserTutorialProgress';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {ScreenProps} from '@/navigation/Navigation.screens';
import V2AppBar from '@/screens/PlaceDetailV2Screen/components/V2AppBar';

const SCREEN_WIDTH = Dimensions.get('window').width;

// figma 1648:41636 (390 × 1857) 에서 app bar(94) + floating bar(80) 영역을 잘라낸 본문 — 390 × 1683.
// 자산은 Android 비트맵 디코딩 한계(약 5MP 이상에서 "Problem decoding into existing bitmap")를
// 회피하기 위해 세로로 반쪽씩 분할: top 1170×2524, bottom 1170×2525.
const PDP_BODY_TOP_WIDTH = 1170;
const PDP_BODY_TOP_HEIGHT = 2524;
const PDP_BODY_BOTTOM_HEIGHT = 2525;
const PDP_BODY_TOP_RENDER_HEIGHT =
  (SCREEN_WIDTH * PDP_BODY_TOP_HEIGHT) / PDP_BODY_TOP_WIDTH;
const PDP_BODY_BOTTOM_RENDER_HEIGHT =
  (SCREEN_WIDTH * PDP_BODY_BOTTOM_HEIGHT) / PDP_BODY_TOP_WIDTH;

// figma 1648:41636 에서 "매장 출입구" 섹션은 body 시작점 기준 y=526dp (1648:41652 위치, app bar 빼고).
// V2AppBar(50dp) 가 viewport 상단을 덮으므로 그만큼 덜 스크롤해서 섹션 header 가 viewport 에 보이게 한다.
const V2_APP_BAR_HEIGHT = 50;
const SCROLL_TARGET_Y = (526 * SCREEN_WIDTH) / 390 - V2_APP_BAR_HEIGHT;

// figma 1648:42314 spotlight subtract rect 의 border-radius 12px 매칭 (실제 도움돼요 버튼의
// border-radius 는 8 이지만 figma punch rect 는 외곽 padding 포함이므로 약간 더 크게).
const SPOTLIGHT_BORDER_RADIUS = 12;

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
  // Root 의 window-y 시작점. measureInWindow 결과(window-absolute) 를 Root 좌표로
  // 변환하기 위해 빼준다. Stack.Navigator 등이 Root 위에 system inset 을 두면
  // measureInWindow 와 dim rect 의 좌표계가 어긋난다.
  const rootRef = useRef<View>(null);
  const rootOffsetRef = useRef({x: 0, y: 0});
  // 도움돼요 버튼 ref. measureInWindow 로 window-absolute 좌표를 받아 spotlight hole 을 정확히 fit.
  const upvoteButtonRef = useRef<View>(null);
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
    // 매장 출입구 섹션이 viewport 최상단에 오는 위치(SCROLL_TARGET_Y)까지 부드럽게 자동 스크롤.
    // 화면 폭이 달라도 figma 비례를 그대로 따라가므로 매번 같은 위치에 도달한다.
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({y: SCROLL_TARGET_Y, animated: true});
    }, 50);
  }, [setPhase]);

  const handleMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (phaseRef.current !== 'AUTO_SCROLLING') {
        return;
      }
      const {contentOffset} = e.nativeEvent;
      // 목표 위치(SCROLL_TARGET_Y) 근처에 도달했으면 UPVOTE_DIM 으로 전환.
      if (Math.abs(contentOffset.y - SCROLL_TARGET_Y) < 4) {
        setPhase('UPVOTE_DIM');
      }
    },
    [setPhase],
  );

  // UPVOTE_DIM 진입 시 도움돼요 버튼의 화면 절대 좌표를 측정한다.
  // 한 번 측정해도 layout 직후엔 0 이 나올 수 있어 짧은 retry 를 한다.
  // measureInWindow 결과는 window-absolute 이므로 Root 의 window 시작점(rootOffsetRef) 을
  // 빼서 Root 좌표계로 변환한다. 그래야 absolute positioning 한 dim rect 와 정확히 align 된다.
  useEffect(() => {
    if (phase !== 'UPVOTE_DIM') {
      return;
    }
    let cancelled = false;
    const tryMeasure = (attempt: number) => {
      if (cancelled) {
        return;
      }
      upvoteButtonRef.current?.measureInWindow((x, y, width, height) => {
        if (cancelled) {
          return;
        }
        if (width > 0 && height > 0) {
          const rootX = rootOffsetRef.current.x;
          const rootY = rootOffsetRef.current.y;
          setUpvoteHolePosition({
            x: x - rootX,
            y: y - rootY,
            width,
            height,
          });
        } else if (attempt < 6) {
          setTimeout(() => tryMeasure(attempt + 1), 50);
        }
      });
    };
    // bottom bar slide-in 애니메이션(300ms 미만) 이후 측정.
    const timer = setTimeout(() => tryMeasure(0), 100);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [phase]);

  // Root 의 window-y 시작점을 측정. 마운트 후 layout 이 stable 해진 다음 측정한다.
  const handleRootLayout = useCallback(() => {
    rootRef.current?.measureInWindow((x, y) => {
      rootOffsetRef.current = {x, y};
    });
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
    <View
      ref={rootRef}
      onLayout={handleRootLayout}
      style={{flex: 1, backgroundColor: color.white}}>
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
            source={require('@/assets/img/tutorial/tutorial_mission_3_pdp_body_top.png')}
            style={{
              width: SCREEN_WIDTH,
              height: PDP_BODY_TOP_RENDER_HEIGHT,
            }}
            resizeMode="stretch"
          />
          <Image
            source={require('@/assets/img/tutorial/tutorial_mission_3_pdp_body_bottom.png')}
            style={{
              width: SCREEN_WIDTH,
              height: PDP_BODY_BOTTOM_RENDER_HEIGHT,
            }}
            resizeMode="stretch"
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
            upvoteRef={upvoteButtonRef}
            onPressUpvote={handlePressUpvote}
          />
        </Animated.View>

        {/* State 1: 초기 dim + 스크롤 가이드. figma 1648:41633 (텍스트), 1821:18739 (backdrop). */}
        {phase === 'INITIAL_DIM' && (
          <InitialDimOverlay pointerEvents="none" style={{top: insets.top}}>
            {/* 화살표 뒤 흰색 그라데이션 backdrop. arrow 와 동일 컨테이너에서 absolute 로 겹쳐 둠. */}
            <ArrowStack>
              <Svg
                width={72}
                height={240}
                style={{position: 'absolute', top: -64}}>
                <Defs>
                  <LinearGradient
                    id="arrowBackdrop"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1">
                    <Stop offset="0" stopColor="#ffffff" stopOpacity={0.8} />
                    <Stop offset="0.85" stopColor="#ffffff" stopOpacity={0} />
                  </LinearGradient>
                </Defs>
                <Rect
                  x={0}
                  y={0}
                  width={72}
                  height={240}
                  rx={36}
                  ry={36}
                  fill="url(#arrowBackdrop)"
                />
              </Svg>
              <DashedArrowUpIcon width={29} height={113} color="#ffffff" />
            </ArrowStack>
            <GuideText>
              <GuideHighlight>스크롤</GuideHighlight>하면 더 많은 정보를{'\n'}
              확인할 수 있어요
            </GuideText>
          </InitialDimOverlay>
        )}

        {/* State 3: 도움돼요 spotlight + tooltip. 4개 dim rect 로 hole 구성.
            holePadding 으로 버튼 주위에 약간의 여유를 주어 디자인 의도(figma 1648:42314) 와 동일하게 fit. */}
        {phase === 'UPVOTE_DIM' && upvoteHolePosition && (
          <SpotlightOverlay
            holeX={upvoteHolePosition.x}
            holeY={upvoteHolePosition.y}
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
    </View>
  );
}

interface Mission3BottomBarProps {
  bottomInset: number;
  upvoteRef: React.Ref<View>;
  onPressUpvote: () => void;
}

/**
 * V2BottomBar 의 control variant 를 시각 복제한 튜토리얼 전용 floating bar.
 * 실제 PDP 의 experiment variant 영향을 받지 않도록 별도 컴포넌트로 분리.
 */
function Mission3BottomBar({
  bottomInset,
  upvoteRef,
  onPressUpvote,
}: Mission3BottomBarProps) {
  return (
    <BarContainer bottomInset={bottomInset}>
      <BarRow>
        <UpvoteButton
          ref={upvoteRef}
          elementName="tutorial_mission_3_upvote_button"
          onPress={onPressUpvote}
          android_ripple={{color: 'rgba(255,255,255,0.35)'}}>
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

// 버튼 모서리(border-radius 8) 와 hole 의 디자인 의도(figma 1648:42314)에 맞춰 외곽 padding 을 추가한다.
const HOLE_PADDING = 4;
// figma 1648:42181 — tooltip 옆 curved arrow size (25.5 × 27.7).
const TOOLTIP_ARROW_WIDTH = 25.5;
const TOOLTIP_ARROW_HEIGHT = 27.7;

/**
 * 도움돼요 버튼 위치만 비워두고 나머지를 dim 처리하는 spotlight.
 * 4개의 dim rect (위/아래/왼쪽/오른쪽) 로 hole 을 구성한다.
 * 좌표는 window-absolute (measureInWindow 결과) 이며 SpotlightOverlay 가
 * full-screen Root 안에서 absolute positioning 되므로 그대로 사용한다.
 * pointerEvents="box-none" 으로 hole 영역의 터치는 아래(도움돼요 버튼)로 전달된다.
 */
function SpotlightOverlay({
  holeX,
  holeY,
  holeWidth,
  holeHeight,
}: SpotlightOverlayProps) {
  const hX = holeX - HOLE_PADDING;
  const hY = holeY - HOLE_PADDING;
  const hW = holeWidth + HOLE_PADDING * 2;
  const hH = holeHeight + HOLE_PADDING * 2;
  const {width: winW, height: winH} = Dimensions.get('window');
  // SVG mask 로 dim rect 에 rounded rect hole 을 punch out. 4-rect 방식과 달리 hole 모서리에
  // border-radius 적용 가능.
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Svg
        width={winW}
        height={winH}
        style={StyleSheet.absoluteFill}
        pointerEvents="none">
        <Defs>
          <Mask id="spotlightHole" x="0" y="0" width={winW} height={winH}>
            {/* white = visible (dim 적용), black = invisible (hole) */}
            <Rect x={0} y={0} width={winW} height={winH} fill="white" />
            <Rect
              x={hX}
              y={hY}
              width={hW}
              height={hH}
              rx={SPOTLIGHT_BORDER_RADIUS}
              ry={SPOTLIGHT_BORDER_RADIUS}
              fill="black"
            />
          </Mask>
        </Defs>
        <Rect
          x={0}
          y={0}
          width={winW}
          height={winH}
          fill="rgba(0,0,0,0.7)"
          mask="url(#spotlightHole)"
        />
      </Svg>
      {/* tooltip — hole 바로 위에 표시. top 기준으로 anchor (Root 높이가 window 와 달라도 안전) */}
      <TooltipContainer style={{top: hY - 32}}>
        <TooltipText>
          <TooltipHighlight>[도움돼요]</TooltipHighlight>버튼을 눌러보세요!
        </TooltipText>
      </TooltipContainer>
      {/* tooltip 옆 curved arrow (figma 1648:42181). text 와 button 사이를 가리킴. */}
      <TooltipArrowIcon
        width={TOOLTIP_ARROW_WIDTH}
        height={TOOLTIP_ARROW_HEIGHT}
        color="#ffffff"
        style={{
          position: 'absolute',
          left: hX + hW * 0.55,
          top: hY - TOOLTIP_ARROW_HEIGHT - 2,
        }}
      />
    </View>
  );
}

const SafeTop = styled.View`
  background-color: ${color.white};
`;

const HeaderOverlay = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  background-color: ${color.white};
`;

// figma 1648:41632 — dim rgba(0,0,0,0.7).
const InitialDimOverlay = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

// figma 1648:41633 — Pretendard SemiBold 20/28, letter-spacing -0.4, white, center.
const GuideText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 20px;
  line-height: 28px;
  letter-spacing: -0.4px;
  text-align: center;
  color: ${color.white};
`;

// figma — 강조 색 #c3f708 (yellow-green).
const GuideHighlight = styled.Text`
  color: #c3f708;
`;

// 화살표 + backdrop 을 겹쳐 두기 위한 stack 컨테이너.
const ArrowStack = styled.View`
  width: 72px;
  height: 113px;
  align-items: center;
  justify-content: center;
`;

const TooltipContainer = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  align-items: center;
`;

// figma 1648:42315 — Pretendard SemiBold 20/28, letter-spacing -0.4. 부분 강조는 nested span.
const TooltipText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 20px;
  line-height: 28px;
  letter-spacing: -0.4px;
  color: ${color.white};
`;

const TooltipHighlight = styled.Text`
  color: #c3f708;
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

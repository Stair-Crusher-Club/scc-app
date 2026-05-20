import {useAtomValue} from 'jotai';
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
import Svg, {Defs, Mask, Rect} from 'react-native-svg';
import styled from 'styled-components/native';

import FlagIcon from '@/assets/icon/ic_flag_colored.svg';
import PencilIcon from '@/assets/icon/ic_pencil_colored.svg';
import SirenIcon from '@/assets/icon/ic_siren_colored.svg';
import ThumbsUpYellowIcon from '@/assets/icon/ic_thumbsup_yellow.svg';
import {featureFlagAtom} from '@/atoms/Auth';
import MissionCompletedOverlay from '@/components/MissionCompletedOverlay/MissionCompletedOverlay';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {useCompleteUserTutorialMission} from '@/hooks/useUserTutorialProgress';
import {TutorialMissionTypeDto} from '@/generated-sources/openapi';
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
const V2_APP_BAR_HEIGHT = 50;
// ScrollView contentContainer 상단에 V2_APP_BAR_HEIGHT 만큼 padding 을 주어 (absolute 로
// 띄워진 V2AppBar 가 body 이미지 최상단을 덮지 않게) — 따라서 섹션이 viewport 상단(=appbar 바로 아래)
// 에 보이려면 scrollY = body offset (paddingTop 은 자연스럽게 보정됨).
const SCROLL_TARGET_Y = (526 * SCREEN_WIDTH) / 390;
// figma 1648:41483 frame 은 390 wide. 화면 폭이 다르더라도 디자인 비율을 그대로 유지.
const INITIAL_DIM_SCALE = SCREEN_WIDTH / 390;

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
  const featureFlags = useAtomValue(featureFlagAtom);
  const completeMission = useCompleteUserTutorialMission();

  // USER_TUTORIAL feature flag 미대상 사용자가 deeplink 등으로 우회 진입한 경우 broken UX
  // 노출 방지. featureFlags === null (아직 getUserInfo 응답 전 / 익명 유저) 동안은 대기.
  useEffect(() => {
    if (featureFlags && !featureFlags.enabledFlags.has('USER_TUTORIAL')) {
      navigation.goBack();
    }
  }, [featureFlags, navigation]);

  const scrollViewRef = useRef<ScrollView>(null);
  const phaseRef = useRef<Phase>('INITIAL_DIM');
  const [phase, setPhaseState] = useState<Phase>('INITIAL_DIM');
  const setPhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);
  // 팝업 가시성을 phase 와 분리해 관리한다. "확인" 을 누르면 팝업 닫음 + 튜토리얼 메인 화면 (TutorialMissionScreen)
  // 으로 복귀 (navigation.goBack). phase 는 COMPLETED 로 유지되어 재 mutation 방지.
  const [isCompletedPopupVisible, setIsCompletedPopupVisible] = useState(false);

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

  // INITIAL_DIM 에서 사용자 터치(swipe / tap) 가 감지되면 한 번만 auto-scroll 발동.
  // ScrollView 자체는 scrollEnabled=false 라 유저는 자유롭게 스크롤 못 한다.
  const handleScrollTrigger = useCallback(() => {
    if (phaseRef.current !== 'INITIAL_DIM') {
      return;
    }
    setPhase('AUTO_SCROLLING');
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({y: SCROLL_TARGET_Y, animated: true});
    }, 50);
  }, [setPhase]);

  const handleMomentumScrollEnd = useCallback(() => {
    if (phaseRef.current !== 'AUTO_SCROLLING') {
      return;
    }
    setPhase('UPVOTE_DIM');
  }, [setPhase]);

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
    completeMission.mutate(
      {missionType: TutorialMissionTypeDto.UpvoteAccessibility},
      {
        onSuccess: () => {
          setPhase('COMPLETED');
          setIsCompletedPopupVisible(true);
        },
      },
    );
  }, [completeMission, setPhase]);

  // 팝업 "확인" → 팝업 닫음 + TutorialMissionScreen 으로 popTo.
  // (미션 3 은 메인 미션 중 마지막이므로 사용자가 자연스럽게 튜토리얼 홈으로 복귀.)
  const handleClosePopup = useCallback(() => {
    setIsCompletedPopupVisible(false);
    navigation.popTo('TutorialMission', {scrollResetToken: Date.now()});
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
          onMomentumScrollEnd={handleMomentumScrollEnd}
          scrollEventThrottle={16}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingTop: V2_APP_BAR_HEIGHT}}>
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

        {/* State 1: 초기 dim + 스크롤 가이드. backdrop + arrow 는 figma 1648:41631 의 통짜
            export PNG (tutorial_mission_3_scroll_guide_arrow). 텍스트는 figma 1648:41633.
            화면 터치 1번 → auto-scroll trigger + 이후 스크롤 차단. */}
        {phase === 'INITIAL_DIM' && (
          <InitialDimOverlay
            onStartShouldSetResponder={() => true}
            onResponderRelease={handleScrollTrigger}
            style={{top: insets.top}}>
            <Image
              source={require('@/assets/img/tutorial/tutorial_mission_3_scroll_guide_arrow.png')}
              style={{
                width: 72 * INITIAL_DIM_SCALE,
                height: 240 * INITIAL_DIM_SCALE,
              }}
              resizeMode="contain"
            />
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
          isVisible={isCompletedPopupVisible}
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

interface TooltipBlockProps {
  holeX: number;
  holeY: number;
  holeWidth: number;
}

/**
 * "[도움돼요]버튼을 눌러보세요!" 텍스트 + 굽어진 화살표 를 한 컴포넌트로 묶음.
 * 컴포넌트는 button top-left (holeX, holeY) 를 anchor 로 absolute 배치하고,
 * 내부에서 figma 1648-42182 의 정확한 offset 대로 텍스트/화살표 위치를 잡는다:
 *   - 텍스트: button left + 98dp, button top - 40dp (= figma 1648:42315)
 *   - 화살표: button left + 82dp, button top - 2dp (= figma 1648:42181 displayed bbox)
 */
function TooltipBlock({holeX, holeY}: TooltipBlockProps) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: holeX,
        top: holeY,
        width: 0,
        height: 0,
      }}>
      {/* 텍스트 — 컴포넌트 anchor 기준 (98, -40). single line, paddingLeft 없음. */}
      <View
        style={{
          position: 'absolute',
          left: 98,
          top: -40,
        }}>
        <TooltipText>
          <TooltipHighlight>[도움돼요]</TooltipHighlight>버튼을 눌러보세요!
        </TooltipText>
      </View>
      {/* 화살표 — 컴포넌트 anchor 기준 (62, -26). 18 dp 높이라 button top 아래로 16 dp 들어감
          (figma 의도: 화살촉이 버튼 상단 근처에 닿음). */}
      <Image
        source={require('@/assets/img/tutorial/tutorial_mission_3_tooltip_arrow.png')}
        style={{
          position: 'absolute',
          left: 62,
          top: -26,
          width: TOOLTIP_ARROW_WIDTH,
          height: TOOLTIP_ARROW_HEIGHT,
        }}
        resizeMode="contain"
      />
    </View>
  );
}

// 버튼 모서리(border-radius 8) 와 hole 의 디자인 의도(figma 1648:42314)에 맞춰 외곽 padding 을 추가한다.
const HOLE_PADDING = 4;
// figma 1648:42181 export PNG (transforms baked) — 96×54 px @3x = 32×18 dp.
const TOOLTIP_ARROW_WIDTH = 32;
const TOOLTIP_ARROW_HEIGHT = 18;
/**
 * 도움돼요 버튼 위치만 비워두고 나머지를 dim 처리하는 spotlight.
 * SVG mask 로 dim rect 에 rounded rect hole 을 punch out (4-rect 방식과 달리 hole 모서리에
 * border-radius 적용 가능).
 * 좌표는 window-absolute (measureInWindow 결과) 이며 SpotlightOverlay 가
 * full-screen Root 안에서 absolute positioning 되므로 그대로 사용한다.
 *
 * pointerEvents="none" 으로 overlay 전체가 터치를 가로채지 않게 한다 — hole 영역의
 * 도움돼요 버튼 탭이 정상 동작해야 한다. react-native-svg Svg 컴포넌트는 일부 Android 버전에서
 * `pointerEvents="none"` 만 prop 으로 줘서는 native view 가 여전히 터치를 잡는 케이스가
 * 있으므로, 부모 View 를 `pointerEvents="none"` 으로 잠가서 자식까지 전파시키는 것이 안전하다.
 * (overlay 의 모든 자식 — dim svg, tooltip text/arrow — 은 시각 전용이라 터치 받을 일이 없음.)
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
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
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
      {/* tooltip block — 텍스트 + 화살표를 한 컴포넌트로 묶고 spotlight hole 위에 absolute
          으로 고정 픽셀만큼 띄워서 배치. 컴포넌트 내부에서 텍스트/화살표 위치를 조정. */}
      <TooltipBlock holeX={holeX} holeY={holeY} holeWidth={holeWidth} />
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

// figma 1648:41632 — dim rgba(0,0,0,0.7). backdrop+arrow PNG + 가이드 텍스트를 flex 로 중앙 배치.
const InitialDimOverlay = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  align-items: center;
  justify-content: center;
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

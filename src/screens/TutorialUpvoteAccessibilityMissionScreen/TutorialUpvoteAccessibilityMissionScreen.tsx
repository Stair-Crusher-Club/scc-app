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
  // 도움돼요 버튼 실제 화면 좌표. onLayout 은 직접 parent 기준이라 nested layout 이 있으면 어긋난다.
  // 대신 `measureInWindow` 로 화면(window) 절대 좌표를 측정해서 spotlight hole 을 정확히 fit 시킨다.
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

  // UPVOTE_DIM 진입 시 도움돼요 버튼의 화면 절대 좌표를 측정한다.
  // 한 번 측정해도 layout 직후엔 0 이 나올 수 있어 짧은 retry 를 한다.
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
          setUpvoteHolePosition({x, y, width, height});
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
    </Root>
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

// 버튼 모서리(border-radius 8) 와 sharp rect hole 의 미세한 mismatch 를 가리고 디자인 의도대로
// 약간의 여유를 주기 위해 dim 외곽에 padding 을 추가한다.
const HOLE_PADDING = 4;

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
  const SCREEN_HEIGHT = Dimensions.get('window').height;
  const hX = holeX - HOLE_PADDING;
  const hY = holeY - HOLE_PADDING;
  const hW = holeWidth + HOLE_PADDING * 2;
  const hH = holeHeight + HOLE_PADDING * 2;
  // 단일 View 로 묶는다. fragment 로 4개 dim rect + tooltip 을 반환하면 Fabric 의
  // mount index 가 부모의 conditional rendering 과 충돌해 addViewAt 가 실패한다.
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* top rect */}
      <DimRect style={{top: 0, left: 0, right: 0, height: hY}} />
      {/* bottom rect */}
      <DimRect
        style={{
          top: hY + hH,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      {/* left rect */}
      <DimRect
        style={{
          top: hY,
          left: 0,
          width: hX,
          height: hH,
        }}
      />
      {/* right rect */}
      <DimRect
        style={{
          top: hY,
          left: hX + hW,
          right: 0,
          height: hH,
        }}
      />
      {/* tooltip */}
      <TooltipContainer style={{bottom: SCREEN_HEIGHT - hY + 24}}>
        <TooltipText>[도움돼요]버튼을 눌러보세요!</TooltipText>
      </TooltipContainer>
    </View>
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

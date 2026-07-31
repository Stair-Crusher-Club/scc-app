import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import CloseIcon from '@/assets/icon/close.svg';
import {SccPressable} from '@/components/SccPressable';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {PlaceAiSummaryDownvoteReasonDto} from '@/generated-sources/openapi';
import {LogView} from '@/logging/LogView';

const COMMENT_MAX_LENGTH = 300;

const SCREEN_HEIGHT = Dimensions.get('window').height;
// 등장/스프링백 공통. overshoot 이 살짝 남아 있어야 "올라와 붙는" 느낌이 난다.
const SHEET_SPRING = {damping: 26, stiffness: 260, mass: 1} as const;
const EXIT_DURATION_MS = 220;
// 손을 뗀 시점의 속도를 이만큼(초) 미래로 투영한 위치로 닫힘을 판정한다.
// 짧게 툭 튕겨도 닫히고, 천천히 조금 내린 건 안 닫힌다.
const VELOCITY_PROJECTION_SEC = 0.12;
const DISMISS_DISTANCE_RATIO = 0.3;
const DISMISS_VELOCITY = 800;
// 위로 끌 때의 고무줄 저항 계수 — 시트가 제자리 위로 떠오르지 않게 한다.
const OVERDRAG_RESISTANCE = 4;

const REASON_OPTIONS: {
  reason: PlaceAiSummaryDownvoteReasonDto;
  label: string;
}[] = [
  {
    reason: PlaceAiSummaryDownvoteReasonDto.InaccurateInfo,
    label: '실제와 틀린 정보가 있어요',
  },
  {
    reason: PlaceAiSummaryDownvoteReasonDto.TooLong,
    label: '길어서 읽기 어려워요',
  },
  {reason: PlaceAiSummaryDownvoteReasonDto.Other, label: '기타'},
];

interface AiSummaryDownvoteBottomSheetProps {
  isVisible: boolean;
  isPending: boolean;
  onPressClose: () => void;
  onSubmit: (params: {
    downvoteReason: PlaceAiSummaryDownvoteReasonDto;
    comment?: string;
  }) => Promise<void>;
}

/**
 * 붐따 사유 선택 바텀시트 (Figma `1618873138`).
 * X/배경 탭/아래로 스와이프로 닫으면 입력을 리셋한다 — 제출된 게 아니므로 상위 vote 상태는 바뀌지 않는다.
 * 제출 실패 시엔 리셋하지 않는다(입력 보존) — 에러 토스트는 useAiSummaryFeedback에서 띄운다.
 *
 * 공용 `@/modals/BottomSheet` 대신 시트를 직접 들고 있다. 슬라이드업/드래그 닫기를 이 케이스에만
 * 시범 적용하기 위함 — 공용 컴포넌트를 고치면 소비처 19곳이 한꺼번에 바뀐다. 여기서 검증되면 그때 올린다.
 */
export default function AiSummaryDownvoteBottomSheet({
  isVisible,
  isPending,
  onPressClose,
  onSubmit,
}: AiSummaryDownvoteBottomSheetProps) {
  const [selectedReason, setSelectedReason] =
    useState<PlaceAiSummaryDownvoteReasonDto | null>(null);
  const [comment, setComment] = useState('');

  // https://github.com/facebook/react-native/issues/47140
  // android 에서 translucent status bar 를 키면, keyboard 가 한 번 올라갔다 내려가면 translucent 영역만큼
  // 뷰가 위로 올라간 채로 남는다. 인셋만큼 offset 을 주되 키보드가 올라갔을 때는 패딩으로 보정한다.
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const keyboardVerticalOffset =
    Platform.OS === 'android' ? -insets.bottom - insets.top : 0;
  const temporalContainerPaddingBottom =
    isKeyboardVisible && Platform.OS === 'android'
      ? insets.bottom + insets.top
      : 0;

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () =>
      setIsKeyboardVisible(true),
    );
    const hideListener = Keyboard.addListener('keyboardDidHide', () =>
      setIsKeyboardVisible(false),
    );
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  // ── 시트 모션 ─────────────────────────────────────────────────────────
  // translateY: 0 = 완전히 펼쳐짐, sheetHeight = 화면 밖으로 완전히 내려감.
  // dim 투명도도 이 값에서 파생시켜 등장/퇴장/드래그가 하나의 값으로 움직이게 한다.
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const sheetHeight = useSharedValue(SCREEN_HEIGHT);
  const dragStartY = useSharedValue(0);
  // Modal 이 실제로 떠 있는지. 퇴장 애니메이션이 끝날 때까지 isVisible=false 여도 유지한다.
  const [isRendered, setIsRendered] = useState(isVisible);
  const hasEnteredRef = useRef(false);

  useEffect(() => {
    if (!isVisible) {
      return;
    }
    translateY.value = SCREEN_HEIGHT;
    hasEnteredRef.current = false;
    setIsRendered(true);
  }, [isVisible, translateY]);

  useEffect(() => {
    if (isVisible || !isRendered) {
      return;
    }
    translateY.value = withTiming(
      sheetHeight.value,
      {duration: EXIT_DURATION_MS, easing: Easing.in(Easing.cubic)},
      finished => {
        if (finished) {
          runOnJS(setIsRendered)(false);
        }
      },
    );
  }, [isVisible, isRendered, translateY, sheetHeight]);

  const handleSheetLayout = (event: LayoutChangeEvent) => {
    sheetHeight.value = event.nativeEvent.layout.height;
    if (hasEnteredRef.current || !isVisible) {
      return;
    }
    // 높이를 알게 된 첫 프레임에 등장시킨다. 그 전까진 화면 밖에 있어 깜빡임이 없다.
    hasEnteredRef.current = true;
    translateY.value = withSpring(0, SHEET_SPRING);
  };

  const handleClose = () => {
    setSelectedReason(null);
    setComment('');
    onPressClose();
  };

  // runOnJS(Keyboard.dismiss) 는 Keyboard 객체째로 UI 런타임에 넘기려다 터진다 —
  // 반드시 평범한 JS 함수로 한 번 감싼다.
  const dismissKeyboard = () => Keyboard.dismiss();

  const panGesture = Gesture.Pan()
    // 아래로 12px 이상 움직였을 때만 활성화 — 라디오/버튼 탭과 TextInput 조작을 방해하지 않는다.
    .activeOffsetY(12)
    .onStart(() => {
      dragStartY.value = translateY.value;
      runOnJS(dismissKeyboard)();
    })
    .onUpdate(event => {
      const next = dragStartY.value + event.translationY;
      translateY.value = next >= 0 ? next : next / OVERDRAG_RESISTANCE;
    })
    .onEnd(event => {
      const projected =
        translateY.value + event.velocityY * VELOCITY_PROJECTION_SEC;
      const shouldDismiss =
        projected > sheetHeight.value * DISMISS_DISTANCE_RATIO ||
        event.velocityY > DISMISS_VELOCITY;
      if (shouldDismiss) {
        // 손가락 속도를 그대로 이어받아 내려간다 (툭 튕기면 그만큼 빠르게 사라짐).
        translateY.value = withSpring(
          sheetHeight.value,
          {...SHEET_SPRING, velocity: event.velocityY, overshootClamping: true},
          finished => {
            if (finished) {
              runOnJS(handleClose)();
            }
          },
        );
      } else {
        translateY.value = withSpring(0, {
          ...SHEET_SPRING,
          velocity: event.velocityY,
        });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}],
  }));

  const dimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, sheetHeight.value],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const handleSubmit = async () => {
    if (!selectedReason || isPending) {
      return;
    }
    try {
      await onSubmit({
        downvoteReason: selectedReason,
        comment: comment.trim() ? comment.trim() : undefined,
      });
      setSelectedReason(null);
      setComment('');
    } catch {
      // 실패 시 입력 보존. 토스트는 onSubmit(useAiSummaryFeedback) 쪽에서 이미 표시했다.
    }
  };

  const isSubmitDisabled = !selectedReason || isPending;

  if (!isRendered) {
    return null;
  }

  return (
    <LogView elementName="bottom_sheet">
      <Modal
        visible
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={handleClose}>
        {/* Modal 은 별도 네이티브 윈도우라 앱 루트의 GestureHandlerRootView 가 닿지 않는다. */}
        <GestureHandlerRootView style={StyleSheet.absoluteFill}>
          <SafeAreaProvider>
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                {backgroundColor: color.blacka50},
                dimStyle,
              ]}
            />
            <SccTouchableOpacity
              elementName="bottom_sheet_background"
              activeOpacity={1}
              style={StyleSheet.absoluteFillObject}
              onPress={() => {
                Keyboard.dismiss();
                handleClose();
              }}
            />
            <KeyboardAvoidingView
              behavior="padding"
              style={styles.keyboardAvoider}
              pointerEvents="box-none"
              keyboardVerticalOffset={keyboardVerticalOffset}>
              <GestureDetector gesture={panGesture}>
                <Animated.View onLayout={handleSheetLayout} style={sheetStyle}>
                  <Sheet
                    style={{paddingBottom: temporalContainerPaddingBottom}}>
                    <SafeAreaView edges={['bottom']}>
                      <ContentsContainer>
                        <Grabber />
                        <Header>
                          <HeaderSpacer />
                          <HeaderTitle>어떤점이 아쉬우셨나요?</HeaderTitle>
                          <SccPressable
                            elementName="ai_summary_downvote_close"
                            onPress={handleClose}
                            hitSlop={8}>
                            <CloseIcon
                              width={24}
                              height={24}
                              color={color.black}
                            />
                          </SccPressable>
                        </Header>

                        <ReasonList>
                          {REASON_OPTIONS.map(option => (
                            <ReasonOptionRow
                              key={option.reason}
                              elementName="ai_summary_downvote_reason"
                              logParams={{reason: option.reason}}
                              onPress={() => setSelectedReason(option.reason)}>
                              <RadioCircle
                                isSelected={selectedReason === option.reason}>
                                <RadioInnerDot />
                              </RadioCircle>
                              <ReasonLabel>{option.label}</ReasonLabel>
                            </ReasonOptionRow>
                          ))}
                        </ReasonList>

                        <CommentSection>
                          <CommentLabel>
                            전하고 싶은 의견이 있으신가요?{' '}
                            <CommentLabelOptional>(선택)</CommentLabelOptional>
                          </CommentLabel>
                          <CommentInput
                            multiline
                            value={comment}
                            onChangeText={setComment}
                            maxLength={COMMENT_MAX_LENGTH}
                            placeholder="작성해주신 의견은 계단뿌셔클럽에 큰 도움이 되어요."
                            placeholderTextColor={color.gray40}
                            style={styles.commentInput}
                          />
                          <CommentCounter>
                            {comment.length}/{COMMENT_MAX_LENGTH}
                          </CommentCounter>
                        </CommentSection>

                        <SubmitButton
                          elementName="ai_summary_downvote_submit"
                          disabled={isSubmitDisabled}
                          onPress={handleSubmit}>
                          <SubmitButtonText>의견 보내기</SubmitButtonText>
                        </SubmitButton>
                      </ContentsContainer>
                    </SafeAreaView>
                  </Sheet>
                </Animated.View>
              </GestureDetector>
            </KeyboardAvoidingView>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </Modal>
    </LogView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoider: {flex: 1, justifyContent: 'flex-end'},
  commentInput: {minHeight: 134},
});

const Sheet = styled.View`
  background-color: ${color.white};
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
`;

const ContentsContainer = styled.View`
  padding-horizontal: 20px;
  padding-bottom: 24px;
`;

const Grabber = styled.View`
  width: 48px;
  height: 4px;
  border-radius: 2px;
  background-color: #e8e8e8;
  align-self: center;
  margin-top: 8px;
  margin-bottom: 16px;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 24px;
`;

// close 아이콘(24px)과 같은 너비를 왼쪽에 비워, 타이틀이 헤더 정중앙에 오도록 한다.
const HeaderSpacer = styled.View`
  width: 24px;
`;

const HeaderTitle = styled.Text`
  flex: 1;
  text-align: center;
  font-family: ${font.pretendardBold};
  font-size: 20px;
  color: ${color.black};
`;

const ReasonList = styled.View`
  gap: 16px;
  margin-bottom: 28px;
`;

const ReasonOptionRow = styled(SccPressable)`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

// unselected도 selected와 같은 도넛 형태(꽉 찬 링 + 흰 내부 점) — 색만 다르다 (Figma 219:4019 실측).
const RadioCircle = styled.View<{isSelected: boolean}>`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  background-color: ${({isSelected}) =>
    isSelected ? color.brand40 : color.gray30v2};
`;

const RadioInnerDot = styled.View`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: ${color.white};
`;

const ReasonLabel = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 15px;
  color: ${color.gray90v2};
`;

const CommentSection = styled.View`
  gap: 8px;
  margin-bottom: 24px;
`;

const CommentLabel = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  color: ${color.gray90v2};
`;

const CommentLabelOptional = styled.Text`
  color: ${color.gray70};
`;

const CommentInput = styled(TextInput)`
  font-family: ${font.pretendardRegular};
  font-size: 15px;
  color: ${color.black};
  border-width: 1px;
  border-color: ${color.gray20v2};
  border-radius: 8px;
  padding: 12px;
  text-align-vertical: top;
`;

const CommentCounter = styled.Text`
  align-self: flex-end;
  font-family: ${font.pretendardRegular};
  font-size: 12px;
  color: ${color.gray50};
`;

const SubmitButton = styled(SccPressable)`
  height: 56px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  background-color: ${({disabled}) =>
    disabled ? color.gray20v2 : color.brand40};
`;

const SubmitButtonText = styled.Text`
  font-family: ${font.pretendardBold};
  font-size: 16px;
  color: ${color.white};
`;

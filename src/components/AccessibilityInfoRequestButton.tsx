import React, {useEffect, useRef} from 'react';
import {Animated} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {useToggleAccessibilityInfoRequest} from '@/hooks/useToggleAccessibilityInfoRequest';
import {useCheckAuth} from '@/utils/checkAuth';

let highlightAnimationPlayed = false;

export function resetHighlightAnimation() {
  highlightAnimationPlayed = false;
}

interface Props {
  placeId: string;
  isRequested?: boolean;
  animated?: boolean;
}

export default function AccessibilityInfoRequestButton({
  placeId,
  isRequested,
  animated: enableAnimation,
}: Props) {
  const checkAuth = useCheckAuth();
  const toggleRequest = useToggleAccessibilityInfoRequest();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enableAnimation || isRequested || highlightAnimationPlayed) {
      scaleAnim.setValue(1);
      colorAnim.setValue(0);
      return;
    }

    highlightAnimationPlayed = true;

    const singleCycle = Animated.sequence([
      // 1. Shrink
      Animated.timing(scaleAnim, {
        toValue: 0.88,
        duration: 180,
        useNativeDriver: false,
      }),
      // 2. Hold shrink
      Animated.delay(200),
      // 3. Grow bigger + color fill
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.10,
          duration: 220,
          useNativeDriver: false,
        }),
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: false,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 20,
          useNativeDriver: false,
        }),
      ]),
      // 4. Hold big
      Animated.delay(800),
      // 5. Return to normal + color fade
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(colorAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]),
    ]);

    const animation = Animated.sequence([
      Animated.delay(2000),
      singleCycle,
      Animated.delay(600),
      singleCycle,
    ]);

    animation.start();
    return () => animation.stop();
  }, [enableAnimation, isRequested, scaleAnim, colorAnim]);

  const handlePress = () => {
    checkAuth(() => {
      toggleRequest({
        currentIsRequested: isRequested,
        placeId,
      });
    });
  };

  if (enableAnimation && !isRequested) {
    const animatedBg = colorAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [color.brand40, color.white],
    });
    const animatedTextColor = colorAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [color.white, color.brand40],
    });
    const animatedBorderColor = colorAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['transparent', color.brand40],
    });

    return (
      <SccTouchableOpacity
        elementName="accessibility_info_request_button"
        logParams={{placeId, isRequested}}
        activeOpacity={0.6}
        onPress={handlePress}>
        <Animated.View
          style={{
            transform: [{scale: scaleAnim}],
          }}>
          <Animated.View
            style={{
              backgroundColor: animatedBg,
              padding: 5,
              paddingHorizontal: 10,
              borderRadius: 100,
              borderWidth: 1,
              borderColor: animatedBorderColor,
            }}>
            <Animated.Text
              style={{
                fontSize: 12,
                fontFamily: font.pretendardMedium,
                color: animatedTextColor,
              }}>
              이 장소의 접근성 정보 요청하기
            </Animated.Text>
          </Animated.View>
        </Animated.View>
      </SccTouchableOpacity>
    );
  }

  return (
    <ButtonContainer
      elementName="accessibility_info_request_button"
      logParams={{placeId, isRequested}}
      activeOpacity={0.6}
      onPress={handlePress}
      isRequested={isRequested}>
      <RequestText isRequested={isRequested}>
        {isRequested
          ? '접근성 정보 요청한 장소'
          : '이 장소의 접근성 정보 요청하기'}
      </RequestText>
    </ButtonContainer>
  );
}

const ButtonContainer = styled(SccTouchableOpacity)<{isRequested?: boolean}>`
  padding: 5px 10px;
  border-radius: 100px;
  border-width: 1px;
  border-color: transparent;
  background-color: ${({isRequested}) =>
    isRequested ? color.gray20 : color.brand40};
`;

const RequestText = styled.Text<{isRequested?: boolean}>`
  font-size: 12px;
  font-family: ${font.pretendardMedium};
  color: ${({isRequested}) => (isRequested ? color.black : color.white)};
`;

import React, {useCallback, useEffect, useRef} from 'react';
import {Animated, BackHandler, Dimensions} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export interface UploadProgressOverlayProps {
  visible: boolean;
  stage: 'compressing' | 'uploading' | 'registering';
  currentIndex: number;
  totalImages: number;
  progress: number; // 0-1
  imageSizeMb: number;
}

export function UploadProgressOverlay({
  visible,
  stage,
  currentIndex,
  totalImages,
  progress,
  imageSizeMb,
}: UploadProgressOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;

  const fadeIn = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [fadeAnim]);

  const fadeOut = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (visible) {
      fadeIn();
    } else {
      fadeOut();
    }
  }, [visible, fadeIn, fadeOut]);

  // Block hardware back button while visible
  useEffect(() => {
    if (!visible) {
      return;
    }
    const handler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true,
    );
    return () => handler.remove();
  }, [visible]);

  const isIndeterminate = stage === 'compressing' || stage === 'registering';

  const titleText = (() => {
    switch (stage) {
      case 'compressing':
        return `사진 압축 중 (${currentIndex + 1}/${totalImages})`;
      case 'uploading':
        return `사진 업로드 중 (${currentIndex + 1}/${totalImages})`;
      case 'registering':
        return '정보 등록 중...';
      default: {
        const _exhaustiveCheck: never = stage;
        return _exhaustiveCheck;
      }
    }
  })();

  const progressPercent = Math.round(progress * 100);

  return (
    <Overlay
      style={{opacity: fadeAnim, width, height}}
      pointerEvents={visible ? 'auto' : 'none'}>
      <Card>
        <TitleText>{titleText}</TitleText>
        {stage === 'uploading' && (
          <SizeText>{imageSizeMb.toFixed(2)} MB</SizeText>
        )}
        <ProgressBarContainer>
          {isIndeterminate ? (
            <IndeterminateBar />
          ) : (
            <ProgressBarFill style={{width: `${progressPercent}%`}} />
          )}
        </ProgressBarContainer>
        {stage === 'uploading' && <PercentText>{progressPercent}%</PercentText>}
      </Card>
    </Overlay>
  );
}

// Indeterminate animated bar
function IndeterminateBar() {
  const translateX = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 200,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -100,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [translateX]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '40%',
        backgroundColor: color.lightOrange,
        borderRadius: 3,
        transform: [{translateX}],
      }}
    />
  );
}

const Overlay = styled(Animated.View)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: ${color.blacka50};
  align-items: center;
  justify-content: center;
`;

const Card = styled.View`
  background-color: ${color.white};
  border-radius: 16px;
  padding: 24px;
  align-items: center;
  min-width: 260px;
`;

const TitleText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 16px;
  line-height: 24px;
  color: ${color.gray80};
  margin-bottom: 8px;
`;

const SizeText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 13px;
  line-height: 18px;
  color: ${color.gray50};
  margin-bottom: 12px;
`;

const ProgressBarContainer = styled.View`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background-color: #e5e5e5;
  overflow: hidden;
`;

const ProgressBarFill = styled.View`
  height: 6px;
  border-radius: 3px;
  background-color: ${color.lightOrange};
`;

const PercentText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 13px;
  line-height: 18px;
  color: ${color.gray50};
  margin-top: 8px;
`;

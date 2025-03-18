import React, {useEffect, useState} from 'react';
import {ActivityIndicator} from 'react-native';
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import SplashScreen from 'react-native-splash-screen';

import * as S from './OTAUpdateDialog.style';
import {color} from './constant/color';

const OTAProgress = ({progress}: {progress: number}) => {
  const [componentWidth, setComponentWidth] = useState(0);
  const progressPercentage = Math.min(Math.round(progress * 100), 100);

  const progressValue = useSharedValue(0);
  const progressStyle = useAnimatedStyle(() => {
    return {
      width: progressValue.value,
    };
  });
  useEffect(() => {
    progressValue.value = withTiming(
      componentWidth * (progressPercentage / 100),
    );
  }, [componentWidth, progressPercentage, progressValue]);

  return (
    <S.ProgressContainer
      onLayout={event => {
        var {width} = event.nativeEvent.layout;
        setComponentWidth(width);
      }}>
      <S.ProgressText
        style={{
          width: componentWidth,
        }}>
        {`${progressPercentage}%`}
      </S.ProgressText>
      <S.ProgressBar style={progressStyle}>
        <S.FilledProgressText style={{width: componentWidth}}>
          {`${progressPercentage}%`}
        </S.FilledProgressText>
      </S.ProgressBar>
    </S.ProgressContainer>
  );
};

export default function OTAUpdateDialog({progress}: {progress: number}) {
  useEffect(() => {
    // 업데이트 화면은 업데이트 시간이 길어지는 경우에만 노출한다.
    const timer = setTimeout(() => {
      SplashScreen.hide();
    }, 1300);
    return () => clearTimeout(timer);
  }, []);
  return (
    <S.Container>
      <S.CoverImage source={require('./assets/img/astronut_on_moon.png')} />
      <S.Title>
        {
          '더 나은 계단뿌셔클럽 사용을 위해\n업데이트가 필요합니다.\n잠시만 기다려주세요!'
        }
      </S.Title>
      <S.StatusContainer>
        {progress === 0 || progress === 1 ? (
          <ActivityIndicator size="large" color={color.brandColor} />
        ) : (
          <OTAProgress progress={progress} />
        )}
      </S.StatusContainer>
    </S.Container>
  );
}

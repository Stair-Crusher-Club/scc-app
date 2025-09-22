import React, {useEffect, useRef} from 'react';
import {Animated, View} from 'react-native';
import styled from 'styled-components/native';

export default function WelcomeAnimation() {
  const crusherAnimValue = useRef(new Animated.Value(0)).current;
  const editorAnimValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (animValue: Animated.Value) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      );
    };

    const crusherAnimation = createAnimation(crusherAnimValue);
    const editorAnimation = createAnimation(editorAnimValue);

    crusherAnimation.start();
    editorAnimation.start();

    return () => {
      crusherAnimation.stop();
      editorAnimation.stop();
    };
  }, [crusherAnimValue, editorAnimValue]);

  const crusherTranslateY = crusherAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-5, 5],
  });

  const editorTranslateY = editorAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [5, -5],
  });

  return (
    <View
      style={{
        position: 'relative',
      }}>
      <WelcomeStarImage />
      <Animated.View
        style={{
          transform: [{translateY: crusherTranslateY}],
        }}>
        <WelcomeCrusherImage />
      </Animated.View>
      <Animated.View
        style={{
          transform: [{translateY: editorTranslateY}],
        }}>
        <WelcomeEditorImage />
      </Animated.View>
    </View>
  );
}

const WelcomeStarImage = styled.Image.attrs({
  source: require('@/assets/img/img_crusher_welcome_star.png'),
})({
  width: 190,
  height: 184,
});

const WelcomeCrusherImage = styled.Image.attrs({
  source: require('@/assets/img/img_crusher_welcome_crusher.png'),
})({
  width: 102,
  height: 95,
  position: 'absolute',
  bottom: -6,
  left: -6,
});

const WelcomeEditorImage = styled.Image.attrs({
  source: require('@/assets/img/img_crusher_welcome_editor.png'),
})({
  width: 83,
  height: 107,
  position: 'absolute',
  bottom: -6,
  right: -14,
});

import {font} from '@/constant/font';
import React from 'react';
import {Platform, TextStyle, View} from 'react-native'; // View를 import 합니다.
import styled from 'styled-components/native';

interface CurvedDateTextProps {
  date?: string;
  containerSize?: number;
  fontSize?: number;
  charColor: string;
  fontFamily?: string;
}

export default function CurvedDateText({
  date = '',
  containerSize = 72,
  fontSize = 9,
  charColor,
  fontFamily,
}: CurvedDateTextProps) {
  const characters = date.split('');
  const radius = containerSize / 2;

  const totalChars = characters.length;
  const startAngle = 110;
  const endAngle = 14;
  const angleStep =
    totalChars > 1 ? (endAngle - startAngle) / (totalChars - 1) : 0;

  return (
    <Container style={{width: containerSize, height: containerSize}}>
      {characters.map((char, index) => {
        const angle = startAngle + angleStep * index;
        const radian = (angle * Math.PI) / 180;

        const textRadius = radius - 8;
        const x = radius + textRadius * Math.cos(radian);
        const y = radius + textRadius * Math.sin(radian);

        const textRotation = angle - 90;

        const wrapperStyle: TextStyle = {
          position: 'absolute',
          transform: [{rotate: `${textRotation}deg`}],
          left: x - fontSize / 2 + 1,
          ...Platform.select({
            ios: {
              top: y - fontSize / 2 - 3,
            },
            android: {
              top: y - fontSize / 2 - 4,
            },
          }),
        };

        const textStyle: TextStyle = {
          fontSize,
          ...(fontFamily ? {fontFamily} : {}),
        };

        return (
          <View key={`${char}-${index}`} style={wrapperStyle}>
            <Character color={charColor} style={textStyle}>
              {char}
            </Character>
          </View>
        );
      })}
    </Container>
  );
}

const Container = styled.View({
  position: 'relative',
  justifyContent: 'center',
  alignItems: 'center',
});

const Character = styled.Text<{color: string}>(({color}) => ({
  fontWeight: 'bold',
  color: color,
  textAlign: 'center',
  fontFamily: font.pretendardBold,
}));

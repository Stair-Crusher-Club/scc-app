import React, {useEffect, useRef} from 'react';
import {ScrollView} from 'react-native';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface Props {
  chips: string[];
  activeIndex: number;
  onChipPress: (index: number) => void;
}

export default function V2ChipBar({chips, activeIndex, onChipPress}: Props) {
  const chipRefs = useRef<Record<number, {x: number; width: number}>>({});
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const chip = chipRefs.current[activeIndex];
    if (chip && scrollRef.current) {
      scrollRef.current.scrollTo({
        x: Math.max(0, chip.x - 20),
        animated: true,
      });
    }
  }, [activeIndex]);

  return (
    <Container>
      <ChipScrollContainer ref={scrollRef}>
        <ChipRow>
          {chips.map((chip, idx) => {
            const isActive = idx === activeIndex;
            return (
              <ChipButton
                key={chip}
                isActive={isActive}
                elementName={`v2_accessibility_chip_${idx}`}
                onPress={() => onChipPress(idx)}
                onLayout={e => {
                  chipRefs.current[idx] = {
                    x: e.nativeEvent.layout.x,
                    width: e.nativeEvent.layout.width,
                  };
                }}>
                <ChipText isActive={isActive}>{chip}</ChipText>
              </ChipButton>
            );
          })}
        </ChipRow>
      </ChipScrollContainer>
    </Container>
  );
}

const Container = styled.View`
  background-color: ${color.white};
  padding-top: 12px;
  padding-bottom: 4px;
`;

const ChipScrollContainer = styled(ScrollView).attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: {paddingHorizontal: 20},
})``;

const ChipRow = styled.View`
  flex-direction: row;
  gap: 8px;
`;

const ChipButton = styled(SccPressable)<{isActive: boolean}>`
  border-width: 1px;
  border-color: ${({isActive}) => (isActive ? color.brand40 : color.gray20)};
  border-radius: 100px;
  padding-horizontal: 14px;
  padding-vertical: 8px;
  background-color: ${({isActive}) => (isActive ? color.brand40 : color.white)};
`;

const ChipText = styled.Text<{isActive: boolean}>`
  font-family: ${font.pretendardMedium};
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.26px;
  color: ${({isActive}) => (isActive ? color.white : color.gray90)};
`;

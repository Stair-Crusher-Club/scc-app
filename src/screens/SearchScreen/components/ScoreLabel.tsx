import React from 'react';
import {Text} from 'react-native';
import styled from 'styled-components/native';

import InfoIcon from '@/assets/icon/ic_info.svg';
import PositionedModal from '@/components/PositionedModal';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

type Status = '0' | '1' | '2' | '3' | '4' | '5' | 'unknown';

const ColorMap: Record<Status, {background: string; text: string}> = {
  '0': {background: '#E6F4EB', text: '#06903B'},
  '1': {background: '#F0F9E7', text: '#64C40F'},
  '2': {background: '#FFF9E6', text: '#FFC109'},
  '3': {background: '#FFF4E6', text: '#FF9202'},
  '4': {background: '#FFEEE9', text: '#FF5722'},
  '5': {background: '#FCE9E9', text: '#E52123'},
  unknown: {background: '#E7E8E9', text: '#9A9B9F'},
};

export default function ScoreLabel({
  score,
  isIconVisible,
}: {
  score?: number;
  isIconVisible?: boolean;
}) {
  const status: Status = (() => {
    if (score === undefined) {
      return 'unknown';
    } else if (score <= 0) {
      return '0';
    } else if (score <= 1) {
      return '1';
    } else if (score <= 2) {
      return '2';
    } else if (score <= 3) {
      return '3';
    } else if (score <= 4) {
      return '4';
    } else {
      return '5';
    }
  })();
  return (
    <PositionedModal
      modalContent={
        <Text
          style={{
            fontSize: 12,
            fontFamily: font.pretendardMedium,
            color: color.white,
          }}>
          레벨이 낮을 수록 매장 입구 접근이 쉬워요.
        </Text>
      }>
      <ScoreLabelArea status={status} isIconVisible={isIconVisible}>
        <ScoreLabelText status={status}>
          접근레벨 {score === undefined ? '-' : score}
        </ScoreLabelText>
        {isIconVisible && <InfoIcon color={ColorMap[status].text} />}
      </ScoreLabelArea>
    </PositionedModal>
  );
}

const ScoreLabelArea = styled.View<{
  status: Status;
  isIconVisible?: boolean;
}>`
  display: flex;
  flex-direction: row;
  background-color: ${({status}) => ColorMap[status].background};
  align-items: center;
  border-radius: 8px;
  padding-left: ${props => (props.isIconVisible ? 8 : 6)}px;
  padding-right: 6px;
  padding-top: 4px;
  padding-bottom: 4px;
  gap: 4px;
`;

const ScoreLabelText = styled.Text<{
  status: Status;
}>`
  font-size: 12px;
  font-family: ${font.pretendardMedium};
  color: ${({status}) => ColorMap[status].text};
`;

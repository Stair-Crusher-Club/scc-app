import React from 'react';
import {Text} from 'react-native';

import InfoIcon from '@/assets/icon/ic_info.svg';
import {BadgeShell, BadgeText} from '@/components/BadgeShell';
import PositionedModal from '@/components/PositionedModal';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

type Status = '0' | '1' | '2' | '3' | '4' | '5' | 'unknown' | 'progress';

const ColorMap: Record<
  Status,
  {background: string; text: string; border?: string}
> = {
  '0': {background: '#E6F4EB', text: '#06903B'},
  '1': {background: '#F0F9E7', text: '#64C40F'},
  '2': {background: '#FFF9E6', text: '#FFC109'},
  '3': {background: '#FFF4E6', text: '#FF9202'},
  '4': {background: '#FFEEE9', text: '#FF5722'},
  '5': {background: '#FCE9E9', text: '#E52123'},
  unknown: {background: '#E7E8E9', text: '#9A9B9F'},
  progress: {background: '#ffffff', text: '#FFC109', border: '#FFC109'},
};

export default function ScoreLabel({
  score,
  isIconVisible,
}: {
  score?: number | 'processing';
  isIconVisible?: boolean;
}) {
  const status: Status = (() => {
    if (score === 'processing') {
      return 'progress';
    } else if (score === undefined) {
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
      <BadgeShell
        backgroundColor={ColorMap[status].background}
        textColor={ColorMap[status].text}
        borderColor={ColorMap[status].border ?? ColorMap[status].background}
        borderRadius={6}
        paddingHorizontal={isIconVisible ? 8 : 6}>
        <BadgeText textColor={ColorMap[status].text}>
          {score === 'processing'
            ? '계산중(건물정보 필요)'
            : `접근레벨 ${score === undefined ? '-' : score}`}
        </BadgeText>
        {isIconVisible && <InfoIcon color={ColorMap[status].text} />}
      </BadgeShell>
    </PositionedModal>
  );
}

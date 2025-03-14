import React from 'react';

import BuildingIcon from '@/assets/icon/ic_accessibility_building.svg';
import ElevatorIcon from '@/assets/icon/ic_accessibility_elevator.svg';
import SlopeIcon from '@/assets/icon/ic_accessibility_slope.svg';
import CheckIcon from '@/assets/icon/ic_check.svg';
import ExitIcon from '@/assets/icon/ic_exit.svg';
import {color} from '@/constant/color';
import {StairInfo} from '@/generated-sources/openapi';

import * as S from './PlaceDetailInfoItem.style';

export const STAIR_INFO_TO_DISPLAY_TEXT: Record<StairInfo, string> = {
  [StairInfo.Undefined]: '',
  [StairInfo.None]: '계단이 없어요',
  [StairInfo.One]: '1칸의 계단이 있어요',
  [StairInfo.TwoToFive]: '2-5칸의 계단이 있어요',
  [StairInfo.OverSix]: '6칸 이상의 계단이 있어요',
};

export interface PlaceDetailInfoItemProps {
  isAvailable: boolean;
  icon: keyof typeof Icons;
  title: string;
  description?: string;
}

const Icons = {
  building: BuildingIcon,
  slope: SlopeIcon,
  elevator: ElevatorIcon,
};

const PlaceDetailInfoItem = ({
  isAvailable,
  icon,
  title,
  description,
}: PlaceDetailInfoItemProps) => {
  return (
    <S.PlaceDetailInfoItem>
      {isAvailable ? (
        <CheckIcon width={24} height={24} color={color.success} />
      ) : (
        <ExitIcon width={24} height={24} color={color.red} />
      )}
      <S.TextContainer>
        <S.Title>{title}</S.Title>
        {description && <S.Description>{description}</S.Description>}
      </S.TextContainer>

      {React.createElement(Icons[icon], {
        color: isAvailable ? color.blue30 : color.red,
      })}
    </S.PlaceDetailInfoItem>
  );
};

export default PlaceDetailInfoItem;

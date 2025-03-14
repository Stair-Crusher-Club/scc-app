import React from 'react';

import {SccButton} from '@/components/atoms';
import {font} from '@/constant/font';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {LogView} from '@/logging/LogView';

import BottomSheet from '../BottomSheet';
import * as S from './AstronautsBottomSheet.style';

type Props = React.PropsWithChildren<{
  isVisible: boolean;
  title: string;
  subtitle?: React.ReactNode;
  confirmButtonText: string;
  onPressConfirmButton: () => void;
  closeButtonText?: string;
  onPressCloseButton?: () => void;
}>;
export default function AstronautsBottomSheet({
  isVisible,
  title,
  subtitle,
  closeButtonText,
  onPressCloseButton,
  confirmButtonText,
  onPressConfirmButton,
  children,
}: Props) {
  const elementLogEventParams = {title};
  return (
    <LogParamsProvider
      params={{bottom_sheet_type: 'astronauts', bottom_sheet_title: title}}>
      <LogView
        elementName="astronauts_bottom_sheet"
        params={elementLogEventParams}>
        <BottomSheet isVisible={isVisible}>
          <S.Cover>
            <S.Title>{title}</S.Title>
            {subtitle}
            <S.CoverImage
              source={require('../../assets/img/astronut_on_moon.png')}
            />
          </S.Cover>
          <S.MessageContainer>{children}</S.MessageContainer>
          <S.ButtonContainer>
            {closeButtonText && (
              <SccButton
                style={{flex: 1}}
                text={closeButtonText}
                textColor="black"
                buttonColor="gray10"
                fontFamily={font.pretendardMedium}
                onPress={onPressCloseButton}
              />
            )}
            <SccButton
              style={{flex: 2}}
              text={confirmButtonText}
              textColor="white"
              buttonColor="brandColor"
              fontFamily={font.pretendardBold}
              onPress={onPressConfirmButton}
            />
          </S.ButtonContainer>
        </BottomSheet>
      </LogView>
    </LogParamsProvider>
  );
}

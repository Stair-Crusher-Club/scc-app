import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const DeviceTypes = styled.View({
  position: 'absolute',
  bottom: 10,
  width: '100%',
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 10,
});

export const DeviceTypeButton = styled.Pressable<{selected: boolean}>(
  ({selected}) => ({
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: selected ? color.brandColor : color.blacka40,
    justifyContent: 'center',
    alignItems: 'center',
  }),
);

export const DeviceTypeText = styled.Text<{selected: boolean}>(
  ({selected}) => ({
    color: selected ? color.white : color.gray70,
    fontSize: 11,
    fontFamily: font.pretendardBold,
  }),
);

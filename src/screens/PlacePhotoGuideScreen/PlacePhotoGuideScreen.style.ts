import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const Header = styled.View({
  flexFlow: 'row',
  justifyContent: 'flex-end',
  paddingVertical: 5,
  backgroundColor: '#262629',
});

export const CloseButton = styled(SccPressable)({
  padding: 16,
  color: 'white',
});

export const SampleImage = styled.View({
  width: '100%',
  aspectRatio: '1/1',
});

export const GuideMessage = styled.View({
  gap: 8,
  marginVertical: 20,
  marginHorizontal: 30,
  padding: 20,
  backgroundColor: color.blacka40,
  borderRadius: 8,
});

export const GuideMessageTitle = styled.Text({
  fontFamily: font.pretendardBold,
  color: color.white,
  fontSize: 16,
  lineHeight: '24px',
});

export const BulletPointContainer = styled.View({
  flexDirection: 'row',
  alignItems: 'flex-start',
});

export const BulletPoint = styled.Text({
  fontFamily: font.pretendardRegular,
  color: color.white,
  fontSize: 14,
  lineHeight: '22px',
  marginRight: 8,
});

export const GuideMessageContent = styled.Text({
  fontFamily: font.pretendardRegular,
  color: color.white,
  fontSize: 14,
  lineHeight: '22px',
  flex: 1,
});

export const BulletPoints = styled.View({
  gap: 2,
});

export const More = styled.Text({
  color: color.brandColor,
  fontSize: 14,
  fontFamily: font.pretendardMedium,
  textAlign: 'right',
});

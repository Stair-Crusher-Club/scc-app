import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const HeaderSection = styled.View({
  paddingVertical: 40,
  paddingHorizontal: 30,
  backgroundColor: 'white',
});

export const Discovered = styled.View({
  backgroundColor: color.gray10,
  justifyContent: 'center',
  alignItems: 'center',
  height: 180,
});
export const DiscoveredTitle = styled.Text({
  color: color.black,
  fontSize: 18,
  fontFamily: font.pretendardBold,
});
export const DiscoveredMessage = styled.Text({
  color: color.black,
  fontSize: 16,
  fontFamily: font.pretendardRegular,
  marginTop: 4,
  marginHorizontal: 20,
  letterSpacing: -0.5,
  textAlign: 'center',
});

export const NewPlace = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
});
export const NewPlaceText = styled.Text({
  color: color.brandColor,
  fontSize: 18,
  marginLeft: 4,
  fontFamily: font.pretendardBold,
});
export const BuildingAddress = styled.Text({
  color: 'black',
  fontSize: 28,
  marginTop: 8,
  fontFamily: font.pretendardBold,
});
export const BoundedPlace = styled.Text({
  color: color.gray80,
  fontSize: 16,
  fontFamily: font.pretendardRegular,
});

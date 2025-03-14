import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const ConquererHeader = styled.View({});
export const HeaderBackground = styled.Image({
  width: '100%',
  height: 'auto',
  aspectRatio: '375 / 130',
});

export const ConquererHeaderTitle = styled.View({
  position: 'absolute',
  padding: 30,
});

export const ConquererHeaderTitleText = styled.Text({
  color: color.white,
  fontSize: 18,
  lineHeight: '29px',
  fontFamily: font.pretendardBold,
});

export const ConquererHeaderCountText = styled.Text({
  color: color.white,
  fontSize: 24,
  fontFamily: font.pretendardBold,
  marginTop: 10,
});

export const Gap = styled.View({
  height: 10,
  backgroundColor: color.gray10,
});

export const ConqueredPlacesContainer = styled.View({
  paddingTop: 6,
  paddingHorizontal: 20,
  paddingBottom: 40,
});

export const ConqueredPlacesTitle = styled.View({
  paddingVertical: 24,
});
export const ConqueredPlacesTitleText = styled.Text({
  fontFamily: font.pretendardBold,
  fontSize: 20,
});

export const ConqueredPlaceList = styled.View({
  marginTop: 10,
  marginBottom: 10,
});
export const ListGap = styled.View({
  height: 25,
});

export const ConqueredPlacesEmptyContent = styled.View({
  marginHorizontal: 20,
});

export const ConqueredPlacesEmptyText = styled.Text({
  fontFamily: font.pretendardRegular,
  fontSize: 14,
  color: color.black,
});

export const DescriptionContainer = styled.View({
  padding: 20,
  backgroundColor: color.gray10,
});
export const DescriptionText = styled.Text({
  fontFamily: font.pretendardRegular,
  fontSize: 14,
  color: color.gray70,
});

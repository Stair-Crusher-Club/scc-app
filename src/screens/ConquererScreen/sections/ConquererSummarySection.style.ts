import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const ConquererSummarySection = styled.View({
  height: 228,
  backgroundColor: color.white,
});

export const Decotator = styled.View({
  width: '100%',
  height: 166,
  backgroundColor: color.blue50,
});

export const Title = styled.Text({
  position: 'absolute',
  top: 32,
  left: 20,
  color: color.white,
  fontSize: 20,
  lineHeight: '32px',
  fontFamily: font.pretendardBold,
});

export const DecoImage = styled.Image({
  position: 'absolute',
  top: 32,
  right: 20,
  width: 150,
  height: 120,
});

export const Dashboard = styled.View({
  position: 'absolute',
  left: 20,
  right: 20,
  bottom: 0,

  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: 112,
  backgroundColor: color.white,
  borderRadius: 20,
  borderWidth: 2,
  borderColor: color.gray30,
});

export const Item = styled.View({
  flex: '50%',
});
export const ItemTitle = styled.Text({
  fontFamily: font.pretendardRegular,
  fontSize: 14,
  lineHeight: '16px',
  color: color.gray90,
  marginBottom: 10,
  textAlign: 'center',
});
export const ItemValue = styled.Text({
  fontFamily: font.pretendardBold,
  fontSize: 24,
  lineHeight: '26px',
  color: color.black,
  textAlign: 'center',
});
export const Divider = styled.View({
  width: 1,
  height: 48,
  backgroundColor: color.gray20,
});

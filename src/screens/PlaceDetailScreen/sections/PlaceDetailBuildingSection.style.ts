import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const Section = styled.View({
  flex: 1,
  paddingTop: 12,
  paddingHorizontal: 30,
  backgroundColor: color.white,
  gap: 20,
});

export const SubSection = styled.View({
  flex: 1,
  paddingVertical: 20,
});

export const Row = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const Title = styled.Text({
  fontSize: 24,
  lineHeight: '36px',
  fontFamily: font.pretendardBold,
});

export const Updated = styled.Text({
  fontSize: 14,
  fontFamily: font.pretendardRegular,
});

export const Separator = styled.View({
  height: 1,
  backgroundColor: color.gray20,
});

export const Summary = styled.View({
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 16,
});

export const VerticalSeparator = styled.View({
  width: 1,
  height: 25,
  marginHorizontal: 16,
  backgroundColor: color.gray20,
});

export const SummaryTitle = styled.Text({
  fontSize: 14,
  fontFamily: font.pretendardMedium,
  color: color.gray90,
});

export const InfoList = styled.View({paddingVertical: 10});
export const InfoItem = styled.View({});
export const InfoItemSeparator = styled.View({marginTop: 12});

export const Conqueror = styled.Text({
  color: color.gray80,
  fontSize: 14,
  fontFamily: font.pretendardRegular,
  textAlign: 'right',
});

export const Comments = styled.View({});
export const AddCommentButton = styled.Pressable({
  height: 48,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 10,
  marginBottom: 20,
});
export const AddCommentText = styled.Text({
  color: color.blue60,
  fontSize: 16,
  fontFamily: font.pretendardMedium,
  marginLeft: 4,
});

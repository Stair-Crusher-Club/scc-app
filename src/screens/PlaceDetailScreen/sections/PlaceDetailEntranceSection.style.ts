import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import SccPressable from '@/components/SccPressable';

export const Section = styled.View({
  paddingVertical: 32,
  paddingHorizontal: 20,
  backgroundColor: color.white,
  gap: 20,
});

export const SubSection = styled.View({});

export const Row = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  overflow: 'visible',
});

export const Title = styled.Text({
  fontSize: 18,
  lineHeight: '28px',
  fontFamily: font.pretendardSemibold,
  color: color.gray80,
});

export const Updated = styled.Text({
  fontSize: 13,
  fontFamily: font.pretendardRegular,
  color: color.gray50,
});

export const Address = styled.Text({
  fontSize: 12,
  marginTop: 4,
  lineHeight: '14px',
  fontFamily: font.pretendardRegular,
  color: color.gray80,
});

export const EmptyInfoContent = styled.View({
  gap: 20,
});

export const InfoContent = styled.View({
  gap: 24,
});

export const Separator = styled.View({
  height: 1,
  backgroundColor: color.gray20,
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

export const Comments = styled.View({
  gap: 16,
});
export const AddCommentButton = styled(SccPressable)({
  height: 48,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderRadius: 12,
  borderColor: color.gray20,
  marginBottom: 16,
});
export const AddCommentText = styled.Text({
  color: color.brand50,
  fontSize: 16,
  fontFamily: font.pretendardMedium,
  marginLeft: 4,
});

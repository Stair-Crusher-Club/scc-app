import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const Section = styled.View({
  flex: 1,
  paddingVertical: 20,
  paddingHorizontal: 20,
  backgroundColor: color.white,
});

export const SubSection = styled.View({
  flex: 1,
  gap: 4,
  alignItems: 'flex-start',
});

export const Row = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const SectionTitle = styled.Text({
  fontSize: 28,
  lineHeight: '44px',
  fontFamily: font.pretendardBold,
});

export const Address = styled.Text({
  marginTop: 4,
  fontSize: 16,
  fontFamily: font.pretendardRegular,
});

export const Separator = styled.View({
  height: 1,
  backgroundColor: color.gray20,
  marginTop: 20,
  marginBottom: 12,
});

export const Summary = styled.TouchableOpacity({
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
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

export const Empty = styled.Text({
  fontSize: 16,
  fontFamily: font.pretendardBold,
  color: color.black,
});

export const InfoList = styled.View({paddingVertical: 10});
export const InfoItem = styled.View({});
export const InfoItemSeparator = styled.View({marginTop: 12});

export const Conqueror = styled.Text({
  color: color.gray80,
  fontSize: 14,
  fontFamily: font.pretendardRegular,
  textAlign: 'right',
  marginTop: 20,
});

export const Comments = styled.View({
  marginTop: 20,
});
export const AddCommentButton = styled.Pressable({
  height: 48,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 10,
});
export const AddCommentText = styled.Text({
  color: color.blue60,
  fontSize: 16,
  fontFamily: font.pretendardMedium,
  marginLeft: 4,
});

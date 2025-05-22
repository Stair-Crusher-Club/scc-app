import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const PlaceDetailFeedbackSection = styled.View({
  backgroundColor: color.white,
  paddingVertical: 30,
  paddingHorizontal: 40,
});

export const SectionTitle = styled.Text({
  color: color.black,
  fontSize: 20,
  fontFamily: font.pretendardBold,
  marginBottom: 20,
});

export const Buttons = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 12,
});

const Button = styled.Pressable({
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
  height: 54,
});
export const DefaultButton = styled(Button)({
  borderWidth: 1,
  borderColor: color.gray30,
  borderRadius: 12,
});
export const UpvoteButton = styled(Button)<{upvoted: boolean}>(({upvoted}) => ({
  borderWidth: 1,
  borderColor: upvoted ? color.blue30 : color.gray30,
  backgroundColor: upvoted ? color.blue30a15 : undefined,
  borderRadius: 12,
}));
export const DeleteButton = styled(Button)({
  marginTop: 40,
  backgroundColor: color.gray10,
  height: 56,
});
export const ButtonText = styled.Text<{color?: string}>(
  ({color: fontColor}) => ({
    fontSize: 16,
    fontFamily: font.pretendardMedium,
    color: fontColor,
  }),
);
export const DeleteButtonText = styled.Text({
  color: color.gray80,
  fontSize: 18,
  fontFamily: font.pretendardMedium,
});

import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const ChallengeSection = styled.View({
  backgroundColor: color.white,
});

export const TitleArea = styled.View({
  paddingTop: 40,
  paddingHorizontal: 25,
});

export const Title = styled.Text({
  fontFamily: font.pretendardBold,
  fontSize: 28,
  color: color.black,
});

export const Subtitle = styled.Text({
  color: color.gray80,
  fontFamily: font.pretendardRegular,
  fontSize: 16,
});

export const Filters = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 21,
  gap: 6,
  paddingHorizontal: 25,
});

export const FilterButton = styled.Pressable<{active?: boolean}>(
  ({active}) => ({
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderColor: active ? color.brand20 : color.gray20,
    backgroundColor: active ? color.brand10 : color.white,
    borderWidth: 1,
    borderRadius: 56,
  }),
);

export const FilterButtonText = styled.Text<{active?: boolean}>(({active}) => ({
  color: active ? color.brandColor : color.gray90,
  fontFamily: font.pretendardRegular,
  fontSize: 14,
  letterSpacing: -0.005,
}));

/** Challenge List */
export const ChallengeList = styled.View({
  paddingHorizontal: 25,
  marginBottom: 80,
  gap: 15,
});

export const ChallengeCard = styled.View({
  borderColor: color.gray20,
  borderWidth: 2,
  borderRadius: 20,
  paddingTop: 20,
  paddingLeft: 20,
  paddingBottom: 16,
});

export const Badges = styled.View({
  flexDirection: 'row',
  gap: 10,
});

export const ChallengeName = styled.Text({
  fontFamily: font.pretendardBold,
  fontSize: 20,
  color: color.black,
  marginTop: 12,
});

export const ChallengeDate = styled.Text({
  fontFamily: font.pretendardRegular,
  fontSize: 14,
  color: color.gray90,
  marginTop: 2,
});

export const ArrowWrapper = styled.View({
  position: 'absolute',
  top: 56,
  right: 16,
});

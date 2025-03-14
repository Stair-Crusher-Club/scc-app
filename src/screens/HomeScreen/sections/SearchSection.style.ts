import styled from 'styled-components/native';

import SearchIcon from '@/assets/icon/ic_search.svg';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const Contents = styled.View({
  backgroundColor: color.white,
  paddingTop: 20,
});

export const Title = styled.Text({
  color: color.black,
  fontSize: 20,
  fontFamily: font.pretendardBold,
  marginHorizontal: 20,
  paddingBottom: 16,
});

export const SearchInputContainer = styled.Pressable({
  flexDirection: 'row',
  backgroundColor: color.gray10,
  borderRadius: 8,
  marginHorizontal: 20,
  paddingVertical: 12,
  paddingHorizontal: 16,
  alignItems: 'center',
});

export const SearchInputText = styled.Text({
  flex: 1,
  color: '#b0b0b0',
  fontSize: 16,
  lineHeight: '24px',
  fontFamily: font.pretendardRegular,
});

export const SearchIconWrapper = styled(SearchIcon)({
  color: color.gray70,
});

export const SearchCategoryContainer = styled.View({
  overflow: 'visible',
  paddingHorizontal: 20,
  paddingVertical: 16,
});

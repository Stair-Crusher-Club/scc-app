import styled from 'styled-components/native';

import {ScreenLayout} from '@/components/ScreenLayout';
import {color} from '@/constant/color';

export const SearchScreenLayout = styled(ScreenLayout)`
  background-color: ${color.white};
  flex-direction: column;
`;

export const SearchInputWithCategoryKeyword = styled.View<{onMap: boolean}>(
  ({onMap}) => ({
    width: '100%',
    zIndex: 99,
    top: 0,
    backgroundColor: onMap ? 'transparent' : color.white,
    flexDirection: 'column',
    paddingTop: 6,
  }),
);

export const SearchCategoryContainer = styled.View({
  paddingVertical: 8,
  paddingHorizontal: 15,
});

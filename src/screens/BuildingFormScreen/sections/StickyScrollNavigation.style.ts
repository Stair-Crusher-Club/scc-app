import styled from 'styled-components/native';

import {color} from '@/constant/color';

export const Wrapper = styled.View({
  width: '100%',
  height: 1,
  background: 'transparent',
});

export const StickyScrollNavigation = styled.View<{show: boolean}>(props => ({
  position: 'relative',
  flexFlow: 'row wrap',
  width: '100%',
  height: 60,
  paddingTop: 20,
  paddingHorizontal: 20,
  backgroundColor: 'white',
  borderBottomWidth: 1,
  borderBottomColor: color.gray50,
  transform: props.show ? 'translateY(0)' : 'translateY(-999px)',
}));

export const Menu = styled.Pressable<{active: boolean}>(props => ({
  paddingHorizontal: 10,
  paddingBottom: 5,
  borderBottomWidth: 3,
  borderBottomColor: props.active ? color.brandColor : 'transparent',
}));

export const MenuTitle = styled.Text<{active: boolean}>(props => ({
  fontSize: 20,
  height: 32,
  color: props.active ? color.black : color.gray70,
  fontWeight: props.active ? 'bold' : 'normal',
}));

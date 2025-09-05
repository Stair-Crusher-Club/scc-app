import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';

export const Wrapper = styled.View({
  width: '100%',
  background: 'transparent',
});

export const StickyScrollNavigation = styled.View<{show: boolean}>(props => ({
  flexFlow: 'row wrap',
  width: '100%',
  paddingTop: 20,
  paddingHorizontal: 20,
  backgroundColor: 'white',
  borderBottomWidth: 1,
  borderBottomColor: color.gray20,
  transform: props.show ? 'translateY(0)' : 'translateY(-999px)',
}));

export const Menu = styled(SccPressable)<{active: boolean}>(props => ({
  paddingHorizontal: 10,
  paddingBottom: 8,
  borderBottomWidth: 3,
  borderBottomColor: props.active ? color.brandColor : 'transparent',
}));

export const MenuTitle = styled.Text<{active: boolean}>(props => ({
  fontSize: 16,
  height: 24,
  color: props.active ? color.black : color.gray70,
  fontWeight: props.active ? 'bold' : 'normal',
}));

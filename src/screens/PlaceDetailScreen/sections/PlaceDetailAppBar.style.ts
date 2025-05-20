import {SafeAreaView} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

export const AppBar = styled(SafeAreaView)({
  position: 'absolute',
  top: 0,
  zIndex: 999,
  width: '100%',
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 10,
  paddingHorizontal: 20,
});

export const BackButton = styled.View({
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  borderRadius: 20,
});

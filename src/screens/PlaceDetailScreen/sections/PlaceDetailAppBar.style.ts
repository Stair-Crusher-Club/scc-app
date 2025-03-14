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
  paddingHorizontal: 8,
});

export const BackButton = styled.View({
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: 'white',
});

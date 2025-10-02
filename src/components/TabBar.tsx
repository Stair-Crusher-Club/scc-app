import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {Text} from 'react-native';
import styled from 'styled-components/native';
import SccTouchableOpacity from './SccTouchableOpacity';

type TabItem<T> = {
  value: T;
  label: string;
};

export default function TabBar<T>({
  items,
  current,
  onChange,
}: {
  items: TabItem<T>[];
  current: T;
  onChange: (value: T) => void;
}) {
  return (
    <Container>
      {items.map(({value, label}) => (
        <TabButton
          elementName={`${value}_tab_button`}
          key={String(value)}
          active={current === value}
          onPress={() => onChange(value)}>
          <TabLabel active={current === value}>{label}</TabLabel>
        </TabButton>
      ))}
    </Container>
  );
}

const Container = styled.View({
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
});

const TabButton = styled(SccTouchableOpacity)<{active: boolean}>(
  ({active}) => ({
    flex: 1,
    borderBottomWidth: active ? 2 : 1,
    borderBottomColor: active ? color.brand50 : color.gray20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  }),
);

const TabLabel = styled(Text)<{active: boolean}>(({active}) => ({
  fontSize: 16,
  fontFamily: font.pretendardMedium,
  color: active ? color.gray80 : color.gray40,
}));

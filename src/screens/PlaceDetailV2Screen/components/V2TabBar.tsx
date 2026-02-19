import React from 'react';
import styled from 'styled-components/native';

import SccTouchableOpacity from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

type TabItem<T> = {
  value: T;
  label: string;
};

export default function V2TabBar<T>({
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
      <TabRow>
        {items.map(({value, label}) => {
          const active = current === value;
          return (
            <TabButton
              elementName={`${value}_tab_button`}
              key={String(value)}
              onPress={() => onChange(value)}>
              <TabLabelWrapper active={active}>
                <TabLabel active={active}>{label}</TabLabel>
              </TabLabelWrapper>
              {active && <ActiveIndicator />}
            </TabButton>
          );
        })}
      </TabRow>
      <Divider />
    </Container>
  );
}

const Container = styled.View`
  background-color: ${color.white};
`;

const TabRow = styled.View`
  flex-direction: row;
`;

const TabButton = styled(SccTouchableOpacity)`
  flex: 1;
  align-items: center;
`;

const TabLabelWrapper = styled.View<{active: boolean}>`
  padding-vertical: 12px;
`;

const TabLabel = styled.Text<{active: boolean}>`
  font-family: ${({active}) =>
    active ? font.pretendardBold : font.pretendardMedium};
  font-size: 14px;
  color: ${({active}) => (active ? color.gray80 : color.gray60)};
`;

const ActiveIndicator = styled.View`
  width: 100%;
  height: 2px;
  border-radius: 30px;
  background-color: ${color.gray80};
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${color.gray20};
`;

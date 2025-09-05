import {FlashList} from '@shopify/flash-list';
import React, {useMemo} from 'react';
import styled from 'styled-components/native';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

interface YearItem {
  year: number;
  isSelected: boolean;
}

const CURRENT_YEAR = new Date().getFullYear();
const START_YEAR = 1900;

export default function BirthYearSelector({value, onChange, onClose}: Props) {
  const years = useMemo(() => {
    return Array.from(
      {length: CURRENT_YEAR - START_YEAR + 1},
      (_, i): YearItem => ({
        year: CURRENT_YEAR - i,
        isSelected: value === (CURRENT_YEAR - i).toString(),
      }),
    );
  }, [value]);

  const renderItem = ({item}: {item: YearItem}) => (
    <YearButton
      elementName="birth_year_item"
      onPress={() => {
        onChange(item.year.toString());
        onClose();
      }}
      isSelected={item.isSelected}>
      <YearText isSelected={item.isSelected}>{item.year}년</YearText>
    </YearButton>
  );

  return (
    <Container>
      <Header>
        <HeaderButton elementName="birth_year_cancel_button" onPress={onClose}>
          <HeaderButtonText>취소</HeaderButtonText>
        </HeaderButton>
        <HeaderTitle>출생연도</HeaderTitle>
        <HeaderButton elementName="birth_year_done_button" onPress={onClose}>
          <HeaderButtonText>완료</HeaderButtonText>
        </HeaderButton>
      </Header>
      <ListContainer>
        <FlashList
          data={years}
          renderItem={renderItem}
          estimatedItemSize={50}
          keyExtractor={item => item.year.toString()}
        />
      </ListContainer>
    </Container>
  );
}

const Container = styled.View`
  background-color: ${color.white};
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  height: 400px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom-width: 1px;
  border-bottom-color: ${color.gray20};
`;

const HeaderButton = styled(SccTouchableOpacity)`
  padding: 8px;
`;

const HeaderButtonText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 16px;
  color: ${color.blue50};
`;

const HeaderTitle = styled.Text`
  font-family: ${font.pretendardBold};
  font-size: 16px;
  color: ${color.gray100};
`;

const ListContainer = styled.View`
  flex: 1;
`;

const YearButton = styled(SccTouchableOpacity)<{isSelected: boolean}>`
  padding: 16px;
  background-color: ${props => (props.isSelected ? color.gray10 : color.white)};
`;

const YearText = styled.Text<{isSelected: boolean}>`
  font-family: ${font.pretendardMedium};
  font-size: 16px;
  color: ${props => (props.isSelected ? color.blue50 : color.gray100)};
  text-align: center;
`;

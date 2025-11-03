import {FlashList} from '@shopify/flash-list';
import React from 'react';
import styled from 'styled-components/native';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface FormFieldOptionSelectorProps {
  title: string;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  options: string[];
}

/**
 * Generic option selector for form fields
 *
 * Displays a bottom sheet with a list of options for the user to select from.
 * Used by FormFieldRenderer for select-type fields (fields with options array).
 */
export default function FormFieldOptionSelector({
  title,
  value,
  onChange,
  onClose,
  options,
}: FormFieldOptionSelectorProps) {
  const renderItem = ({item}: {item: string}) => (
    <OptionButton
      elementName="form_field_option_button"
      onPress={() => {
        onChange(item);
        onClose();
      }}
      isSelected={item === value}>
      <OptionText isSelected={item === value}>{item}</OptionText>
    </OptionButton>
  );

  return (
    <Container>
      <Header>
        <HeaderButton
          elementName="form_field_option_cancel_button"
          onPress={onClose}>
          <HeaderButtonText>취소</HeaderButtonText>
        </HeaderButton>
        <HeaderTitle>{title}</HeaderTitle>
        <HeaderButton
          elementName="form_field_option_done_button"
          onPress={onClose}>
          <HeaderButtonText>완료</HeaderButtonText>
        </HeaderButton>
      </Header>
      <ListContainer>
        <FlashList
          data={options}
          renderItem={renderItem}
          estimatedItemSize={50}
          keyExtractor={item => item}
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

const OptionButton = styled(SccTouchableOpacity)<{isSelected: boolean}>`
  padding: 16px;
  background-color: ${props => (props.isSelected ? color.gray10 : color.white)};
`;

const OptionText = styled.Text<{isSelected: boolean}>`
  font-family: ${font.pretendardMedium};
  font-size: 16px;
  color: ${props => (props.isSelected ? color.blue50 : color.gray100)};
  text-align: center;
`;

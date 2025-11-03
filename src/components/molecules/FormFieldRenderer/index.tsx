import React, {useState} from 'react';
import styled from 'styled-components/native';

import BottomSheet from '@/modals/BottomSheet';
import type {FormField} from '@/types/b2bForm';
import {getInputType, formatPlaceholder} from '@/types/b2bForm';
import Input from '@/screens/ChallengeDetailScreen/components/ChallengeDetailCompanyModal/Input';
import FormFieldOptionSelector from '@/components/molecules/FormFieldOptionSelector';

interface FormFieldRendererProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
  elementNamePrefix?: string;
}

/**
 * Dynamic form field renderer component
 *
 * Renders either a text input or select input based on field.options:
 * - options === null → Text input (주관식)
 * - options === array → Select input with BottomSheet (객관식)
 *
 * Uses existing Input and FormFieldOptionSelector components for consistency.
 */
export default function FormFieldRenderer({
  field,
  value,
  onChange,
  elementNamePrefix: _elementNamePrefix = 'form-field',
}: FormFieldRendererProps) {
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const inputType = getInputType(field);

  // Text input (주관식)
  if (inputType === 'text') {
    return (
      <FieldContainer>
        <Input
          value={value}
          onChangeText={onChange}
          placeholder={formatPlaceholder(field.displayName)}
          returnKeyType="next"
          isClearable={true}
        />
      </FieldContainer>
    );
  }

  // Select input (객관식)
  return (
    <FieldContainer>
      <Input
        value={value}
        placeholder={formatPlaceholder(field.displayName)}
        isClearable={false}
        onPress={() => setIsBottomSheetVisible(true)}
      />

      <BottomSheet
        isVisible={isBottomSheetVisible}
        onPressBackground={() => setIsBottomSheetVisible(false)}>
        <FormFieldOptionSelector
          title={field.displayName}
          value={value}
          onChange={onChange}
          onClose={() => setIsBottomSheetVisible(false)}
          options={field.options!}
        />
      </BottomSheet>
    </FieldContainer>
  );
}

const FieldContainer = styled.View``;

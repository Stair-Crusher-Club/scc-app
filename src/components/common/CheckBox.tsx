import React from 'react';
import styled from 'styled-components/native';

import CheckIcon from '@/assets/icon/ic_check.svg';
import {color} from '@/constant/color';

interface CheckBoxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export default function CheckBox({checked, onChange}: CheckBoxProps) {
  if (checked) {
    return (
      <Check>
        <CheckIcon color={color.white} width={20} height={20} />
      </Check>
    );
  }
  return <Uncheck />;
}

const Uncheck = styled.View`
  width: 24px;
  height: 24px;
  border: 2px solid ${color.gray50};
  border-radius: 8px;
`;

const Check = styled.View`
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: ${color.brandColor};
  border-radius: 8px;
`; 
import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {makeDoorTypeOptions} from '@/constant/options';
import {EntranceDoorType} from '@/generated-sources/openapi';

import OptionsV2 from '../../PlaceFormV2Screen/components/OptionsV2';

interface DoorTypeCorrectionSectionProps {
  entranceDoorTypes?: EntranceDoorType[];
  onChangeDoorTypes: (value: EntranceDoorType[]) => void;
}

export default function DoorTypeCorrectionSection({
  entranceDoorTypes = [],
  onChangeDoorTypes,
}: DoorTypeCorrectionSectionProps) {
  const options = makeDoorTypeOptions(entranceDoorTypes);

  return (
    <Container>
      <SectionTitle>입구 문이 어떤 유형인가요? (복수 선택 가능)</SectionTitle>

      <OptionsV2.Multiple
        options={options}
        values={entranceDoorTypes}
        columns={2}
        onSelect={onChangeDoorTypes}
      />
    </Container>
  );
}

// Styled components
const Container = styled.View``;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-family: ${font.pretendardBold};
  color: ${color.black};
  margin-bottom: 16px;
`;

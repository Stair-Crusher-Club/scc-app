import React from 'react';

import {makeDoorTypeOptions} from '@/constant/options';
import {EntranceDoorType} from '@/generated-sources/openapi';

import OptionsV2 from '../../PlaceFormV2Screen/components/OptionsV2';
import {FormGroup, SectionRoot, SubLabel} from './shared';

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
    <SectionRoot>
      <FormGroup>
        <SubLabel>출입문은 어떤 종류인가요?</SubLabel>
        <OptionsV2.Multiple
          options={options}
          values={entranceDoorTypes}
          columns={2}
          onSelect={onChangeDoorTypes}
        />
      </FormGroup>
    </SectionRoot>
  );
}

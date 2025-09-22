import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {MOBILITY_TOOL_LABELS} from '@/constant/mobilityTool';
import {PlaceReviewDto} from '@/generated-sources/openapi';

export default function UserMobilityLabel({
  mobilityTool,
}: {
  mobilityTool: PlaceReviewDto['mobilityTool'];
}) {
  return <MobilityText>{MOBILITY_TOOL_LABELS[mobilityTool]}</MobilityText>;
}

export const MobilityText = styled.Text`
  padding-vertical: 2px;
  padding-horizontal: 4px;
  font-size: 11px;
  line-height: 14px;
  font-family: ${font.pretendardMedium};
  color: ${color.gray50};
  background-color: ${color.gray10};
  border-radius: 3px;
`;

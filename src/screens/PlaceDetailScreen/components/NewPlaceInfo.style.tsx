import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const InfoWrapper = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
`;

export const TextWrapper = styled.View`
  flex-grow: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
`;

export const LabelText = styled.Text`
  margin-top: 3px;
  font-family: ${font.pretendardMedium};
  font-size: 12px;
  line-height: 16px;
  color: ${color.gray40};
`;

export const ContentTextWrapper = styled.View`
  flex: 1;
`;

export const ContentTagWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
`;

export const ContentTag = styled.View`
  padding: 4px 6px;
  background-color: ${color.blue1};
  border-radius: 6px;
  justify-items: center;
  align-items: center;
`;

export const ContentTagText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 12px;
  line-height: 16px;
  color: ${color.brand50};
`;

export const ContentText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 15px;
  line-height: 22px;
  color: ${color.gray90};
`;

export const SubContentText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 13px;
  line-height: 20px;
  color: ${color.gray80};
  margin-top: 8px;
`;

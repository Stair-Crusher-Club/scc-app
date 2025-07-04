import { color } from "@/constant/color";
import { font } from "@/constant/font";
import styled from "styled-components/native";

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

export const ContentText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 14px;
  line-height: 22px;
  color: ${color.gray90};
`;

export const SubContentText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 13px;
  line-height: 18px;
  color: ${color.brand50};
`;

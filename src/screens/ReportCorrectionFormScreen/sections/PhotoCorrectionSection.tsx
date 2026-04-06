import React from 'react';
import {Image} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface PhotoCorrectionSectionProps {
  entranceImageUrls: string[];
  elevatorImageUrls: string[];
}

export default function PhotoCorrectionSection({
  entranceImageUrls,
  elevatorImageUrls,
}: PhotoCorrectionSectionProps) {
  const allImages = [
    ...entranceImageUrls.map(url => ({url, type: '입구'})),
    ...elevatorImageUrls.map(url => ({url, type: '엘리베이터'})),
  ];

  return (
    <Container>
      <SectionTitle>사진 오류</SectionTitle>
      <Description>
        사진에 문제가 있다면 부연 설명에 구체적으로 어떤 사진이 잘못되었는지
        알려주세요.
      </Description>

      {allImages.length > 0 && (
        <PhotoGrid>
          {allImages.map((item, index) => (
            <PhotoItem key={`${item.type}-${index}`}>
              <PhotoImage source={{uri: item.url}} />
              <PhotoLabel>{item.type}</PhotoLabel>
            </PhotoItem>
          ))}
        </PhotoGrid>
      )}

      {allImages.length === 0 && <EmptyText>등록된 사진이 없습니다.</EmptyText>}
    </Container>
  );
}

const Container = styled.View``;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-family: ${font.pretendardBold};
  color: ${color.black};
  margin-bottom: 12px;
`;

const Description = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray50};
  line-height: 20px;
  margin-bottom: 12px;
`;

const PhotoGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

const PhotoItem = styled.View`
  align-items: center;
`;

const PhotoImage = styled(Image)`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background-color: ${color.gray10};
`;

const PhotoLabel = styled.Text`
  font-size: 12px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray50};
  margin-top: 4px;
`;

const EmptyText = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray40};
`;

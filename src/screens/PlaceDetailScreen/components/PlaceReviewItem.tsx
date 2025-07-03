import {useState} from 'react';
import {TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';

import MoreIcon from '@/assets/icon/ic_more.svg';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import ImageList from '@/screens/PlaceDetailScreen/components/PlaceDetailImageList';

export default function PlaceReviewItem() {
  const [isExpanded, setIsExpanded] = useState(false);
  const reviewText =
    '한산한 동네 안 흔치 않은 넓은 카페 장애인 주차구역은 없지만 골목가에 주차 가능해요. 일반 주차장은 매장 앞 4대 가능. 다크가나슈는 많이 달지 않아서 좋고, 커피는 산미가 있는 편이에요.';
  return (
    <Container>
      <HeaderRow>
        <HeaderLeft>
          <ReviewerName>푸른자두</ReviewerName>
          <ReviewDate>• 25.06.12</ReviewDate>
        </HeaderLeft>
        <TouchableOpacity>
          <MoreIcon />
        </TouchableOpacity>
      </HeaderRow>
      <ImageList images={[]} roundCorners />
      <ReviewContentColumn>
        <ReviewInfoColumn>
          <ReviewInfoRow>
            <ReviewInfoLabel>추천대상</ReviewInfoLabel>
            <ReviewInfoValue>수동 휠체어, 전동 휠체어</ReviewInfoValue>
          </ReviewInfoRow>
          <ReviewInfoRow>
            <ReviewInfoLabel>내부공간</ReviewInfoLabel>
            <ReviewInfoValue>매우 원활해요!</ReviewInfoValue>
          </ReviewInfoRow>
        </ReviewInfoColumn>
        <ReviewText numberOfLines={isExpanded ? undefined : 2}>
          {reviewText}
        </ReviewText>
        <ExpandButton onPress={() => setIsExpanded(value => !value)}>
          <ExpandButtonText>{isExpanded ? '접기' : '더보기'}</ExpandButtonText>
        </ExpandButton>
      </ReviewContentColumn>
    </Container>
  );
}

// styled-components
const Container = styled.View`
  gap: 16px;
  flex-direction: column;
`;
const HeaderRow = styled.View`
  flex-direction: row;
  gap: 4px;
  align-items: center;
  justify-content: space-between;
`;
const HeaderLeft = styled.View`
  flex-direction: row;
  gap: 4px;
  align-items: center;
`;
const ReviewerName = styled.Text`
  font-size: 15px;
  line-height: 22px;
  font-family: ${font.pretendardBold};
  color: ${color.gray100};
`;
const ReviewDate = styled.Text`
  font-size: 11px;
  line-height: 14px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray50};
`;
const ReviewContentColumn = styled.View`
  flex-direction: column;
  gap: 8px;
`;
const ReviewInfoColumn = styled.View`
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
`;
const ReviewInfoRow = styled.View`
  flex-direction: row;
  gap: 8px;
  align-items: center;
`;
const ReviewInfoLabel = styled.Text`
  font-size: 13px;
  line-height: 18px;
  font-family: ${font.pretendardMedium};
  color: ${color.blue50};
`;
const ReviewInfoValue = styled.Text`
  font-size: 14px;
  line-height: 22px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray50};
`;
const ReviewText = styled.Text`
  font-size: 15px;
  line-height: 22px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray90};
`;
const ExpandButton = styled.TouchableOpacity`
  flex-direction: row;
  gap: 8px;
  justify-content: flex-end;
`;
const ExpandButtonText = styled.Text`
  font-size: 13px;
  line-height: 18px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray40};
`;

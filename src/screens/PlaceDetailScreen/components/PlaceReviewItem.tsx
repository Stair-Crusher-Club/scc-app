import dayjs from 'dayjs';
import {useState} from 'react';
import {TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';

import MoreIcon from '@/assets/icon/ic_more.svg';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {PlaceReviewDto} from '@/generated-sources/openapi';
import ImageList from '@/screens/PlaceDetailScreen/components/PlaceDetailImageList';
import {
  MOBILITY_TYPE_LABELS,
  SPACIOUS_TYPE_LABELS,
} from '@/screens/PlaceDetailScreen/constants/labels';

export default function PlaceReviewItem({review}: {review: PlaceReviewDto}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const reviewText = review.comment;
  const reviewDate = dayjs(review.createdAt.value).format('YYYY.MM.DD');
  return (
    <Container>
      <HeaderRow>
        <HeaderLeft>
          <ReviewerName>{review.user?.nickname || '익명'}</ReviewerName>
          <ReviewDate>• </ReviewDate>
          {/* TODO 크러셔 라벨 등 붙이기 */}
        </HeaderLeft>
        <TouchableOpacity>
          <MoreIcon />
        </TouchableOpacity>
      </HeaderRow>
      <ImageList images={review.images} roundCorners />
      <ReviewContentColumn>
        <ReviewInfoColumn>
          <ReviewInfoRow>
            <ReviewInfoLabel>등록일</ReviewInfoLabel>
            <ReviewInfoValue>{reviewDate}</ReviewInfoValue>
          </ReviewInfoRow>
          <ReviewInfoRow>
            <ReviewInfoLabel>추천대상</ReviewInfoLabel>
            <ReviewInfoValue>
              {review.recommendedMobilityTypes
                ?.map(type => MOBILITY_TYPE_LABELS[type])
                .join(', ')}
            </ReviewInfoValue>
          </ReviewInfoRow>
          <ReviewInfoRow>
            <ReviewInfoLabel>내부공간</ReviewInfoLabel>
            <ReviewInfoValue>
              {SPACIOUS_TYPE_LABELS[review.spaciousType]}
            </ReviewInfoValue>
          </ReviewInfoRow>
        </ReviewInfoColumn>
        <ReviewText numberOfLines={isExpanded ? undefined : 2}>
          {reviewText}
        </ReviewText>
        {reviewText &&
          reviewText.length > 50 && ( // TODO 정확히 2줄 넘으면 안보이게 하기
            <ExpandButton onPress={() => setIsExpanded(value => !value)}>
              <ExpandButtonText>
                {isExpanded ? '접기' : '더보기'}
              </ExpandButtonText>
            </ExpandButton>
          )}
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
  font-size: 12px;
  line-height: 16px;
  font-family: ${font.pretendardRegular};
  width: 42px;
  color: ${color.gray40};
`;
const ReviewInfoValue = styled.Text`
  font-size: 13px;
  line-height: 18px;
  font-family: ${font.pretendardMedium};
  color: ${color.gray70};
`;
const ReviewText = styled.Text`
  font-size: 15px;
  line-height: 22px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray70};
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

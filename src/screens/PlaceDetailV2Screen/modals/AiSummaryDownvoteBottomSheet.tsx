import React, {useState} from 'react';
import {TextInput} from 'react-native';
import styled from 'styled-components/native';

import CloseIcon from '@/assets/icon/close.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {PlaceAiSummaryDownvoteReasonDto} from '@/generated-sources/openapi';
import BottomSheet from '@/modals/BottomSheet';

const COMMENT_MAX_LENGTH = 300;

const REASON_OPTIONS: {
  reason: PlaceAiSummaryDownvoteReasonDto;
  label: string;
}[] = [
  {
    reason: PlaceAiSummaryDownvoteReasonDto.InaccurateInfo,
    label: '실제와 틀린 정보가 있어요',
  },
  {
    reason: PlaceAiSummaryDownvoteReasonDto.TooLong,
    label: '길어서 읽기 어려워요',
  },
  {reason: PlaceAiSummaryDownvoteReasonDto.Other, label: '기타'},
];

interface AiSummaryDownvoteBottomSheetProps {
  isVisible: boolean;
  isPending: boolean;
  onPressClose: () => void;
  onSubmit: (params: {
    downvoteReason: PlaceAiSummaryDownvoteReasonDto;
    comment?: string;
  }) => Promise<void>;
}

/**
 * 붐따 사유 선택 바텀시트 (Figma `1618873138`).
 * X/배경 탭으로 닫으면 입력을 리셋한다 — 제출된 게 아니므로 상위 vote 상태는 바뀌지 않는다.
 * 제출 실패 시엔 리셋하지 않는다(입력 보존) — 에러 토스트는 useAiSummaryFeedback에서 띄운다.
 */
export default function AiSummaryDownvoteBottomSheet({
  isVisible,
  isPending,
  onPressClose,
  onSubmit,
}: AiSummaryDownvoteBottomSheetProps) {
  const [selectedReason, setSelectedReason] =
    useState<PlaceAiSummaryDownvoteReasonDto | null>(null);
  const [comment, setComment] = useState('');

  const handleClose = () => {
    setSelectedReason(null);
    setComment('');
    onPressClose();
  };

  const handleSubmit = async () => {
    if (!selectedReason || isPending) {
      return;
    }
    try {
      await onSubmit({
        downvoteReason: selectedReason,
        comment: comment.trim() ? comment.trim() : undefined,
      });
      setSelectedReason(null);
      setComment('');
    } catch {
      // 실패 시 입력 보존. 토스트는 onSubmit(useAiSummaryFeedback) 쪽에서 이미 표시했다.
    }
  };

  const isSubmitDisabled = !selectedReason || isPending;

  return (
    <BottomSheet isVisible={isVisible} onPressBackground={handleClose}>
      <ContentsContainer>
        <Grabber />
        <Header>
          <HeaderSpacer />
          <HeaderTitle>어떤점이 아쉬우셨나요?</HeaderTitle>
          <SccPressable
            elementName="ai_summary_downvote_close"
            onPress={handleClose}
            hitSlop={8}>
            <CloseIcon width={24} height={24} color={color.black} />
          </SccPressable>
        </Header>

        <ReasonList>
          {REASON_OPTIONS.map(option => (
            <ReasonOptionRow
              key={option.reason}
              elementName="ai_summary_downvote_reason"
              logParams={{reason: option.reason}}
              onPress={() => setSelectedReason(option.reason)}>
              <RadioCircle isSelected={selectedReason === option.reason}>
                <RadioInnerDot />
              </RadioCircle>
              <ReasonLabel>{option.label}</ReasonLabel>
            </ReasonOptionRow>
          ))}
        </ReasonList>

        <CommentSection>
          <CommentLabel>
            전하고 싶은 의견이 있으신가요?{' '}
            <CommentLabelOptional>(선택)</CommentLabelOptional>
          </CommentLabel>
          <CommentInput
            multiline
            value={comment}
            onChangeText={setComment}
            maxLength={COMMENT_MAX_LENGTH}
            placeholder="작성해주신 의견은 계단뿌셔클럽에 큰 도움이 되어요."
            placeholderTextColor={color.gray40}
            style={{minHeight: 134}}
          />
          <CommentCounter>
            {comment.length}/{COMMENT_MAX_LENGTH}
          </CommentCounter>
        </CommentSection>

        <SubmitButton
          elementName="ai_summary_downvote_submit"
          disabled={isSubmitDisabled}
          onPress={handleSubmit}>
          <SubmitButtonText>의견 보내기</SubmitButtonText>
        </SubmitButton>
      </ContentsContainer>
    </BottomSheet>
  );
}

const ContentsContainer = styled.View`
  padding-horizontal: 20px;
  padding-bottom: 24px;
  background-color: ${color.white};
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
`;

const Grabber = styled.View`
  width: 48px;
  height: 4px;
  border-radius: 2px;
  background-color: #e8e8e8;
  align-self: center;
  margin-top: 8px;
  margin-bottom: 16px;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 24px;
`;

// close 아이콘(24px)과 같은 너비를 왼쪽에 비워, 타이틀이 헤더 정중앙에 오도록 한다.
const HeaderSpacer = styled.View`
  width: 24px;
`;

const HeaderTitle = styled.Text`
  flex: 1;
  text-align: center;
  font-family: ${font.pretendardBold};
  font-size: 20px;
  color: ${color.black};
`;

const ReasonList = styled.View`
  gap: 16px;
  margin-bottom: 28px;
`;

const ReasonOptionRow = styled(SccPressable)`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

// unselected도 selected와 같은 도넛 형태(꽉 찬 링 + 흰 내부 점) — 색만 다르다 (Figma 219:4019 실측).
const RadioCircle = styled.View<{isSelected: boolean}>`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  background-color: ${({isSelected}) =>
    isSelected ? color.brand40 : color.gray30v2};
`;

const RadioInnerDot = styled.View`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: ${color.white};
`;

const ReasonLabel = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 15px;
  color: ${color.gray90v2};
`;

const CommentSection = styled.View`
  gap: 8px;
  margin-bottom: 24px;
`;

const CommentLabel = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  color: ${color.gray90v2};
`;

const CommentLabelOptional = styled.Text`
  color: ${color.gray70};
`;

const CommentInput = styled(TextInput)`
  font-family: ${font.pretendardRegular};
  font-size: 15px;
  color: ${color.black};
  border-width: 1px;
  border-color: ${color.gray20v2};
  border-radius: 8px;
  padding: 12px;
  text-align-vertical: top;
`;

const CommentCounter = styled.Text`
  align-self: flex-end;
  font-family: ${font.pretendardRegular};
  font-size: 12px;
  color: ${color.gray50};
`;

const SubmitButton = styled(SccPressable)`
  height: 56px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  background-color: ${({disabled}) =>
    disabled ? color.gray20v2 : color.brand40};
`;

const SubmitButtonText = styled.Text`
  font-family: ${font.pretendardBold};
  font-size: 16px;
  color: ${color.white};
`;

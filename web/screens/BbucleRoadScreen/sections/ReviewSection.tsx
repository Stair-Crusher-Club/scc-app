import React, { useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

import { color } from '@/constant/color';
import HtmlContentWrapper from '../components/HtmlContentWrapper';
import { useEditMode } from '../context/EditModeContext';
import { useResponsive } from '../context/ResponsiveContext';
import type { ReviewSectionData } from '../config/bbucleRoadData';

interface ReviewSectionProps {
  reviewSection: ReviewSectionData;
  sectionId?: string;
}

export default function ReviewSection({
  reviewSection,
  sectionId,
}: ReviewSectionProps) {
  const editContext = useEditMode();
  const isEditMode = editContext?.isEditMode ?? false;
  const { isDesktop } = useResponsive();

  const { titleLine1, titleLine2, descriptionHtmls, investigatorInfo } =
    reviewSection;

  const updateReviewSection = useCallback(
    (updates: Partial<ReviewSectionData>) => {
      if (!editContext) return;
      editContext.updateData((prev) => ({
        ...prev,
        reviewSection: prev.reviewSection
          ? { ...prev.reviewSection, ...updates }
          : null,
      }));
    },
    [editContext],
  );

  const handleTitleLine1Change = useCallback(
    (text: string) => {
      updateReviewSection({ titleLine1: text });
    },
    [updateReviewSection],
  );

  const handleTitleLine2Change = useCallback(
    (text: string) => {
      updateReviewSection({ titleLine2: text });
    },
    [updateReviewSection],
  );

  const handleAddDescription = useCallback(() => {
    updateReviewSection({
      descriptionHtmls: [...descriptionHtmls, ''],
    });
  }, [descriptionHtmls, updateReviewSection]);

  const handleUpdateDescription = useCallback(
    (index: number, text: string) => {
      const newDescriptions = [...descriptionHtmls];
      newDescriptions[index] = text;
      updateReviewSection({ descriptionHtmls: newDescriptions });
    },
    [descriptionHtmls, updateReviewSection],
  );

  const handleRemoveDescription = useCallback(
    (index: number) => {
      const newDescriptions = descriptionHtmls.filter((_, i) => i !== index);
      updateReviewSection({ descriptionHtmls: newDescriptions });
    },
    [descriptionHtmls, updateReviewSection],
  );

  const handleInvestigatorTitleChange = useCallback(
    (text: string) => {
      updateReviewSection({
        investigatorInfo: {
          title: text,
          members: investigatorInfo?.members || '',
        },
      });
    },
    [investigatorInfo, updateReviewSection],
  );

  const handleInvestigatorMembersChange = useCallback(
    (text: string) => {
      updateReviewSection({
        investigatorInfo: {
          title: investigatorInfo?.title || '',
          members: text,
        },
      });
    },
    [investigatorInfo, updateReviewSection],
  );

  return (
    <div id={sectionId}>
      <Container isDesktop={isDesktop}>
        <ContentWrapper isDesktop={isDesktop}>
          {/* 타이틀 섹션 */}
          <TitleSection>
            {isEditMode ? (
              <>
                <TitleLine1Input
                  value={titleLine1}
                  onChangeText={handleTitleLine1Change}
                  placeholder="타이틀 1줄 (검정)"
                  placeholderTextColor={color.gray40}
                  isDesktop={isDesktop}
                />
                <TitleLine2Input
                  value={titleLine2}
                  onChangeText={handleTitleLine2Change}
                  placeholder="타이틀 2줄 (파랑)"
                  placeholderTextColor={color.gray40}
                  isDesktop={isDesktop}
                />
              </>
            ) : (
              <>
                <TitleLine1 isDesktop={isDesktop}>{titleLine1}</TitleLine1>
                <TitleLine2 isDesktop={isDesktop}>{titleLine2}</TitleLine2>
              </>
            )}
          </TitleSection>

          {/* 후기 말풍선 리스트 */}
          <BubbleList isDesktop={isDesktop}>
            {descriptionHtmls.map((html, index) => {
              const isLeft = index % 2 === 0;
              return (
                <BubbleRow
                  key={index}
                  isLeft={isLeft}
                  isDesktop={isDesktop}
                >
                  {isEditMode ? (
                    <BubbleEditContainer isDesktop={isDesktop}>
                      <BubbleEditLabel>
                        후기 {index + 1} ({isLeft ? '왼쪽' : '오른쪽'})
                      </BubbleEditLabel>
                      <DescriptionInput
                        value={html}
                        onChangeText={(text) =>
                          handleUpdateDescription(index, text)
                        }
                        placeholder="HTML 내용을 입력하세요"
                        placeholderTextColor={color.gray40}
                        multiline
                      />
                      <RemoveButton
                        onPress={() => handleRemoveDescription(index)}
                      >
                        <RemoveButtonText>삭제</RemoveButtonText>
                      </RemoveButton>
                    </BubbleEditContainer>
                  ) : (
                    <BubbleContainer isLeft={isLeft} isDesktop={isDesktop}>
                      <Bubble isDesktop={isDesktop}>
                        <HtmlContentWrapper isDesktop={isDesktop}>
                          <div dangerouslySetInnerHTML={{ __html: html }} />
                        </HtmlContentWrapper>
                      </Bubble>
                      <BubbleTailWrapper isLeft={isLeft}>
                        <BubbleTail isLeft={isLeft} />
                      </BubbleTailWrapper>
                    </BubbleContainer>
                  )}
                </BubbleRow>
              );
            })}
          </BubbleList>

          {isEditMode && (
            <AddButton onPress={handleAddDescription}>
              <AddButtonText>+ 후기 추가</AddButtonText>
            </AddButton>
          )}

          {/* 조사단 섹션 */}
          {(investigatorInfo || isEditMode) && (
            <InvestigatorSection isDesktop={isDesktop}>
              {isEditMode ? (
                <>
                  <InvestigatorTitleInput
                    value={investigatorInfo?.title || ''}
                    onChangeText={handleInvestigatorTitleChange}
                    placeholder="조사단 이름 (예: 고척스카이돔 조사단)"
                    placeholderTextColor={color.gray40}
                  />
                  <InvestigatorMembersInput
                    value={investigatorInfo?.members || ''}
                    onChangeText={handleInvestigatorMembersChange}
                    placeholder="멤버 (예: (홍길동, 김철수, ...))"
                    placeholderTextColor={color.gray40}
                  />
                </>
              ) : (
                investigatorInfo && (
                  <>
                    <InvestigatorTitle isDesktop={isDesktop}>
                      {investigatorInfo.title}
                    </InvestigatorTitle>
                    <InvestigatorMembers isDesktop={isDesktop}>
                      {investigatorInfo.members}
                    </InvestigatorMembers>
                  </>
                )
              )}
            </InvestigatorSection>
          )}
        </ContentWrapper>
      </Container>
    </div>
  );
}

const Container = styled(View)<{ isDesktop: boolean }>`
  padding-top: ${({ isDesktop }) => (isDesktop ? '140px' : '60px')};
  padding-bottom: ${({ isDesktop }) => (isDesktop ? '140px' : '60px')};
  width: 100%;
  background-color: #ebf5ff;
`;

const ContentWrapper = styled(View)<{ isDesktop: boolean }>`
  align-items: center;
  gap: ${({ isDesktop }) => (isDesktop ? '50px' : '32px')};
  width: 100%;
  max-width: 1020px;
  align-self: center;
`;

const TitleSection = styled(View)`
  align-items: center;
  gap: 0;
  width: 100%;
  padding: 0 16px;
`;

const TitleLine1 = styled(Text)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '40px' : '24px')};
  font-weight: 700;
  color: ${color.black};
  text-align: center;
  line-height: ${({ isDesktop }) => (isDesktop ? '54px' : '34px')};
`;

const TitleLine2 = styled(Text)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '40px' : '24px')};
  font-weight: 700;
  color: #0e64d3;
  text-align: center;
  line-height: ${({ isDesktop }) => (isDesktop ? '54px' : '34px')};
`;

const TitleLine1Input = styled(TextInput)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '40px' : '24px')};
  font-weight: 700;
  color: ${color.black};
  text-align: center;
  width: 100%;
`;

const TitleLine2Input = styled(TextInput)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '40px' : '24px')};
  font-weight: 700;
  color: #0e64d3;
  text-align: center;
  width: 100%;
`;

const BubbleList = styled(View)<{ isDesktop: boolean }>`
  width: 100%;
  gap: ${({ isDesktop }) => (isDesktop ? '12px' : '12px')};
`;

const BubbleRow = styled(View)<{ isLeft: boolean; isDesktop: boolean }>`
  width: 100%;
  padding: 0 16px;
  align-items: ${({ isLeft }) => (isLeft ? 'flex-start' : 'flex-end')};
`;

const BubbleContainer = styled(View)<{ isLeft: boolean; isDesktop: boolean }>`
  max-width: ${({ isDesktop }) => (isDesktop ? '85%' : '95%')};
  align-items: ${({ isLeft }) => (isLeft ? 'flex-start' : 'flex-end')};
`;

const Bubble = styled(View)<{ isDesktop: boolean }>`
  background-color: ${color.white};
  border-radius: 12px;
  padding: ${({ isDesktop }) => (isDesktop ? '14px 16px' : '12px 14px')};
`;

const BubbleTailWrapper = styled(View)<{ isLeft: boolean }>`
  padding-left: ${({ isLeft }) => (isLeft ? '20px' : '0')};
  padding-right: ${({ isLeft }) => (isLeft ? '0' : '20px')};
  align-items: ${({ isLeft }) => (isLeft ? 'flex-start' : 'flex-end')};
  width: 100%;
`;

const BubbleTail = styled(View)<{ isLeft: boolean }>`
  width: 0;
  height: 0;
  border-left-width: 12px;
  border-right-width: 12px;
  border-top-width: 14px;
  border-left-color: transparent;
  border-right-color: transparent;
  border-top-color: ${color.white};
  transform: ${({ isLeft }) => (isLeft ? 'scaleX(1)' : 'scaleX(-1)')};
`;

const BubbleEditContainer = styled(View)<{ isDesktop: boolean }>`
  width: 100%;
  gap: 8px;
  background-color: ${color.white};
  border-radius: 12px;
  padding: 16px;
`;

const BubbleEditLabel = styled(Text)`
  font-family: Pretendard;
  font-size: 14px;
  font-weight: 600;
  color: ${color.gray60};
`;

const DescriptionInput = styled(TextInput)`
  font-family: Pretendard;
  font-size: 14px;
  color: ${color.black};
  min-height: 100px;
  background-color: ${color.gray5};
  border-radius: 8px;
  padding: 12px;
`;

const RemoveButton = styled(TouchableOpacity)`
  padding: 8px 16px;
  background-color: ${color.dangerBright};
  border-radius: 8px;
  align-self: flex-start;
`;

const RemoveButtonText = styled(Text)`
  font-family: Pretendard;
  font-size: 14px;
  font-weight: 500;
  color: ${color.white};
`;

const AddButton = styled(TouchableOpacity)`
  padding: 16px 32px;
  background-color: ${color.brandBg};
  border-radius: 12px;
`;

const AddButtonText = styled(Text)`
  font-family: Pretendard;
  font-size: 16px;
  font-weight: 600;
  color: ${color.brand40};
`;

const InvestigatorSection = styled(View)<{ isDesktop: boolean }>`
  align-items: center;
  gap: 4px;
  padding: 0 16px;
`;

const InvestigatorTitle = styled(Text)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '16px' : '14px')};
  font-weight: 600;
  color: #0e64d3;
  text-align: center;
  line-height: ${({ isDesktop }) => (isDesktop ? '24px' : '20px')};
`;

const InvestigatorMembers = styled(Text)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '15px' : '13px')};
  font-weight: 400;
  color: #767884;
  text-align: center;
  line-height: ${({ isDesktop }) => (isDesktop ? '22px' : '18px')};
`;

const InvestigatorTitleInput = styled(TextInput)`
  font-family: Pretendard;
  font-size: 16px;
  font-weight: 600;
  color: #0e64d3;
  text-align: center;
  min-width: 200px;
  background-color: ${color.white};
  border-radius: 8px;
  padding: 8px 16px;
`;

const InvestigatorMembersInput = styled(TextInput)`
  font-family: Pretendard;
  font-size: 14px;
  font-weight: 400;
  color: #767884;
  text-align: center;
  min-width: 300px;
  background-color: ${color.white};
  border-radius: 8px;
  padding: 8px 16px;
`;

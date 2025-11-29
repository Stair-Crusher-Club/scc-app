import React, { useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

import SccRemoteImage from '@/components/SccRemoteImage';
import { color } from '@/constant/color';
import { useEditMode } from '../context/EditModeContext';
import ImageUploader from '../components/ImageUploader';

interface HeaderSectionProps {
  titleImageUrl: string;
  summaryItems: string[];
}

export default function HeaderSection({ titleImageUrl, summaryItems }: HeaderSectionProps) {
  const editContext = useEditMode();
  const isEditMode = editContext?.isEditMode ?? false;

  const validSummaryItems = isEditMode
    ? summaryItems
    : summaryItems.filter((item) => item && item.trim().length > 0);
  const summaryTitle = `휠체어석 ${validSummaryItems.length}줄 요약`;

  const handleTitleImageChange = useCallback(
    (url: string) => {
      if (!editContext) return;
      editContext.updateData((prev) => ({
        ...prev,
        titleImageUrl: url,
      }));
    },
    [editContext],
  );

  const handleSummaryItemChange = useCallback(
    (index: number, text: string) => {
      if (!editContext) return;
      editContext.updateData((prev) => ({
        ...prev,
        summaryItems: prev.summaryItems.map((item, i) => (i === index ? text : item)),
      }));
    },
    [editContext],
  );

  const handleDeleteSummaryItem = useCallback(
    (index: number) => {
      if (!editContext) return;
      editContext.updateData((prev) => ({
        ...prev,
        summaryItems: prev.summaryItems.filter((_, i) => i !== index),
      }));
    },
    [editContext],
  );

  const handleAddSummaryItem = useCallback(() => {
    if (!editContext) return;
    editContext.updateData((prev) => ({
      ...prev,
      summaryItems: [...prev.summaryItems, ''],
    }));
  }, [editContext]);

  return (
    <Container>
      <ImageWrapper>
        {isEditMode && (
          <EditImageOverlay>
            <ImageUploader
              currentImageUrl={titleImageUrl}
              onUploadComplete={handleTitleImageChange}
              compact
            />
          </EditImageOverlay>
        )}
        {titleImageUrl ? (
          <SccRemoteImage imageUrl={titleImageUrl} resizeMode="contain" />
        ) : (
          isEditMode && (
            <EmptyImagePlaceholder>
              <EmptyImageText>타이틀 이미지를 업로드하세요</EmptyImageText>
            </EmptyImagePlaceholder>
          )
        )}
      </ImageWrapper>
      <SummarySection>
        <SummaryTitle>{summaryTitle}</SummaryTitle>
        <SummaryContainer>
          {validSummaryItems.map((item, index) => (
            <SummaryItem key={index}>
              <NumberBadge>
                <NumberText>{index + 1}</NumberText>
              </NumberBadge>
              {isEditMode ? (
                <>
                  <SummaryInput
                    value={item}
                    onChangeText={(text) => handleSummaryItemChange(index, text)}
                    placeholder="요약 내용 입력..."
                    placeholderTextColor="#999"
                  />
                  <DeleteButton onPress={() => handleDeleteSummaryItem(index)}>
                    <DeleteButtonText>×</DeleteButtonText>
                  </DeleteButton>
                </>
              ) : (
                <SummaryText>{item}</SummaryText>
              )}
            </SummaryItem>
          ))}
          {isEditMode && (
            <AddItemButton onPress={handleAddSummaryItem}>
              <AddItemButtonText>+ 항목 추가</AddItemButtonText>
            </AddItemButton>
          )}
        </SummaryContainer>
      </SummarySection>
    </Container>
  );
}

const Container = styled(View)`
  padding: 24px 16px;
  margin-bottom: 150px;
`;

const ImageWrapper = styled(View)`
  position: relative;
  width: 40%;
  align-self: center;
  margin-bottom: 20px;
`;

const SummarySection = styled(View)`
  margin-top: 60px;
  gap: 20px;
  align-items: center;
`;

const SummaryTitle = styled(Text)`
  font-family: Pretendard;
  font-size: 36px;
  font-weight: 700;
  line-height: 48px;
  color: #000000;
  text-align: center;
  width: 100%;
`;

const SummaryContainer = styled(View)`
  background-color: ${color.white};
  padding: 30px 40px;
  border-radius: 12px;
  gap: 20px;
  width: 100%;
`;

const SummaryItem = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 18px;
`;

const NumberBadge = styled(View)`
  width: 48px;
  height: 48px;
  background-color: #f2f2f5;
  border-radius: 100px;
  align-items: center;
  justify-content: center;
`;

const NumberText = styled(Text)`
  font-family: Pretendard;
  font-size: 24px;
  font-weight: 400;
  line-height: 32px;
  color: #000000;
  text-align: center;
`;

const SummaryText = styled(Text)`
  flex: 1;
  font-family: Pretendard;
  font-size: 28px;
  font-weight: 400;
  line-height: 38px;
  color: #000000;
`;

const EditImageOverlay = styled(View)`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
`;

const EmptyImagePlaceholder = styled(View)`
  padding: 60px 40px;
  background-color: #f8f9fa;
  border: 2px dashed #ddd;
  border-radius: 8px;
  align-items: center;
`;

const EmptyImageText = styled(Text)`
  font-size: 14px;
  color: #666;
`;

const SummaryInput = styled(TextInput)`
  flex: 1;
  font-family: Pretendard;
  font-size: 28px;
  font-weight: 400;
  line-height: 38px;
  color: #000000;
  padding: 4px 8px;
  border-width: 1px;
  border-color: #007aff;
  border-radius: 4px;
  background-color: #fff;
`;

const DeleteButton = styled(TouchableOpacity)`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: #dc3545;
  align-items: center;
  justify-content: center;
  margin-left: 12px;
`;

const DeleteButtonText = styled(Text)`
  color: #fff;
  font-size: 20px;
  font-weight: 700;
`;

const AddItemButton = styled(TouchableOpacity)`
  padding: 16px;
  background-color: #007aff;
  border-radius: 8px;
  align-items: center;
  margin-top: 12px;
`;

const AddItemButtonText = styled(Text)`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
`;

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
  summaryTitle?: string;
  summaryTitleColor?: string;
  summaryBackgroundImageUrl?: string;
}

export default function HeaderSection({
  titleImageUrl,
  summaryItems,
  summaryTitle: summaryTitleProp,
  summaryTitleColor,
  summaryBackgroundImageUrl,
}: HeaderSectionProps) {
  const editContext = useEditMode();
  const isEditMode = editContext?.isEditMode ?? false;

  // edit mode에서는 editContext.data에서 읽어야 실시간 반영됨
  const currentSummaryTitle = isEditMode
    ? editContext?.data?.summaryTitle
    : summaryTitleProp;
  const currentSummaryTitleColor = isEditMode
    ? editContext?.data?.summaryTitleColor
    : summaryTitleColor;
  const currentSummaryBackgroundImageUrl = isEditMode
    ? editContext?.data?.summaryBackgroundImageUrl
    : summaryBackgroundImageUrl;

  const validSummaryItems = isEditMode
    ? summaryItems
    : summaryItems.filter((item) => item && item.trim().length > 0);
  const itemCount = validSummaryItems.length;
  const defaultSummaryTitle = `휠체어석 {n}줄 요약`;

  // undefined/null이면 default 사용, 빈 문자열은 허용
  const rawTitle = currentSummaryTitle !== undefined && currentSummaryTitle !== null
    ? currentSummaryTitle
    : defaultSummaryTitle;
  // edit mode: {n} 그대로 표시, view mode: 실제 개수로 치환
  const summaryTitleForEdit = rawTitle;
  const summaryTitleForView = rawTitle.replace(/\{n\}/g, String(itemCount));
  const hasSummaryBackground = !!currentSummaryBackgroundImageUrl;

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

  const handleSummaryTitleChange = useCallback(
    (text: string) => {
      if (!editContext) return;
      editContext.updateData((prev) => ({
        ...prev,
        summaryTitle: text,
      }));
    },
    [editContext],
  );

  const handleSummaryTitleColorToggle = useCallback(() => {
    if (!editContext) return;
    editContext.updateData((prev) => ({
      ...prev,
      summaryTitleColor: prev.summaryTitleColor === '#FFFFFF' ? '#000000' : '#FFFFFF',
    }));
  }, [editContext]);

  const handleSummaryBackgroundImageChange = useCallback(
    (url: string) => {
      if (!editContext) return;
      editContext.updateData((prev) => ({
        ...prev,
        summaryBackgroundImageUrl: url,
      }));
    },
    [editContext],
  );

  return (
    <Container>
      {hasSummaryBackground && (
        <>
          <SummaryBackgroundWrapper>
            <SccRemoteImage
              imageUrl={currentSummaryBackgroundImageUrl!}
              resizeMode="cover"
              style={{ width: '100%', height: '100%' }}
              wrapperBackgroundColor={null}
            />
          </SummaryBackgroundWrapper>
          <SummaryBackgroundOverlay />
        </>
      )}
      {isEditMode && (
        <SummaryBackgroundEditOverlay>
          <ImageUploader
            currentImageUrl={currentSummaryBackgroundImageUrl}
            onUploadComplete={handleSummaryBackgroundImageChange}
            compact
          />
        </SummaryBackgroundEditOverlay>
      )}
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
          <SccRemoteImage
            imageUrl={titleImageUrl}
            resizeMode="contain"
            wrapperBackgroundColor={null}
          />
        ) : (
          isEditMode && (
            <EmptyImagePlaceholder>
              <EmptyImageText>타이틀 이미지를 업로드하세요</EmptyImageText>
            </EmptyImagePlaceholder>
          )
        )}
      </ImageWrapper>
      <SummarySection>
        {isEditMode ? (
          <SummaryTitleRow>
            <SummaryTitleInput
              value={summaryTitleForEdit}
              onChangeText={handleSummaryTitleChange}
              placeholder="타이틀을 입력하세요 ({n}은 개수로 치환)"
              placeholderTextColor="#999"
              style={{ color: currentSummaryTitleColor || '#000000' }}
            />
            <ColorToggleButton onPress={handleSummaryTitleColorToggle}>
              <ColorToggleText>
                {currentSummaryTitleColor === '#FFFFFF' ? '흰→검' : '검→흰'}
              </ColorToggleText>
            </ColorToggleButton>
          </SummaryTitleRow>
        ) : (
          <SummaryTitle style={{ color: currentSummaryTitleColor || '#000000' }}>
            {summaryTitleForView}
          </SummaryTitle>
        )}
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
  padding: 150px 16px 120px;
  position: relative;
`;

const ImageWrapper = styled(View)`
  position: relative;
  width: 40%;
  align-self: center;
  margin-bottom: 20px;
  z-index: 1;
`;

const SummarySection = styled(View)`
  margin-top: 60px;
  gap: 20px;
  align-items: center;
  z-index: 1;
`;

const SummaryTitle = styled(Text)`
  font-family: Pretendard;
  font-size: 36px;
  font-weight: 700;
  line-height: 48px;
  text-align: center;
  width: 100%;
  z-index: 1;
`;

const SummaryTitleRow = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  width: 100%;
`;

const SummaryContainer = styled(View)`
  background-color: #ffffff;
  padding: 30px 40px;
  border-radius: 12px;
  gap: 20px;
  width: 80%;
  z-index: 1;
`;

const SummaryItem = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 18px;
`;

const NumberBadge = styled(View)`
  width: 32px;
  height: 32px;
  background-color: #0e64d3;
  border-radius: 100px;
  align-items: center;
  justify-content: center;
`;

const NumberText = styled(Text)`
  font-family: Pretendard;
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
  color: #ffffff;
  text-align: center;
`;

const SummaryText = styled(Text)`
  flex: 1;
  font-family: Pretendard;
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
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
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
  color: #000000;
  padding: 0;
  background-color: transparent;
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

const SummaryBackgroundWrapper = styled(View)`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
`;

const SummaryBackgroundOverlay = styled(View)`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
  background-color: rgba(0, 0, 0, 0.4);
`;

const SummaryBackgroundEditOverlay = styled(View)`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  flex-direction: row;
  gap: 8px;
  align-items: center;
`;

const SummaryTitleInput = styled(TextInput)`
  font-family: Pretendard;
  font-size: 36px;
  font-weight: 700;
  line-height: 48px;
  text-align: center;
  flex: 1;
  padding: 0;
  background-color: transparent;
  z-index: 1;
`;

const ColorToggleButton = styled(TouchableOpacity)`
  padding: 8px 12px;
  background-color: #6c757d;
  border-radius: 6px;
`;

const ColorToggleText = styled(Text)`
  color: #fff;
  font-size: 12px;
  font-weight: 600;
`;

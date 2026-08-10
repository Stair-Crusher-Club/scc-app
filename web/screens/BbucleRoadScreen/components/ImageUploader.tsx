/* eslint-disable no-restricted-imports --
   편집 모드 전용 도구(운영자만 사용) — 계측 대상이 아니다.
   (터치 컴포넌트는 Scc* 사용 원칙: .eslintrc.js no-restricted-imports) */
import React, { useRef, useState, useCallback, type ChangeEvent } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

import { api } from '../../../config/api';
import { color } from '@/constant/color';
import ImageFileUtils from '@/utils/ImageFileUtils';
import { useResponsive } from '../context/ResponsiveContext';

interface ImageUploaderProps {
  /** 현재 이미지 URL (있으면 미리보기 표시) */
  currentImageUrl?: string;
  /** 업로드 완료 콜백 */
  onUploadComplete: (url: string) => void;
  /** 버튼 텍스트 */
  buttonText?: string;
  /** 컴팩트 모드 (아이콘만 표시) */
  compact?: boolean;
}

export default function ImageUploader({
  currentImageUrl,
  onUploadComplete,
  buttonText = '이미지 업로드',
  compact = false,
}: ImageUploaderProps) {
  const { isDesktop } = useResponsive();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleButtonPress = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드 가능합니다.');
        return;
      }

      // 파일 크기 검증 (10MB 제한)
      if (file.size > 10 * 1024 * 1024) {
        setError('파일 크기는 10MB 이하여야 합니다.');
        return;
      }

      setError(null);
      setIsUploading(true);

      const blobUrl = URL.createObjectURL(file);

      try {
        // 파일 확장자 추출
        const extension = file.name.split('.').pop()?.toLowerCase() || 'jpeg';
        const filenameExtension =
          extension === 'jpg' ? 'jpeg' : (extension as 'jpeg' | 'png' | 'gif');

        // 이미지 업로드
        const uploadedUrl = await ImageFileUtils.uploadWebImage(
          api,
          blobUrl,
          filenameExtension,
        );

        // 콜백 호출
        onUploadComplete(uploadedUrl);
      } catch (err) {
        console.error('Image upload failed:', err);
        setError('업로드 실패. 다시 시도해주세요.');
      } finally {
        URL.revokeObjectURL(blobUrl);
        setIsUploading(false);
        // input 초기화 (같은 파일 재선택 가능하도록)
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [onUploadComplete],
  );

  // Web용 file input change handler
  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e);
    },
    [handleFileSelect],
  );

  if (compact) {
    return (
      <CompactContainer>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />
        <CompactButton isDesktop={isDesktop} onPress={handleButtonPress} disabled={isUploading}>
          {isUploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <CompactButtonText isDesktop={isDesktop}>📷</CompactButtonText>
          )}
        </CompactButton>
      </CompactContainer>
    );
  }

  return (
    <Container>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />

      <UploadButton isDesktop={isDesktop} onPress={handleButtonPress} disabled={isUploading}>
        {isUploading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <UploadButtonText isDesktop={isDesktop}>{buttonText}</UploadButtonText>
        )}
      </UploadButton>

      {error && <ErrorText>{error}</ErrorText>}

      {currentImageUrl && (
        <CurrentImageInfo>
          <InfoText>현재 이미지 URL:</InfoText>
          <UrlText numberOfLines={1}>{currentImageUrl}</UrlText>
        </CurrentImageInfo>
      )}
    </Container>
  );
}

const Container = styled(View)`
  margin: 8px 0;
`;

const CompactContainer = styled(View)``;

const UploadButton = styled(TouchableOpacity)<{ isDesktop: boolean }>`
  background-color: ${color.iosBlue};
  padding: ${({ isDesktop }) => (isDesktop ? '14px 24px' : '12px 20px')};
  border-radius: ${({ isDesktop }) => (isDesktop ? '10px' : '8px')};
  align-items: center;
`;

const UploadButtonText = styled(Text)<{ isDesktop: boolean }>`
  color: ${color.white};
  font-size: ${({ isDesktop }) => (isDesktop ? '16px' : '14px')};
  font-weight: 600;
`;

const CompactButton = styled(TouchableOpacity)<{ isDesktop: boolean }>`
  background-color: ${color.iosBlue}E6;
  width: ${({ isDesktop }) => (isDesktop ? '44px' : '36px')};
  height: ${({ isDesktop }) => (isDesktop ? '44px' : '36px')};
  border-radius: ${({ isDesktop }) => (isDesktop ? '22px' : '18px')};
  align-items: center;
  justify-content: center;
`;

const CompactButtonText = styled(Text)<{ isDesktop: boolean }>`
  font-size: ${({ isDesktop }) => (isDesktop ? '20px' : '16px')};
`;

const ErrorText = styled(Text)`
  color: ${color.danger};
  font-size: 12px;
  margin-top: 8px;
`;

const CurrentImageInfo = styled(View)`
  margin-top: 12px;
  padding: 8px;
  background-color: ${color.gray10};
  border-radius: 4px;
`;

const InfoText = styled(Text)`
  font-size: 12px;
  color: ${color.gray60};
  margin-bottom: 4px;
`;

const UrlText = styled(Text)`
  font-size: 11px;
  color: ${color.gray70};
  font-family: monospace;
`;

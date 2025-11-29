import React, { useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

import { api } from '../../../config/api';
import ImageFileUtils from '@/utils/ImageFileUtils';

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

      try {
        // Blob URL 생성
        const blobUrl = URL.createObjectURL(file);

        // 파일 확장자 추출
        const extension = file.name.split('.').pop()?.toLowerCase() || 'jpeg';
        const filenameExtension =
          extension === 'jpg' ? 'jpeg' : (extension as 'jpeg' | 'png' | 'gif');

        // Presigned URL 획득
        const presignedResponse = await api.getImageUploadUrlsPost({
          getPresignedUrlsRequestDto: {
            count: 1,
            filenameExtension,
          },
        });

        const presignedUrlData = presignedResponse.data[0];
        if (!presignedUrlData) {
          throw new Error('Presigned URL 획득 실패');
        }

        // 이미지 업로드
        const uploadResult = await ImageFileUtils.uploadImage(
          presignedUrlData.url,
          blobUrl,
        );

        // Blob URL 정리
        URL.revokeObjectURL(blobUrl);

        // 콜백 호출
        onUploadComplete(uploadResult.url);
      } catch (err) {
        console.error('Image upload failed:', err);
        setError('업로드 실패. 다시 시도해주세요.');
      } finally {
        setIsUploading(false);
        // input 초기화 (같은 파일 재선택 가능하도록)
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [onUploadComplete],
  );

  if (compact) {
    return (
      <CompactContainer>
        <input
          ref={fileInputRef as any}
          type="file"
          accept="image/*"
          onChange={handleFileSelect as any}
          style={{ display: 'none' }}
        />
        <CompactButton onPress={handleButtonPress} disabled={isUploading}>
          {isUploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <CompactButtonText>📷</CompactButtonText>
          )}
        </CompactButton>
      </CompactContainer>
    );
  }

  return (
    <Container>
      <input
        ref={fileInputRef as any}
        type="file"
        accept="image/*"
        onChange={handleFileSelect as any}
        style={{ display: 'none' }}
      />

      <UploadButton onPress={handleButtonPress} disabled={isUploading}>
        {isUploading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <UploadButtonText>{buttonText}</UploadButtonText>
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

const UploadButton = styled(TouchableOpacity)`
  background-color: #007aff;
  padding: 12px 20px;
  border-radius: 8px;
  align-items: center;
`;

const UploadButtonText = styled(Text)`
  color: #fff;
  font-size: 14px;
  font-weight: 600;
`;

const CompactButton = styled(TouchableOpacity)`
  background-color: rgba(0, 122, 255, 0.9);
  width: 36px;
  height: 36px;
  border-radius: 18px;
  align-items: center;
  justify-content: center;
`;

const CompactButtonText = styled(Text)`
  font-size: 16px;
`;

const ErrorText = styled(Text)`
  color: #dc3545;
  font-size: 12px;
  margin-top: 8px;
`;

const CurrentImageInfo = styled(View)`
  margin-top: 12px;
  padding: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
`;

const InfoText = styled(Text)`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
`;

const UrlText = styled(Text)`
  font-size: 11px;
  color: #333;
  font-family: monospace;
`;

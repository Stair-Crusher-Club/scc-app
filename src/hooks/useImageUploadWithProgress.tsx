import {useCallback, useRef, useState} from 'react';

import {UploadProgressOverlayProps} from '@/components/UploadProgressOverlay';
import {DefaultApi, ImageUploadPurpose} from '@/generated-sources/openapi';
import ImageFile from '@/models/ImageFile';
import ImageFileUtils, {
  UploadCancelledError,
  UploadProgress,
} from '@/utils/ImageFileUtils';
import ToastUtils from '@/utils/ToastUtils';

export type UploadImagesFn = (
  api: DefaultApi,
  images: ImageFile[],
  purposeType?: ImageUploadPurpose,
  label?: string,
) => Promise<string[]>;

const HIDDEN_PROPS: UploadProgressOverlayProps = {
  visible: false,
  stage: 'uploading',
  currentIndex: 0,
  totalImages: 0,
  progress: 0,
  imageSizeMb: 0,
};

/** 업로드 실패 토스트 — 사용자가 직접 취소한 건 실패로 말하지 않는다. 폼 입력은 그대로 남는다. */
export function showUploadFailedToast(error: unknown) {
  ToastUtils.show(
    error instanceof UploadCancelledError
      ? '사진 업로드를 취소했어요. 다시 등록해주세요.'
      : '사진 업로드를 실패했습니다.',
  );
}

export function useImageUploadWithProgress() {
  const [overlayProps, setOverlayProps] =
    useState<UploadProgressOverlayProps>(HIDDEN_PROPS);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => abortControllerRef.current?.abort(), []);

  const uploadImages: UploadImagesFn = useCallback(
    async (
      api: DefaultApi,
      images: ImageFile[],
      purposeType?: ImageUploadPurpose,
      label?: string,
    ) => {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      try {
        return await ImageFileUtils.uploadImages(
          api,
          images,
          purposeType,
          (p: UploadProgress) => {
            setOverlayProps({
              visible: true,
              stage: p.stage,
              currentIndex: p.currentIndex,
              totalImages: p.totalImages,
              progress: p.totalBytes > 0 ? p.bytesUploaded / p.totalBytes : 0,
              imageSizeMb: p.imageSizeMb,
              label,
            });
          },
          abortController.signal,
        );
      } finally {
        abortControllerRef.current = null;
        setOverlayProps(prev => ({...prev, visible: false}));
      }
    },
    [],
  );

  return {uploadImages, uploadProgress: {...overlayProps, onCancel: cancel}};
}

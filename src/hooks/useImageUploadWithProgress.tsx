import {useCallback, useState} from 'react';

import {UploadProgressOverlayProps} from '@/components/UploadProgressOverlay';
import {DefaultApi, ImageUploadPurpose} from '@/generated-sources/openapi';
import ImageFile from '@/models/ImageFile';
import ImageFileUtils, {UploadProgress} from '@/utils/ImageFileUtils';

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

export function useImageUploadWithProgress() {
  const [overlayProps, setOverlayProps] =
    useState<UploadProgressOverlayProps>(HIDDEN_PROPS);

  const uploadImages: UploadImagesFn = useCallback(
    async (
      api: DefaultApi,
      images: ImageFile[],
      purposeType?: ImageUploadPurpose,
      label?: string,
    ) => {
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
        );
      } finally {
        setOverlayProps(HIDDEN_PROPS);
      }
    },
    [],
  );

  return {uploadImages, uploadProgress: overlayProps};
}

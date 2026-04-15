import React, {useCallback, useState} from 'react';

import {
  UploadProgressOverlay,
  UploadProgressOverlayProps,
} from '@/components/UploadProgressOverlay';
import {DefaultApi, ImageUploadPurpose} from '@/generated-sources/openapi';
import ImageFile from '@/models/ImageFile';
import ImageFileUtils, {UploadProgress} from '@/utils/ImageFileUtils';

export type UploadImagesFn = (
  api: DefaultApi,
  images: ImageFile[],
  purposeType?: ImageUploadPurpose,
  label?: string,
) => Promise<string[]>;

export function useImageUploadWithProgress() {
  const [props, setProps] = useState<UploadProgressOverlayProps | null>(null);

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
            setProps({
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
        setProps(null);
      }
    },
    [],
  );

  const UploadOverlay = useCallback(
    () => (props ? <UploadProgressOverlay {...props} /> : null),
    [props],
  );

  return {uploadImages, UploadOverlay};
}

import {floor} from 'lodash';
import {Image as ImageCompressor} from 'react-native-compressor';

import {DefaultApi, ImageUploadPurpose} from '@/generated-sources/openapi';
import Logger from '@/logging/Logger';
import ImageFile from '@/models/ImageFile';

interface UploadImageResult {
  url: string;
  size: number;
}

/** presigned URL에 이미지 업로드 (내부 전용) */
async function uploadToPresignedUrl(
  presignedUrl: string,
  imageFileUrl: string,
): Promise<UploadImageResult> {
  const url = new URL(presignedUrl);
  const resp = await fetch(imageFileUrl);
  const imageBody = await resp.blob();
  const result = await fetch(url.href, {
    method: 'PUT',
    headers: {
      'content-type': imageBody.type,
      'x-amz-acl': 'public-read',
    },
    body: imageBody,
  });
  if (result.ok) {
    return {
      url: url.protocol + '//' + url.host + url.pathname,
      size: imageBody.size,
    };
  } else {
    const resultString = await result.text();
    const error = new Error(
      `Upload image to ${result.url} is failed. cause: ${resultString}`,
    );
    Logger.logError(error);
    throw error;
  }
}

const ImageFileUtils = {
  filepath(uri: string): string {
    const fileScheme = 'file://';
    if (uri.startsWith(fileScheme)) {
      return uri;
    }
    return fileScheme + uri;
  },
  filepathFromImageFile(imageFile: ImageFile): string {
    return this.filepath(imageFile.uri);
  },
  /** 웹용: presigned URL 발급 + 업로드를 한 번에 처리 */
  async uploadWebImage(
    api: DefaultApi,
    imageUrl: string,
    filenameExtension: 'jpeg' | 'png' | 'gif' = 'jpeg',
  ): Promise<string> {
    const presignedResponse = await api.getImageUploadUrlsPost({
      count: 1,
      filenameExtension,
    });

    const presignedUrlData = presignedResponse.data[0];
    if (!presignedUrlData) {
      throw new Error('Presigned URL 획득 실패');
    }

    const result = await uploadToPresignedUrl(presignedUrlData.url, imageUrl);
    return result.url;
  },
  async uploadImages(
    api: DefaultApi,
    images: ImageFile[] = [],
    purposeType?: ImageUploadPurpose,
  ) {
    const startTimeOfGettingPresignedUrls = Date.now();
    const uploadUrls = await api
      .getImageUploadUrlsPost({
        count: images.length,
        filenameExtension: 'jpeg',
        purposeType,
      })
      .then(res => res.data.map(data => data.url));
    const durationOfGettingPresignedUrls =
      Date.now() - startTimeOfGettingPresignedUrls;

    let durationOfUploadImages: Record<string, number> = {};
    const uploadedUrls = await Promise.all(
      images.map(async (image, index) => {
        const url = uploadUrls[index];
        if (url === undefined) {
          throw new Error('There are not enough urls.');
        }
        const startTimeOfImageUpload = Date.now();

        const compressed = await ImageCompressor.compress(image.uri, {
          compressionMethod: 'auto',
          maxWidth: 2560,
          maxHeight: 2560,
          quality: 0.9,
        });
        const result = await uploadToPresignedUrl(url, compressed);

        durationOfUploadImages[`duration_millis_of_upload_image_${index}`] =
          Date.now() - startTimeOfImageUpload;
        durationOfUploadImages[`size_mb_of_image_${index}`] = floor(
          result.size / (1024 * 1024),
          2,
        );

        return result.url;
      }),
    );

    await Logger.logUploadImage({
      ...durationOfUploadImages,
      duration_millis_of_presigned_urls: durationOfGettingPresignedUrls,
    });

    return uploadedUrls;
  },
};

export default ImageFileUtils;

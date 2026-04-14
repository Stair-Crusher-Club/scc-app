import {floor} from 'lodash';
import {Image as ImageCompressor} from 'react-native-compressor';

import {DefaultApi, ImageUploadPurpose} from '@/generated-sources/openapi';
import Logger from '@/logging/Logger';
import ImageFile from '@/models/ImageFile';

const UPLOAD_TIMEOUT_MS = 30_000;

interface UploadImageResult {
  url: string;
  size: number;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function classifyError(error: unknown): {
  errorType: 'timeout' | 'network' | 'http_error' | 'unknown';
  httpStatus?: number;
} {
  if (error instanceof Error && error.name === 'AbortError') {
    return {errorType: 'timeout'};
  }
  if (error instanceof Error && error.message.includes('timed out')) {
    return {errorType: 'timeout'};
  }
  if (error instanceof UploadHttpError) {
    return {errorType: 'http_error', httpStatus: error.httpStatus};
  }
  if (error instanceof TypeError) {
    // fetch throws TypeError for network failures
    return {errorType: 'network'};
  }
  return {errorType: 'unknown'};
}

class UploadHttpError extends Error {
  httpStatus: number;
  constructor(message: string, httpStatus: number) {
    super(message);
    this.name = 'UploadHttpError';
    this.httpStatus = httpStatus;
  }
}

/** presigned URL에 이미지 업로드 (내부 전용) */
async function uploadToPresignedUrl(
  presignedUrl: string,
  imageFileUrl: string,
): Promise<UploadImageResult> {
  const url = new URL(presignedUrl);
  const resp = await fetch(imageFileUrl);
  const imageBody = await resp.blob();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  try {
    const result = await fetch(url.href, {
      method: 'PUT',
      headers: {
        'content-type': imageBody.type,
        'x-amz-acl': 'public-read',
      },
      body: imageBody,

      signal: controller.signal as any,
    });

    if (result.ok) {
      return {
        url: url.protocol + '//' + url.host + url.pathname,
        size: imageBody.size,
      };
    } else {
      const resultString = await result.text();
      throw new UploadHttpError(
        `Upload image to ${result.url} is failed. cause: ${resultString}`,
        result.status,
      );
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        `Image upload timed out after ${UPLOAD_TIMEOUT_MS / 1000}s`,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/** 1회 재시도 포함 업로드 */
async function uploadToPresignedUrlWithRetry(
  presignedUrl: string,
  imageFileUrl: string,
): Promise<UploadImageResult> {
  try {
    return await uploadToPresignedUrl(presignedUrl, imageFileUrl);
  } catch (_firstError) {
    await delay(1000);
    return await uploadToPresignedUrl(presignedUrl, imageFileUrl);
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
    try {
      const uploadedUrls = await Promise.all(
        images.map(async (image, index) => {
          const url = uploadUrls[index];
          if (url === undefined) {
            throw new Error('There are not enough urls.');
          }
          const startTimeOfImageUpload = Date.now();

          if (image.width === 0 || image.height === 0) {
            Logger.logError(
              new Error(
                `Image at index ${index} has zero dimension: width=${image.width}, height=${image.height}`,
              ),
            );
          }

          let compressedUri: string;
          try {
            compressedUri = await ImageCompressor.compress(image.uri, {
              compressionMethod: 'auto',
              maxWidth: 2560,
              maxHeight: 2560,
              quality: 0.9,
            });
          } catch (compressError) {
            Logger.logError(
              compressError instanceof Error
                ? compressError
                : new Error(String(compressError)),
            );
            compressedUri = image.uri;
          }

          const result = await uploadToPresignedUrlWithRetry(
            url,
            compressedUri,
          );

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
    } catch (error) {
      const {errorType, httpStatus} = classifyError(error);
      await Logger.logUploadImageFailed({
        errorType,
        httpStatus,
        imageCount: images.length,
        retryCount: 1,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      Logger.logError(
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  },
};

export default ImageFileUtils;

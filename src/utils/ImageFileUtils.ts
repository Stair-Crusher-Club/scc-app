import {floor} from 'lodash';
import {Image as ImageCompressor} from 'react-native-compressor';

import {DefaultApi, ImageUploadPurpose} from '@/generated-sources/openapi';
import Logger from '@/logging/Logger';
import ImageFile from '@/models/ImageFile';

const UPLOAD_TIMEOUT_MS = 30_000;

export interface UploadProgress {
  stage: 'compressing' | 'uploading' | 'registering';
  currentIndex: number;
  totalImages: number;
  bytesUploaded: number;
  totalBytes: number;
  imageSizeMb: number;
}

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

interface ImageDebugInfo {
  imageMime?: string;
  imageSizeMb?: number;
}

function attachDebugInfo<E extends Error>(error: E, info: ImageDebugInfo): E {
  Object.assign(error, info);
  return error;
}

function extractDebugInfo(error: unknown): ImageDebugInfo {
  if (error && typeof error === 'object') {
    const e = error as ImageDebugInfo;
    return {imageMime: e.imageMime, imageSizeMb: e.imageSizeMb};
  }
  return {};
}

class UploadHttpError extends Error {
  httpStatus: number;
  imageMime?: string;
  imageSizeMb?: number;
  constructor(message: string, httpStatus: number) {
    super(message);
    this.name = 'UploadHttpError';
    this.httpStatus = httpStatus;
  }
}

/** presigned URL에 이미지 업로드 (내부 전용) — XMLHttpRequest 사용으로 progress 지원 */
async function uploadToPresignedUrl(
  presignedUrl: string,
  imageFileUrl: string,
  onProgress?: (loaded: number, total: number) => void,
): Promise<UploadImageResult> {
  const url = new URL(presignedUrl);
  const resp = await fetch(imageFileUrl);
  const imageBody = await resp.blob();

  return new Promise<UploadImageResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.timeout = UPLOAD_TIMEOUT_MS;

    xhr.upload.onprogress = (e: ProgressEvent) => {
      if (e.lengthComputable) {
        onProgress?.(e.loaded, e.total);
      }
    };

    const debugInfo: ImageDebugInfo = {
      imageMime: imageBody.type,
      imageSizeMb: floor(imageBody.size / (1024 * 1024), 3),
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({
          url: url.protocol + '//' + url.host + url.pathname,
          size: imageBody.size,
        });
      } else {
        reject(
          attachDebugInfo(
            new UploadHttpError(
              `Upload image to ${url.href} is failed. cause: ${xhr.responseText}`,
              xhr.status,
            ),
            debugInfo,
          ),
        );
      }
    };

    xhr.ontimeout = () => {
      reject(
        attachDebugInfo(
          new Error(
            `Image upload timed out after ${UPLOAD_TIMEOUT_MS / 1000}s`,
          ),
          debugInfo,
        ),
      );
    };

    xhr.onerror = () => {
      reject(
        attachDebugInfo(new TypeError('Network request failed'), debugInfo),
      );
    };

    xhr.open('PUT', url.href);
    xhr.setRequestHeader('content-type', imageBody.type);
    xhr.setRequestHeader('x-amz-acl', 'public-read');
    xhr.send(imageBody);
  });
}

/** 1회 재시도 포함 업로드 */
async function uploadToPresignedUrlWithRetry(
  presignedUrl: string,
  imageFileUrl: string,
  onProgress?: (loaded: number, total: number) => void,
): Promise<UploadImageResult> {
  try {
    return await uploadToPresignedUrl(presignedUrl, imageFileUrl, onProgress);
  } catch (_firstError) {
    await delay(1000);
    return await uploadToPresignedUrl(presignedUrl, imageFileUrl, onProgress);
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
    onProgress?: (progress: UploadProgress) => void,
  ) {
    const startTimeOfTotal = Date.now();
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
      const uploadedUrls: string[] = [];

      for (let index = 0; index < images.length; index++) {
        const image = images[index];
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

        // Compressing stage
        onProgress?.({
          stage: 'compressing',
          currentIndex: index,
          totalImages: images.length,
          bytesUploaded: 0,
          totalBytes: 0,
          imageSizeMb: 0,
        });

        const startCompress = Date.now();
        let compressedUri: string;
        try {
          compressedUri = await ImageCompressor.compress(image.uri, {
            compressionMethod: 'auto',
            maxWidth: 2560,
            maxHeight: 2560,
            quality: 0.7,
            // HEIC 입력이라도 JPEG로 출력 강제. iOS 26 호환성.
            output: 'jpg',
          });
        } catch (compressError) {
          Logger.logError(
            compressError instanceof Error
              ? compressError
              : new Error(String(compressError)),
          );
          compressedUri = image.uri;
        }
        const durationCompress = Date.now() - startCompress;

        // Uploading stage
        const startUpload = Date.now();
        const result = await uploadToPresignedUrlWithRetry(
          url,
          compressedUri,
          (loaded, total) => {
            const imageSizeMb = floor(total / (1024 * 1024), 2);
            onProgress?.({
              stage: 'uploading',
              currentIndex: index,
              totalImages: images.length,
              bytesUploaded: loaded,
              totalBytes: total,
              imageSizeMb,
            });
          },
        );
        const durationUpload = Date.now() - startUpload;

        durationOfUploadImages[`duration_millis_of_upload_image_${index}`] =
          Date.now() - startTimeOfImageUpload;
        durationOfUploadImages[`duration_millis_of_compress_${index}`] =
          durationCompress;
        durationOfUploadImages[`duration_millis_of_s3_upload_${index}`] =
          durationUpload;
        durationOfUploadImages[`size_mb_of_image_${index}`] = floor(
          result.size / (1024 * 1024),
          2,
        );

        uploadedUrls.push(result.url);
      }

      await Logger.logUploadImage({
        ...durationOfUploadImages,
        duration_millis_of_presigned_urls: durationOfGettingPresignedUrls,
        duration_millis_total: Date.now() - startTimeOfTotal,
        image_count: images.length,
      });

      return uploadedUrls;
    } catch (error) {
      const {errorType, httpStatus} = classifyError(error);
      const {imageMime, imageSizeMb} = extractDebugInfo(error);
      await Logger.logUploadImageFailed({
        errorType,
        httpStatus,
        imageCount: images.length,
        retryCount: 1,
        errorMessage: error instanceof Error ? error.message : String(error),
        imageMime,
        imageSizeMb,
      });
      Logger.logError(
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  },
};

export default ImageFileUtils;

import {floor} from 'lodash';
import {Platform} from 'react-native';
import {Image as ImageCompressor} from 'react-native-compressor';

import {DefaultApi, ImageUploadPurpose} from '@/generated-sources/openapi';
import Logger from '@/logging/Logger';
import ImageFile from '@/models/ImageFile';

const UPLOAD_TIMEOUT_MS = 30_000;
// 압축·로컬 파일 읽기는 멈추면 영원히 돌아오지 않는다 — '압축 중' 에서 5분씩 멈춘다는 실사용 보고.
const PRESIGNED_URL_TIMEOUT_MS = 15_000;
const COMPRESS_TIMEOUT_MS = 20_000;
const READ_FILE_TIMEOUT_MS = 15_000;

type UploadStep = 'presigned_url' | 'compress' | 'read_file' | 's3_upload';

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

/** 단계가 timeout 안에 안 끝남. 어느 단계에서 멈추는지 Crashlytics 로 추적한다. */
class UploadStallError extends Error {
  constructor(step: UploadStep, timeoutMs: number) {
    super(`Image upload stalled at ${step} for ${timeoutMs / 1000}s`);
    this.name = 'UploadStallError';
  }
}

export class UploadCancelledError extends Error {
  constructor() {
    super('Image upload cancelled by user');
    this.name = 'UploadCancelledError';
  }
}

/**
 * promise 를 timeout·사용자 취소와 경주시킨다.
 * ponytail: 네이티브 압축 같은 원 작업은 멈추지 못하고 결과만 버린다 — 화면을 푸는 게 목적이라 충분하다.
 */
function guard<T>(
  promise: Promise<T>,
  step: UploadStep,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new UploadCancelledError());
      return;
    }
    const onAbort = () => reject(new UploadCancelledError());
    const timer = setTimeout(
      () => reject(new UploadStallError(step, timeoutMs)),
      timeoutMs,
    );
    signal?.addEventListener('abort', onAbort);
    promise.then(resolve, reject).finally(() => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    });
  });
}

/** Crashlytics 는 message 로만 구분되므로 멈춘 단계·이미지 정보를 message 에 싣는다. */
function withUploadContext(error: unknown, context: string): Error {
  const e = error instanceof Error ? error : new Error(String(error));
  e.message = `${e.message} [${context} os=${Platform.OS}]`;
  return e;
}

function describeImage(image: ImageFile): string {
  const ext = image.uri.split('?')[0].split('.').pop()?.toLowerCase();
  return `${image.width}x${image.height} ext=${ext}`;
}

function classifyError(error: unknown): {
  errorType: 'timeout' | 'network' | 'http_error' | 'cancelled' | 'unknown';
  httpStatus?: number;
} {
  if (error instanceof UploadCancelledError) {
    return {errorType: 'cancelled'};
  }
  if (error instanceof UploadStallError) {
    return {errorType: 'timeout'};
  }
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
  signal?: AbortSignal,
  onStep?: (step: UploadStep) => void,
): Promise<UploadImageResult> {
  const url = new URL(presignedUrl);
  onStep?.('read_file');
  const imageBody = await guard(
    fetch(imageFileUrl).then(resp => resp.blob()),
    'read_file',
    READ_FILE_TIMEOUT_MS,
    signal,
  );

  return new Promise<UploadImageResult>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new UploadCancelledError());
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.timeout = UPLOAD_TIMEOUT_MS;
    signal?.addEventListener('abort', () => xhr.abort());
    xhr.onabort = () => reject(new UploadCancelledError());

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
    onStep?.('s3_upload');
    xhr.send(imageBody);
  });
}

/** 1회 재시도 포함 업로드 (사용자 취소는 재시도하지 않는다) */
async function uploadToPresignedUrlWithRetry(
  presignedUrl: string,
  imageFileUrl: string,
  onProgress?: (loaded: number, total: number) => void,
  signal?: AbortSignal,
  onStep?: (step: UploadStep) => void,
): Promise<UploadImageResult> {
  try {
    return await uploadToPresignedUrl(
      presignedUrl,
      imageFileUrl,
      onProgress,
      signal,
      onStep,
    );
  } catch (firstError) {
    if (firstError instanceof UploadCancelledError) {
      throw firstError;
    }
    await delay(1000);
    return await uploadToPresignedUrl(
      presignedUrl,
      imageFileUrl,
      onProgress,
      signal,
      onStep,
    );
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
  /**
   * 단계마다 timeout 을 걸어 멈춘 채로 남지 않게 한다. 압축이 멈추면 원본으로 올리고,
   * 나머지 단계는 에러로 끝낸다. `signal` 로 사용자가 언제든 취소할 수 있다.
   */
  async uploadImages(
    api: DefaultApi,
    images: ImageFile[] = [],
    purposeType?: ImageUploadPurpose,
    onProgress?: (progress: UploadProgress) => void,
    signal?: AbortSignal,
  ) {
    const startTimeOfTotal = Date.now();
    // 실패·취소 시 "어디서 멈췄나" 보고용
    let step: UploadStep = 'presigned_url';
    let stepStartedAt = Date.now();
    let index = 0;
    const enterStep = (next: UploadStep) => {
      step = next;
      stepStartedAt = Date.now();
    };

    let durationOfUploadImages: Record<string, number> = {};
    try {
      const uploadUrls = await guard(
        api
          .getImageUploadUrlsPost({
            count: images.length,
            filenameExtension: 'jpeg',
            purposeType,
          })
          .then(res => res.data.map(data => data.url)),
        'presigned_url',
        PRESIGNED_URL_TIMEOUT_MS,
        signal,
      );
      const durationOfGettingPresignedUrls = Date.now() - startTimeOfTotal;

      const uploadedUrls: string[] = [];

      for (index = 0; index < images.length; index++) {
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

        enterStep('compress');
        let compressedUri: string;
        try {
          compressedUri = await guard(
            ImageCompressor.compress(image.uri, {
              compressionMethod: 'auto',
              maxWidth: 2560,
              maxHeight: 2560,
              quality: 0.7,
              // HEIC 입력이라도 JPEG로 출력 강제. iOS 26 호환성.
              output: 'jpg',
            }),
            'compress',
            COMPRESS_TIMEOUT_MS,
            signal,
          );
        } catch (compressError) {
          if (compressError instanceof UploadCancelledError) {
            throw compressError;
          }
          // 압축 실패·멈춤은 원본으로 올려 사용자를 막지 않는다. 원인 추적용으로만 보고.
          Logger.logError(
            withUploadContext(
              compressError,
              `image=${index + 1}/${images.length} ${describeImage(image)}`,
            ),
          );
          compressedUri = image.uri;
        }
        const durationCompress = Date.now() - stepStartedAt;

        // Uploading stage — read_file/s3_upload 전환은 재시도까지 포함해 내부에서 알린다
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
          signal,
          enterStep,
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
      const elapsedMillisInStep = Date.now() - stepStartedAt;
      await Logger.logUploadImageFailed({
        errorType,
        httpStatus,
        imageCount: images.length,
        retryCount: 1,
        errorMessage: error instanceof Error ? error.message : String(error),
        imageMime,
        imageSizeMb,
        step,
        elapsedMillisInStep,
        imageIndex: index,
      });
      const image = images[index];
      Logger.logError(
        withUploadContext(
          error,
          `step=${step} elapsed_in_step=${elapsedMillisInStep}ms image=${index + 1}/${images.length}` +
            (image ? ` ${describeImage(image)}` : ''),
        ),
      );
      throw error;
    }
  },
};

export default ImageFileUtils;

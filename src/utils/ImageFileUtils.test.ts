import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals';

import type {DefaultApi} from '@/generated-sources/openapi';
import Logger from '@/logging/Logger';
import ImageFileUtils, {UploadCancelledError} from '@/utils/ImageFileUtils';

type NativeUpload = (
  url: string,
  filePath: string,
  options: Record<string, unknown>,
  onProgress?: (written: number, total: number) => void,
  signal?: AbortSignal,
) => Promise<{status: number}>;

const mockCompress = jest.fn<(uri: string) => Promise<string>>();
const mockBackgroundUpload = jest.fn<NativeUpload>();
jest.mock('react-native-compressor', () => ({
  Image: {compress: (uri: string) => mockCompress(uri)},
  UploadType: {BINARY_CONTENT: 0, MULTIPART: 1},
  backgroundUpload: (...args: Parameters<NativeUpload>) =>
    mockBackgroundUpload(...args),
}));
jest.mock('@/logging/Logger', () => ({
  __esModule: true,
  default: {
    logError: jest.fn(),
    logUploadImage: jest.fn(),
    logUploadImageFailed: jest.fn(),
    logUploadImageProgress: jest.fn(),
  },
}));

/** 다음 틱에 100% progress 후 200 으로 끝나는 네이티브 업로드 */
const respondOk: NativeUpload = (_url, _path, _options, onProgress) =>
  new Promise(resolve =>
    setTimeout(() => {
      onProgress?.(1024, 1024);
      resolve({status: 200});
    }, 0),
  );
/** progress·응답 없이 매달리는 네이티브 업로드 */
const hang: NativeUpload = () => new Promise(() => {});

const api = {
  getImageUploadUrlsPost: () =>
    Promise.resolve({data: [{url: 'https://s3.example/a.jpg?sig=1'}]}),
} as unknown as DefaultApi;
const images = [{uri: 'file:///photo.heic', width: 3024, height: 4032}];
const uploadedPaths = () => mockBackgroundUpload.mock.calls.map(c => c[1]);

beforeEach(() => {
  jest.useFakeTimers();
  mockBackgroundUpload.mockImplementation(respondOk);
  mockCompress.mockReturnValue(new Promise<string>(() => {})); // 압축이 영원히 멈춤
});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});

describe('ImageFileUtils.uploadImages 멈춤 대응', () => {
  it('압축이 멈추면 5초 뒤 원본으로 올리고, 멈춤을 Crashlytics 에 보고한다', async () => {
    const result = ImageFileUtils.uploadImages(api, images);
    await jest.advanceTimersByTimeAsync(5_000);
    await jest.advanceTimersByTimeAsync(1); // 네이티브 응답

    await expect(result).resolves.toEqual(['https://s3.example/a.jpg']);
    expect(uploadedPaths()).toEqual(['/photo.heic']);
    expect(String((Logger.logError as jest.Mock).mock.calls[0][0])).toContain(
      'stalled at compress',
    );
  });

  it('사용자가 취소하면 재시도 없이 UploadCancelledError 로 끝나고, 멈춘 단계를 남긴다', async () => {
    const controller = new AbortController();
    const result = ImageFileUtils.uploadImages(
      api,
      images,
      undefined,
      undefined,
      controller.signal,
    );
    await jest.advanceTimersByTimeAsync(2_000); // 압축 timeout(5초) 전에 취소
    controller.abort();

    await expect(result).rejects.toBeInstanceOf(UploadCancelledError);
    expect(uploadedPaths()).toEqual([]);
    expect(Logger.logUploadImageFailed).toHaveBeenCalledWith(
      expect.objectContaining({errorType: 'cancelled', step: 'compress'}),
    );
  });

  it('파일을 JS 로 읽지 않고 네이티브가 file:// 를 뗀 경로에서 서명된 헤더로 PUT 한다', async () => {
    mockCompress.mockResolvedValue('file:///cache/compressed.jpg');
    const result = ImageFileUtils.uploadImages(api, images);
    await jest.advanceTimersByTimeAsync(1);

    await expect(result).resolves.toEqual(['https://s3.example/a.jpg']);
    expect(mockBackgroundUpload).toHaveBeenCalledWith(
      'https://s3.example/a.jpg?sig=1',
      '/cache/compressed.jpg',
      expect.objectContaining({
        httpMethod: 'PUT',
        uploadType: 0,
        headers: {'content-type': 'image/jpeg', 'x-amz-acl': 'public-read'},
      }),
      expect.any(Function),
      expect.anything(),
    );
    expect(Logger.logUploadImage).toHaveBeenCalledWith(
      expect.objectContaining({size_mb_of_image_0: 0}),
    );
  });

  it('S3 가 4xx 를 돌려주면 성공으로 넘기지 않고 http_error 로 남긴다', async () => {
    mockCompress.mockResolvedValue('file:///cache/compressed.jpg');
    mockBackgroundUpload.mockResolvedValue({status: 403});
    const result = ImageFileUtils.uploadImages(api, images);
    const settled = result.catch((e: unknown) => e);
    await jest.advanceTimersByTimeAsync(1_000 + 1); // 재시도 대기 포함

    expect(String(await settled)).toContain('HTTP 403');
    expect(mockBackgroundUpload).toHaveBeenCalledTimes(2);
    expect(Logger.logUploadImageFailed).toHaveBeenCalledWith(
      expect.objectContaining({
        errorType: 'http_error',
        httpStatus: 403,
        step: 's3_upload',
      }),
    );
  });

  it('S3 전송이 progress 없이 멈춘 채 취소되면 네이티브 업로드도 abort 하고 step 은 s3_upload 로 남는다', async () => {
    mockCompress.mockResolvedValue('file:///cache/compressed.jpg');
    mockBackgroundUpload.mockImplementation(hang);
    const controller = new AbortController();
    const result = ImageFileUtils.uploadImages(
      api,
      images,
      undefined,
      undefined,
      controller.signal,
    );
    await jest.advanceTimersByTimeAsync(5_000);
    controller.abort();

    await expect(result).rejects.toBeInstanceOf(UploadCancelledError);
    const nativeSignal = mockBackgroundUpload.mock.calls[0][4];
    expect(nativeSignal?.aborted).toBe(true);
    expect(Logger.logUploadImageFailed).toHaveBeenCalledWith(
      expect.objectContaining({errorType: 'cancelled', step: 's3_upload'}),
    );
  });

  it('S3 전송이 진행 없이 30초 멈추면 끊고 1회 재시도하고, 멈춘 구간을 heartbeat·요약값으로 남긴다', async () => {
    mockCompress.mockResolvedValue('file:///cache/compressed.jpg');
    // 첫 시도는 progress 없이 매달리고(TCP 가 끊긴 채 복구 안 되는 상황), 재시도는 응답한다
    mockBackgroundUpload.mockImplementationOnce(hang);
    const result = ImageFileUtils.uploadImages(api, images);
    await jest.advanceTimersByTimeAsync(30_000 + 1_000 + 1);

    await expect(result).resolves.toEqual(['https://s3.example/a.jpg']);
    expect(mockBackgroundUpload).toHaveBeenCalledTimes(2);
    expect(mockBackgroundUpload.mock.calls[0][4]?.aborted).toBe(true);
    expect(Logger.logUploadImage).toHaveBeenCalledWith(
      expect.objectContaining({
        s3_retries: 1,
        max_no_progress_millis: 30_000,
        max_no_progress_at_pct: 0,
        max_no_progress_image_index: 0,
      }),
    );
    const beats = (Logger.logUploadImageProgress as jest.Mock).mock.calls.map(
      c => c[0] as Record<string, unknown>,
    );
    expect(beats).toContainEqual(
      expect.objectContaining({
        step: 's3_upload',
        attempt: 1,
        bytes_sent: 0,
        millis_since_progress: 29_000,
      }),
    );
    expect(beats).toContainEqual(
      expect.objectContaining({step: 'retry_wait', attempt: 1}),
    );
    // 끝나면 heartbeat 도 멈춘다
    const count = beats.length;
    await jest.advanceTimersByTimeAsync(5_000);
    expect(Logger.logUploadImageProgress).toHaveBeenCalledTimes(count);
  });

  it('전송 도중 40% 에서 멈추면 멈춘 지점을 40% 로 남긴다', async () => {
    mockCompress.mockResolvedValue('file:///cache/compressed.jpg');
    mockBackgroundUpload.mockImplementationOnce(
      (_url, _path, _options, onProgress) => {
        setTimeout(() => onProgress?.(400, 1000), 2_000);
        return new Promise(() => {});
      },
    );
    const result = ImageFileUtils.uploadImages(api, images);
    await jest.advanceTimersByTimeAsync(30_000 + 1_000 + 1);

    await expect(result).resolves.toEqual(['https://s3.example/a.jpg']);
    expect(Logger.logUploadImage).toHaveBeenCalledWith(
      expect.objectContaining({
        max_no_progress_millis: 28_000,
        max_no_progress_at_pct: 40,
        max_first_progress_millis: 2_000,
      }),
    );
  });
});

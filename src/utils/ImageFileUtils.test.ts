import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals';

import type {DefaultApi} from '@/generated-sources/openapi';
import Logger from '@/logging/Logger';
import ImageFileUtils, {UploadCancelledError} from '@/utils/ImageFileUtils';

const mockCompress = jest.fn<(uri: string) => Promise<string>>();
jest.mock('react-native-compressor', () => ({
  Image: {compress: (uri: string) => mockCompress(uri)},
}));
jest.mock('@/logging/Logger', () => ({
  __esModule: true,
  default: {
    logError: jest.fn(),
    logUploadImage: jest.fn(),
    logUploadImageFailed: jest.fn(),
  },
}));

class FakeXhr {
  upload: {onprogress: ((e: unknown) => void) | null} = {onprogress: null};
  status = 0;
  timeout = 0;
  onload: (() => void) | null = null;
  onabort: (() => void) | null = null;
  open() {}
  setRequestHeader() {}
  send() {
    setTimeout(() => {
      this.status = 200;
      this.onload?.();
    }, 0);
  }
  abort() {
    this.onabort?.();
  }
}

const api = {
  getImageUploadUrlsPost: () =>
    Promise.resolve({data: [{url: 'https://s3.example/a.jpg?sig=1'}]}),
} as unknown as DefaultApi;
const images = [{uri: 'file:///photo.heic', width: 3024, height: 4032}];
const fetchedUris: string[] = [];

beforeEach(() => {
  jest.useFakeTimers();
  fetchedUris.length = 0;
  (global as any).XMLHttpRequest = FakeXhr;
  (global as any).fetch = (uri: string) => {
    fetchedUris.push(uri);
    return Promise.resolve({
      blob: () => Promise.resolve({type: 'image/jpeg', size: 1024}),
    });
  };
  mockCompress.mockReturnValue(new Promise<string>(() => {})); // 압축이 영원히 멈춤
});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});

describe('ImageFileUtils.uploadImages 멈춤 대응', () => {
  it('압축이 멈추면 20초 뒤 원본으로 올리고, 멈춤을 Crashlytics 에 보고한다', async () => {
    const result = ImageFileUtils.uploadImages(api, images);
    await jest.advanceTimersByTimeAsync(20_000);
    await jest.advanceTimersByTimeAsync(1); // FakeXhr 응답

    await expect(result).resolves.toEqual(['https://s3.example/a.jpg']);
    expect(fetchedUris).toEqual(['file:///photo.heic']);
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
    await jest.advanceTimersByTimeAsync(5_000);
    controller.abort();

    await expect(result).rejects.toBeInstanceOf(UploadCancelledError);
    expect(fetchedUris).toEqual([]);
    expect(Logger.logUploadImageFailed).toHaveBeenCalledWith(
      expect.objectContaining({errorType: 'cancelled', step: 'compress'}),
    );
  });

  it('S3 전송이 progress 없이 멈춘 채 취소돼도 step 은 s3_upload 로 남는다', async () => {
    mockCompress.mockResolvedValue('file:///compressed.jpg');
    // 응답·progress 없이 매달리는 XHR
    (global as any).XMLHttpRequest = class extends FakeXhr {
      send() {}
    };
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
    expect(Logger.logUploadImageFailed).toHaveBeenCalledWith(
      expect.objectContaining({errorType: 'cancelled', step: 's3_upload'}),
    );
  });
});

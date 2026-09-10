import {describe, expect, it} from '@jest/globals';

import {isItemOutsideRegion, Region, shouldRefitCamera} from './Types';

const region: Region = {
  northEast: {latitude: 10, longitude: 10},
  southWest: {latitude: 0, longitude: 0},
};

describe('isItemOutsideRegion', () => {
  it('region 안에 있으면 false', () => {
    expect(isItemOutsideRegion({location: {lat: 5, lng: 5}}, region)).toBe(
      false,
    );
  });

  it('위도/경도가 각각 region 밖이면 true', () => {
    expect(isItemOutsideRegion({location: {lat: 11, lng: 5}}, region)).toBe(
      true,
    );
    expect(isItemOutsideRegion({location: {lat: -1, lng: 5}}, region)).toBe(
      true,
    );
    expect(isItemOutsideRegion({location: {lat: 5, lng: 11}}, region)).toBe(
      true,
    );
    expect(isItemOutsideRegion({location: {lat: 5, lng: -1}}, region)).toBe(
      true,
    );
  });

  it('location 이 없으면 판단 불가라 false 로 취급한다', () => {
    expect(isItemOutsideRegion({location: undefined}, region)).toBe(false);
  });
});

describe('shouldRefitCamera', () => {
  it('items 가 비어있으면 fit 하지 않는다', () => {
    expect(shouldRefitCamera([], region)).toBe(false);
    expect(shouldRefitCamera([], null)).toBe(false);
  });

  it('cameraRegion 이 아직 없으면(최초 로드) fit 한다', () => {
    expect(shouldRefitCamera([{location: {lat: 5, lng: 5}}], null)).toBe(true);
  });

  it('모든 item 이 현재 카메라 안에 있으면 fit 하지 않는다 (불필요한 점프 방지)', () => {
    const items = [{location: {lat: 5, lng: 5}}, {location: {lat: 2, lng: 8}}];
    expect(shouldRefitCamera(items, region)).toBe(false);
  });

  it('하나라도 카메라 밖에 있으면 fit 한다 (필터 해제로 화면 밖 장소가 생긴 경우)', () => {
    const items = [
      {location: {lat: 5, lng: 5}},
      {location: {lat: 20, lng: 20}},
    ];
    expect(shouldRefitCamera(items, region)).toBe(true);
  });
});

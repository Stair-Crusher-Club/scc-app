import {describe, expect, it} from '@jest/globals';

import {withModalPresentation} from './withModalPresentation';

const navigation = {};
const optionsFor = (
  params: unknown,
  options?: Parameters<typeof withModalPresentation>[0],
) => withModalPresentation(options)({route: {params}, navigation});

describe('withModalPresentation', () => {
  it('asModal 없으면 기존 options 를 그대로 반환한다 (전 화면 동작 변화 없음)', () => {
    expect(optionsFor(undefined, {headerShown: false})).toEqual({
      headerShown: false,
    });
    expect(optionsFor({placeListId: 'x'}, {headerShown: false})).toEqual({
      headerShown: false,
    });
  });

  it('options 가 없던 화면도 안전하다', () => {
    expect(optionsFor(undefined)).toEqual({});
  });

  it('코드에서 navigate 한 boolean true 는 모달', () => {
    expect(optionsFor({asModal: true})).toEqual({
      presentation: 'fullScreenModal',
    });
  });

  // 딥링크는 쿼리스트링이라 값이 문자열로 들어온다.
  it("딥링크의 문자열 'true' 도 모달", () => {
    expect(optionsFor({asModal: 'true'}, {headerShown: false})).toEqual({
      headerShown: false,
      presentation: 'fullScreenModal',
    });
  });

  it("문자열 'false' 는 모달이 아니다 (truthy 라서 오탐하기 쉬운 지점)", () => {
    expect(optionsFor({asModal: 'false'}, {headerShown: false})).toEqual({
      headerShown: false,
    });
  });

  it('함수형 options 도 평가해서 합친다', () => {
    const options = ({route}: {route: any; navigation: any}) => ({
      headerTitle: route.params?.title as string,
    });
    expect(optionsFor({asModal: true, title: '장소 리스트'}, options)).toEqual({
      headerTitle: '장소 리스트',
      presentation: 'fullScreenModal',
    });
  });
});

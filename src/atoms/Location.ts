import {atom} from 'jotai';

type CurrentLocation = {latitude: number; longitude: number} | null;

const baseCurrentLocationAtom = atom<CurrentLocation>(null);

/**
 * 현위치. **같은 좌표를 다시 쓰면 무시한다** — 쓰기 진입점 한 곳에서 막는다.
 *
 * 쓰는 곳이 여러 개다(지도의 GPS watch, 현위치 버튼, 홈 진입 시 권한 요청). 각자
 * `{latitude, longitude}` 객체를 새로 만들어 넣어서, 좌표가 그대로여도 참조가 바뀌어
 * 구독처가 전부 리렌더된다. 지도 화면에선 그 리렌더마다 마커 수백 개를 다시 만들어
 * 네이티브로 밀어 넣는다(실측: CTPL 361개 × 초당 4회).
 */
export const currentLocationAtom = atom(
  get => get(baseCurrentLocationAtom),
  (get, set, value: CurrentLocation) => {
    const prev = get(baseCurrentLocationAtom);
    if (
      prev?.latitude === value?.latitude &&
      prev?.longitude === value?.longitude
    ) {
      return;
    }
    set(baseCurrentLocationAtom, value);
  },
);

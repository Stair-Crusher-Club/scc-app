import {CustomNavigationOptions} from './Navigation.screens';

type ScreenOptions =
  | CustomNavigationOptions
  | ((props: {route: any; navigation: any}) => CustomNavigationOptions)
  | undefined;

/**
 * `asModal` 로 진입한 화면인지. 값이 들어오는 경로가 둘이라 타입이 두 가지다.
 * - 코드에서 `navigate('Login', {asModal: true})` → boolean
 * - 딥링크 쿼리스트링(`stair-crusher://place-group/x?asModal=true`) → 문자열
 *
 * 문자열 `'false'` 는 truthy 라 단순 truthy 검사로는 모달이 돼버린다 → 값을 명시 비교한다.
 */
function isAsModal(params: unknown): boolean {
  const asModal = (params as {asModal?: unknown} | undefined)?.asModal;
  return asModal === true || asModal === 'true';
}

/**
 * `asModal` 파라미터로 진입한 화면은 **어떤 화면이든** 네이티브 모달로 띄운다.
 *
 * Webview 는 `presentation: 'fullScreenModal'` 이라, 그 위에 기본 push 로 화면을 올리면
 * iOS 에서 네이티브 모달이 위에 남아 새 화면이 가려진다 → 유저에겐 "눌러도 무반응" 이고,
 * 그 상태에서 X 를 누르면 가려진 화면이 먼저 pop 돼 **닫기를 두 번** 눌러야 한다.
 *
 * 웹뷰 안 링크(딥링크/트래킹 링크)가 띄울 수 있는 화면은 linkingConfig 에 있는 전부이므로
 * 화면마다 옵션을 붙이지 않고 등록 지점(Navigation.tsx)에서 일괄 적용한다 —
 * 새 화면이 추가돼도 자동으로 적용된다.
 */
export function withModalPresentation(options: ScreenOptions) {
  return (props: {route: any; navigation: any}): CustomNavigationOptions => {
    const resolved = typeof options === 'function' ? options(props) : options;
    if (!isAsModal(props.route?.params)) {
      return resolved ?? {};
    }
    return {...resolved, presentation: 'fullScreenModal'};
  };
}

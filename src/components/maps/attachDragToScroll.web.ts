/**
 * 웹 데스크톱에서 가로 카드 캐러셀을 마우스 드래그 / 휠로 스크롤 + 카드 단위로
 * 스냅되게 한다. rn-web FlatList 는 네이티브 overflow 스크롤만 지원해 마우스
 * 드래그가 안 되고, snapToInterval / onMomentumScrollEnd 도 동작하지 않는다.
 *
 * - CSS scroll-snap 으로 브라우저가 모든 입력(드래그/휠/트랙패드)에 대해 카드를
 *   중앙으로 스냅한다. (imperative scrollTo 로 rn-web 내부 스크롤 상태와 싸우지 않음)
 * - 스크롤이 멈추면 중앙 카드 인덱스를 onSettle 로 알려 대응 지도 핀이 커지게 한다.
 *
 * @param root  카드 리스트 wrapper View 의 DOM 노드(rn-web 에서는 HTMLElement).
 * @param opts  itemSize: 카드 1개 슬롯 폭, onSettle: 중앙 카드 인덱스 콜백.
 */
export default function attachDragToScroll(
  root: unknown,
  opts: {itemSize: number; onSettle: (index: number) => void},
): () => void {
  const el = root as HTMLElement | null;
  if (!el || typeof el.querySelectorAll !== 'function') {
    return () => {};
  }

  // 실제 스크롤 컨테이너(overflow-x: auto/scroll) 를 찾는다.
  let scroller: HTMLElement | null = null;
  for (const node of Array.from(el.querySelectorAll('div'))) {
    const ox = getComputedStyle(node).overflowX;
    if (ox === 'auto' || ox === 'scroll') {
      scroller = node;
      break;
    }
  }
  if (!scroller) {
    return () => {};
  }
  const target = scroller;
  const {itemSize, onSettle} = opts;

  // CSS scroll-snap: 컨테이너는 가로 mandatory, 각 카드는 center 정렬.
  // 카드(가상화로 추가/제거됨)에 align 을 주려고 클래스 + 전역 스타일 규칙을 쓴다.
  const SNAP_CLASS = 'scc-card-snap';
  const STYLE_ID = 'scc-card-snap-style';
  if (!document.getElementById(STYLE_ID)) {
    const styleEl = document.createElement('style');
    styleEl.id = STYLE_ID;
    styleEl.textContent = `.${SNAP_CLASS} > div > * { scroll-snap-align: center; }`;
    document.head.appendChild(styleEl);
  }
  target.classList.add(SNAP_CLASS);
  const enableSnap = () => {
    target.style.scrollSnapType = 'x mandatory';
    target.style.scrollBehavior = 'smooth';
  };
  enableSnap();

  // 드래그 놓을 때 관성을 반영해 몇 칸 넘길지 투영하는 시간(ms). 클수록 약한 플릭도 넘어감.
  const MOMENTUM_MS = 180;

  let isDown = false;
  let startX = 0;
  let startScroll = 0;
  let moved = false;
  let lastIndex = -1;
  let lastMoveX = 0;
  let lastMoveT = 0;
  let velocity = 0; // 포인터 px/ms (오른쪽 +)
  let scrollStopTimer: ReturnType<typeof setTimeout> | undefined;

  const settle = () => {
    const index = Math.max(0, Math.round(target.scrollLeft / itemSize));
    if (index !== lastIndex) {
      lastIndex = index;
      onSettle(index);
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    isDown = true;
    moved = false;
    startX = e.pageX;
    startScroll = target.scrollLeft;
    lastMoveX = e.pageX;
    lastMoveT = e.timeStamp;
    velocity = 0;
    // 드래그 중에는 스냅을 끄고 자유 스크롤 (release 시 관성 반영해 스냅).
    target.style.scrollSnapType = 'none';
    target.style.scrollBehavior = 'auto';
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!isDown) return;
    const dx = e.pageX - startX;
    if (Math.abs(dx) > 3) moved = true;
    target.scrollLeft = startScroll - dx;
    const dt = e.timeStamp - lastMoveT;
    if (dt > 0) velocity = (e.pageX - lastMoveX) / dt;
    lastMoveX = e.pageX;
    lastMoveT = e.timeStamp;
  };
  const onPointerUp = () => {
    if (!isDown) return;
    isDown = false;
    // 관성 투영: 포인터가 왼쪽으로 빠르게 움직였으면(velocity<0) 스크롤은 오른쪽으로
    // 더 가야 하므로 scrollLeft 를 (-velocity*MOMENTUM) 만큼 즉시 더 밀어준 뒤,
    // 네이티브 mandatory 스냅이 그 위치에서 가장 가까운 카드로 부드럽게 정렬하게 한다.
    // (imperative smooth scrollTo 는 rn-web 내부 스크롤 상태와 충돌해 0 으로 리셋되므로
    //  즉시 nudge + 네이티브 스냅 조합을 쓴다.)
    const maxScroll = Math.max(0, target.scrollWidth - target.clientWidth);
    const projected = target.scrollLeft - velocity * MOMENTUM_MS;
    target.scrollLeft = Math.max(0, Math.min(maxScroll, projected));
    enableSnap();
  };
  // 드래그 직후 발생하는 click 이 카드 onPress(상세 진입)로 새지 않게 막는다.
  const onClickCapture = (e: MouseEvent) => {
    if (moved) {
      e.stopPropagation();
      e.preventDefault();
      moved = false;
    }
  };
  // 마우스 휠(세로)을 가로 스크롤로 변환. 트랙패드 가로 스와이프(deltaX)는 네이티브에 맡긴다.
  const onWheel = (e: WheelEvent) => {
    if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
    target.scrollLeft += e.deltaY;
    e.preventDefault();
  };
  // 모든 입력의 스크롤이 멈추면 중앙 카드 포커스.
  const onScroll = () => {
    if (isDown) return;
    clearTimeout(scrollStopTimer);
    scrollStopTimer = setTimeout(settle, 140);
  };

  target.style.cursor = 'grab';
  target.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  target.addEventListener('click', onClickCapture, true);
  target.addEventListener('wheel', onWheel, {passive: false});
  target.addEventListener('scroll', onScroll, {passive: true});

  return () => {
    clearTimeout(scrollStopTimer);
    target.classList.remove(SNAP_CLASS);
    target.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    target.removeEventListener('click', onClickCapture, true);
    target.removeEventListener('wheel', onWheel);
    target.removeEventListener('scroll', onScroll);
  };
}

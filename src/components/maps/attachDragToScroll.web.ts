/**
 * 웹 데스크톱에서 가로 카드 캐러셀을 마우스 드래그 / 휠로 스크롤 + 카드 단위로
 * 스냅되게 한다. rn-web FlatList 는 네이티브 overflow 스크롤만 지원해 마우스
 * 드래그가 안 되고, snapToInterval / onMomentumScrollEnd 도 동작하지 않는다.
 *
 * - 휠/트랙패드: CSS scroll-snap(mandatory + center)으로 네이티브 스냅.
 * - 드래그: 속도(관성)를 반영해 목표 카드를 정하고 rAF 로 부드럽게 스크롤.
 * - 핀 클릭(scrollToIndex): 즉시 점프 대신 rAF 로 부드럽게 스크롤.
 * - 스크롤이 멈추면 중앙 카드 인덱스를 onSettle 로 알려 대응 지도 핀이 커지게 한다.
 *
 * imperative smooth scrollTo 는 rn-web 내부 스크롤 상태/mandatory 스냅과 충돌해
 * 0 으로 리셋되므로, rAF 로 매 프레임 scrollLeft 를 직접 세팅(=네이티브 스크롤로
 * 추적됨)하는 방식으로 애니메이션한다.
 *
 * @param root  카드 리스트 wrapper View 의 DOM 노드(rn-web 에서는 HTMLElement).
 * @param opts  itemSize: 카드 1개 슬롯 폭, onSettle: 중앙 카드 인덱스 콜백,
 *              control: { scrollToIndex } 를 채워 핀 클릭 시 호출할 수 있게 한다.
 */
export default function attachDragToScroll(
  root: unknown,
  opts: {
    itemSize: number;
    onSettle: (index: number) => void;
    control?: {scrollToIndex?: (index: number) => void};
  },
): () => void {
  const el = root as HTMLElement | null;
  if (!el || typeof el.querySelectorAll !== 'function') {
    return () => {};
  }

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
  const {itemSize, onSettle, control} = opts;

  // CSS scroll-snap: 컨테이너는 가로 mandatory, 각 카드는 center 정렬.
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

  const MOMENTUM_MS = 250; // 드래그 놓을 때 관성 투영 시간(클수록 약한 플릭도 잘 넘어감)
  const ANIM_MS = 280;

  let isDown = false;
  let startX = 0;
  let startScroll = 0;
  let moved = false;
  let lastIndex = -1;
  let scrollStopTimer: ReturnType<typeof setTimeout> | undefined;
  let rafId = 0;
  let isAnimating = false;
  // 속도 측정용 최근 포인터 위치 기록 (release 직전 감속 구간만 보면 과소평가됨)
  let samples: Array<{x: number; t: number}> = [];

  const maxScroll = () => Math.max(0, target.scrollWidth - target.clientWidth);

  const settle = () => {
    const index = Math.max(0, Math.round(target.scrollLeft / itemSize));
    if (index !== lastIndex) {
      lastIndex = index;
      onSettle(index);
    }
  };

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  const animateTo = (rawTarget: number) => {
    const dest = Math.max(0, Math.min(maxScroll(), rawTarget));
    cancelAnimationFrame(rafId);
    const from = target.scrollLeft;
    const dist = dest - from;
    if (Math.abs(dist) < 1) {
      settle();
      return;
    }
    // 애니메이션 동안에는 mandatory 스냅을 꺼 충돌 방지.
    target.style.scrollSnapType = 'none';
    target.style.scrollBehavior = 'auto';
    isAnimating = true;
    let startTs = -1;
    const step = (ts: number) => {
      if (startTs < 0) startTs = ts;
      const p = Math.min(1, (ts - startTs) / ANIM_MS);
      target.scrollLeft = from + dist * easeOutCubic(p);
      if (p < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        target.scrollLeft = dest;
        isAnimating = false;
        enableSnap();
        settle();
      }
    };
    rafId = requestAnimationFrame(step);
  };

  // 핀 클릭 등 외부에서 특정 카드로 부드럽게 스크롤.
  if (control) {
    control.scrollToIndex = (index: number) => animateTo(index * itemSize);
  }

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    cancelAnimationFrame(rafId);
    isAnimating = false;
    isDown = true;
    moved = false;
    startX = e.pageX;
    startScroll = target.scrollLeft;
    samples = [{x: e.pageX, t: e.timeStamp}];
    target.style.scrollSnapType = 'none';
    target.style.scrollBehavior = 'auto';
    try {
      target.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!isDown) return;
    const dx = e.pageX - startX;
    if (Math.abs(dx) > 3) moved = true;
    target.scrollLeft = startScroll - dx;
    samples.push({x: e.pageX, t: e.timeStamp});
    // 최근 100ms 구간만 유지.
    const cutoff = e.timeStamp - 100;
    while (samples.length > 2 && samples[0].t < cutoff) samples.shift();
  };
  const onPointerUp = (e: PointerEvent) => {
    if (!isDown) return;
    isDown = false;
    // 최근 구간 평균 속도(px/ms). 마지막 한 샘플만 쓰면 release 직전 감속 때문에
    // 과소평가되어 빠른 플릭도 안 넘어간다 → 100ms 윈도우의 시작점과 비교.
    const now = e.timeStamp;
    const ref = samples[0] ?? {x: startX, t: now};
    const dt = now - ref.t;
    const velocity = dt > 0 ? (e.pageX - ref.x) / dt : 0;
    const projected = target.scrollLeft - velocity * MOMENTUM_MS;
    const targetIndex = Math.round(projected / itemSize);
    animateTo(targetIndex * itemSize);
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
  // 휠/트랙패드 스크롤이 멈추면 중앙 카드 포커스.
  const onScroll = () => {
    if (isDown || isAnimating) return;
    clearTimeout(scrollStopTimer);
    scrollStopTimer = setTimeout(settle, 140);
  };

  target.style.cursor = 'grab';
  target.addEventListener('pointerdown', onPointerDown);
  target.addEventListener('pointermove', onPointerMove);
  target.addEventListener('pointerup', onPointerUp);
  target.addEventListener('pointercancel', onPointerUp);
  target.addEventListener('click', onClickCapture, true);
  target.addEventListener('wheel', onWheel, {passive: false});
  target.addEventListener('scroll', onScroll, {passive: true});

  return () => {
    cancelAnimationFrame(rafId);
    clearTimeout(scrollStopTimer);
    if (control) control.scrollToIndex = undefined;
    target.classList.remove(SNAP_CLASS);
    target.removeEventListener('pointerdown', onPointerDown);
    target.removeEventListener('pointermove', onPointerMove);
    target.removeEventListener('pointerup', onPointerUp);
    target.removeEventListener('pointercancel', onPointerUp);
    target.removeEventListener('click', onClickCapture, true);
    target.removeEventListener('wheel', onWheel);
    target.removeEventListener('scroll', onScroll);
  };
}

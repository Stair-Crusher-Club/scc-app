/**
 * 웹 데스크톱에서 가로 카드 캐러셀을 마우스 드래그 / 휠로 스크롤할 수 있게 한다.
 * rn-web FlatList 는 네이티브 overflow 스크롤만 지원해 마우스 드래그가 안 되고,
 * 마우스 휠은 세로(deltaY)만 와서 가로 리스트가 안 움직인다. (네이티브 터치 동작 대체)
 *
 * @param root  카드 리스트 wrapper View 의 DOM 노드(rn-web 에서는 HTMLElement).
 * @returns     리스너 정리 함수.
 */
export default function attachDragToScroll(root: unknown): () => void {
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

  let isDown = false;
  let startX = 0;
  let startScroll = 0;
  let moved = false;

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    isDown = true;
    moved = false;
    startX = e.pageX;
    startScroll = target.scrollLeft;
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!isDown) return;
    const dx = e.pageX - startX;
    if (Math.abs(dx) > 3) moved = true;
    target.scrollLeft = startScroll - dx;
  };
  const onPointerUp = () => {
    isDown = false;
  };
  // 드래그 직후 발생하는 click 이 카드 onPress(상세 진입)로 새지 않게 막는다.
  const onClickCapture = (e: MouseEvent) => {
    if (moved) {
      e.stopPropagation();
      e.preventDefault();
      moved = false;
    }
  };
  // 마우스 휠(세로)을 가로 스크롤로 변환. 트랙패드 가로 스와이프(deltaX)는 그대로 둔다.
  const onWheel = (e: WheelEvent) => {
    if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
    target.scrollLeft += e.deltaY;
    e.preventDefault();
  };

  target.style.cursor = 'grab';
  target.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  target.addEventListener('click', onClickCapture, true);
  target.addEventListener('wheel', onWheel, {passive: false});

  return () => {
    target.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    target.removeEventListener('click', onClickCapture, true);
    target.removeEventListener('wheel', onWheel);
  };
}

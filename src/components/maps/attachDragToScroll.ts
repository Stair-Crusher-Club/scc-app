// Native stub. The horizontal card carousel already scrolls via touch on native;
// drag/wheel-to-scroll glue is only needed on web (see attachDragToScroll.web.ts).
export default function attachDragToScroll(_root: unknown): () => void {
  return () => {};
}

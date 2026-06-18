// Native stub. The horizontal card carousel already scrolls + snaps via touch on
// native; drag/wheel/snap glue is only needed on web (see attachDragToScroll.web.ts).
export default function attachDragToScroll(
  _root: unknown,
  _opts: {itemSize: number; onSettle: (index: number) => void},
): () => void {
  return () => {};
}

// Native stub. The horizontal card carousel already scrolls + snaps via touch on
// native; drag/wheel/snap + smooth scrollToIndex glue is only needed on web
// (see attachDragToScroll.web.ts). control.scrollToIndex is left unset so callers
// fall back to the native FlatList.scrollToIndex.
export default function attachDragToScroll(
  _root: unknown,
  _opts: {
    itemSize: number;
    onSettle: (index: number) => void;
    control?: {scrollToIndex?: (index: number) => void};
  },
): () => void {
  return () => {};
}

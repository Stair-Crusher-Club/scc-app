let pendingText: string | null = null;

export function getPendingSharedText(): string | null {
  return pendingText;
}

export function setPendingSharedText(text: string | null) {
  pendingText = text;
}

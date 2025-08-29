import {ChallengeQuestCompleteStampTypeDto} from '@/generated-sources/openapi';
import {atom} from 'jotai';

export type QueueItem = {
  challengeId: string;
  type: ChallengeQuestCompleteStampTypeDto;
  title: string;
};

export const queueAtom = atom<QueueItem[]>([]);
export const indexAtom = atom(0);

export const visibleAtom = atom(get => get(queueAtom).length > 0);
export const currentAtom = atom(get => {
  const q = get(queueAtom);
  const i = get(indexAtom);
  return q[i];
});
export const isLastAtom = atom(get => {
  const q = get(queueAtom);
  const i = get(indexAtom);
  return q.length > 0 && i === q.length - 1;
});

export const pushItemsAtom = atom(null, (get, set, items: QueueItem[]) => {
  if (!items?.length) return;
  set(queueAtom, prev => {
    const next = [...prev, ...items];
    // 새로 열릴 때 index가 범위를 벗어났다면 0으로
    const i = get(indexAtom);
    if (next.length > 0 && i >= next.length) set(indexAtom, 0);
    return next;
  });
});

export const nextOrCloseAtom = atom(null, (get, set) => {
  const q = get(queueAtom);
  const i = get(indexAtom);
  if (i < q.length - 1) set(indexAtom, i + 1);
  else {
    set(queueAtom, []);
    set(indexAtom, 0);
  }
});

export const closeAllAtom = atom(null, (_get, set) => {
  set(queueAtom, []);
  set(indexAtom, 0);
});

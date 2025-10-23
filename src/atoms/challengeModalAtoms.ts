import {storage} from './atomForLocal';

interface DismissedModalRecord {
  [challengeId: string]: string; // challengeId -> date string
}

const STORAGE_KEY = 'challenge_modal_dismissed';

export function isDismissedToday(challengeId: string): boolean {
  const today = new Date().toDateString();
  const dismissed = storage.getString(STORAGE_KEY);

  if (!dismissed) {
    return false;
  }

  try {
    const records: DismissedModalRecord = JSON.parse(dismissed);
    return records[challengeId] === today;
  } catch {
    return false;
  }
}

export function setDismissedToday(challengeId: string): void {
  const today = new Date().toDateString();
  const dismissed = storage.getString(STORAGE_KEY);

  let records: DismissedModalRecord = {};

  if (dismissed) {
    try {
      records = JSON.parse(dismissed);
    } catch {
      // Ignore parse errors and start fresh
    }
  }

  records[challengeId] = today;
  storage.set(STORAGE_KEY, JSON.stringify(records));
}

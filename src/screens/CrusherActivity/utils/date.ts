export function formatDateDot(epochMillis?: number | null): string {
  if (!epochMillis) {
    return '';
  }
  const d = new Date(epochMillis);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function formatDateKorean(epochMillis?: number | null): string {
  if (!epochMillis) {
    return '';
  }
  const d = new Date(epochMillis);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekDay = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return `${month}월 ${day}일(${weekDay})`;
}

export function formatDateRange(
  startEpochMillis: number,
  endEpochMillis: number,
): string {
  const startDate = new Date(startEpochMillis);
  const endDate = new Date(endEpochMillis);

  const isSameDay =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate();

  if (isSameDay) {
    return formatDateKorean(startEpochMillis);
  }

  return `${formatDateKorean(startEpochMillis)} ~ ${formatDateKorean(endEpochMillis)}`;
}

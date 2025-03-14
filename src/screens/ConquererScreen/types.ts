export enum WeekDay {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}
export interface ActivityReport {
  todayConqueredCount: number;
  thisMonthConqueredCount: number;
  thisWeekConqueredWeekdays: WeekDay[];
}

export const DUMMY_REPORT: ActivityReport = {
  todayConqueredCount: 2,
  thisMonthConqueredCount: 23,
  thisWeekConqueredWeekdays: [WeekDay.MONDAY, WeekDay.THURSDAY],
};

export type TStyle = 'level' | 'rank' | 'count';

export interface IInfo {
  style: TStyle;
  title: string;
  content: string;
  description?: string;
  icon?: string;
}

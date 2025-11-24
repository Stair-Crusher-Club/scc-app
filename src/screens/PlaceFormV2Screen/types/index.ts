export type FloorOptionKey =
  | 'firstFloor'
  | 'otherFloor'
  | 'multipleFloors'
  | 'standalone';

export type StandaloneBuildingType = 'singleFloor' | 'multipleFloors';

export type BuildingDoorDirectionType = 'inside' | 'outside';

export interface FloorOption {
  key: FloorOptionKey;
  label: string;
}

export interface StandaloneBuildingOption {
  key: StandaloneBuildingType;
  label: string;
}

export type Step = 'floor' | 'info' | 'floorMovement';

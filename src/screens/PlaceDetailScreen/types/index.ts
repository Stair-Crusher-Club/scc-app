import {
  ReportTargetTypeDto,
  UpvoteTargetTypeDto,
} from '@/generated-sources/openapi';

export type UpdateUpvoteStatusParams = {
  id: string;
  newUpvotedStatus: boolean;
  targetType: UpvoteTargetTypeDto;
};

export interface UserInteractionHandlers {
  showNegativeFeedbackBottomSheet?: (type: ReportTargetTypeDto) => void;
  updateUpvoteStatus?: ({
    id,
    newUpvotedStatus,
    targetType,
  }: UpdateUpvoteStatusParams) => Promise<boolean>;
}

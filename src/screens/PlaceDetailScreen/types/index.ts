import {ReportTargetTypeDto} from '@/generated-sources/openapi';

export interface UserInteractionHandlers {
  showNegativeFeedbackBottomSheet?: (type: ReportTargetTypeDto) => void;
}

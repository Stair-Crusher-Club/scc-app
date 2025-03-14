import styled from 'styled-components/native';

import {color} from '@/constant/color';

import {
  GOAL_IMG_SIZE,
  GOAL_PADDING_RIGHT,
  MILESTONE_IMG_SIZE,
  PROGRESS_BAR_PADDING_LEFT,
  PROGRESS_BAR_PADDING_RIGHT,
} from './Constant';
import ContributionMilestone from './ContributionMilestone';
import ContributionsBubble from './ContributionsBubble';
import CurrentStepImage from './CurrentStepImage';

export const Container = styled.View({
  paddingTop: 50,
  paddingBottom: 40,
});

export const StepContainer = styled.View({
  width: '100%',
  height: 127,
});

export const ProgressBarContainer = styled.View({
  position: 'absolute',
  width: '100%',
  paddingLeft: PROGRESS_BAR_PADDING_LEFT,
  paddingRight: PROGRESS_BAR_PADDING_RIGHT,
  bottom: 47,
});

export const CurrentStepImageWrapper = styled(CurrentStepImage)<{left: number}>`
  position: absolute;
  left: ${p => p.left}px;
  top: 36px;
  /* background-color: ${color.orange20}; */
`;

// prettier-ignore
export const ContributionsBubbleWrapper = styled(ContributionsBubble)<{left: number}>`
  position: absolute;
  left: ${p => p.left}px;
  top: 0;
`;

export const Milestone = styled.Image<{center: number}>`
  position: absolute;
  width: ${MILESTONE_IMG_SIZE.width}px;
  height: ${MILESTONE_IMG_SIZE.height}px;
  left: ${p => p.center - MILESTONE_IMG_SIZE.width / 2}px;
  bottom: 35px;
  /* background-color: ${color.orange20}; */
`;

export const Goal = styled.Image({
  position: 'absolute',
  width: GOAL_IMG_SIZE.width,
  height: GOAL_IMG_SIZE.height,
  right: GOAL_PADDING_RIGHT,
  bottom: 43,
});

export const MetricContainer = styled.View({
  width: '100%',
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingHorizontal: 25,
  marginTop: -26,
});

// prettier-ignore
export const FirstMilestoneSuccess = styled(ContributionMilestone)<{left: number}>`
  position: absolute;
  left: ${p => p.left}px;
`;

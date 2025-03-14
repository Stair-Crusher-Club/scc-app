import {isEmpty} from 'lodash';
import React, {useState} from 'react';
import {Dimensions} from 'react-native';

import * as S from './ChallengeDetailInProgressStatus.style';
import {
  CURRENT_STEP_START_POSITION,
  GOAL_IMG_SIZE,
  GOAL_PADDING_RIGHT,
  MILESTONE_IMG_SIZE,
  PROGRESS_BAR_PADDING_LEFT,
  PROGRESS_BAR_PADDING_RIGHT,
} from './Constant';
import ContributionMilestone from './ContributionMilestone';
import {getCurrentStepImageSize} from './CurrentStepImage';
import ProgressBar from './ProgressBar';

export interface ChallengeDetailInProgressStatusProps {
  numberOfContributions: number;
  milestones: number[];
  goal: number;
}

const ChallengeDetailInProgressStatus = ({
  numberOfContributions,
  milestones,
  goal,
}: ChallengeDetailInProgressStatusProps) => {
  const screenWidth = Dimensions.get('window').width;
  const centerOfProgressBar = Math.floor(
    PROGRESS_BAR_PADDING_LEFT +
      (screenWidth - PROGRESS_BAR_PADDING_LEFT - PROGRESS_BAR_PADDING_RIGHT) /
        2,
  );

  let step = 1;
  let isComplete = numberOfContributions >= goal;
  let shouldShowMilestone = true;
  let currentStepPositionX: number;
  // 콩알이가 갈 수 있는 시작 X 좌표 - 끝 X 좌표를 이용해서 진행 정도에 따라 X 좌표를 설정한다.
  const currentStepImageWidth = getCurrentStepImageSize(step).width;
  const halfOfStepImageWidth = currentStepImageWidth / 2;
  if (isComplete) {
    shouldShowMilestone = false;
    currentStepPositionX =
      screenWidth - PROGRESS_BAR_PADDING_RIGHT - halfOfStepImageWidth;
  } else if (!isEmpty(milestones)) {
    const firstMilestone = milestones[0];
    if (firstMilestone <= numberOfContributions) {
      step = 2;
      shouldShowMilestone = false;
      const startX = centerOfProgressBar - halfOfStepImageWidth;
      const endX =
        screenWidth -
        GOAL_IMG_SIZE.width -
        GOAL_PADDING_RIGHT -
        currentStepImageWidth;
      currentStepPositionX =
        centerOfProgressBar -
        halfOfStepImageWidth +
        (endX - startX) *
          ((numberOfContributions - firstMilestone) / (goal - firstMilestone));
    } else {
      const startX = CURRENT_STEP_START_POSITION;
      const endX =
        centerOfProgressBar -
        MILESTONE_IMG_SIZE.width / 2 -
        currentStepImageWidth;
      currentStepPositionX =
        startX + (endX - startX) * (numberOfContributions / firstMilestone);
    }
  } else {
    shouldShowMilestone = false;
    const startX = CURRENT_STEP_START_POSITION;
    const endX =
      screenWidth -
      GOAL_IMG_SIZE.width -
      GOAL_PADDING_RIGHT -
      currentStepImageWidth;
    currentStepPositionX =
      startX + (endX - startX) * (numberOfContributions / goal);
  }
  currentStepPositionX = Math.min(
    currentStepPositionX,
    screenWidth - PROGRESS_BAR_PADDING_RIGHT - halfOfStepImageWidth,
  );
  const [contributionsBubblePositionX, setContributionsBubblePositionX] =
    useState(0);
  const [firstMilestoneTextWidth, setFirstMilestoneTextWidth] = useState(0);
  return (
    <S.Container>
      <S.StepContainer>
        <S.ProgressBarContainer>
          <ProgressBar
            progressPx={
              // progressbar 가 이미지 중앙에 위치하기 위해
              currentStepPositionX +
              getCurrentStepImageSize(step).width / 2 -
              PROGRESS_BAR_PADDING_LEFT // left padding
            }
          />
        </S.ProgressBarContainer>
        <S.ContributionsBubbleWrapper
          left={contributionsBubblePositionX}
          numberOfContributions={numberOfContributions}
          isComplete={isComplete}
          onSizeChanged={size => {
            const currentStepCenterX =
              currentStepPositionX + getCurrentStepImageSize(step).width / 2;
            setContributionsBubblePositionX(
              currentStepCenterX - size.width / 2,
            );
          }}
        />
        <S.CurrentStepImageWrapper left={currentStepPositionX} step={step} />
        {shouldShowMilestone && (
          <S.Milestone
            source={require('../../../../assets/img/img_challenge_pre_step2.png')}
            center={centerOfProgressBar}
          />
        )}
        {!isComplete && (
          <S.Goal
            source={require('../../../../assets/img/img_challenge_destination.png')}
          />
        )}
      </S.StepContainer>
      <S.MetricContainer>
        <ContributionMilestone
          numberOfContributions={0}
          step={0}
          isComplete={false}
        />
        {shouldShowMilestone && !isEmpty(milestones) && (
          <S.FirstMilestoneSuccess
            left={centerOfProgressBar - firstMilestoneTextWidth / 2}
            numberOfContributions={milestones[0]}
            step={1}
            isComplete={milestones[0] <= numberOfContributions}
            onSizeChanged={size => {
              setFirstMilestoneTextWidth(size.width);
            }}
          />
        )}
        <ContributionMilestone
          numberOfContributions={goal}
          step={0}
          isComplete={false}
        />
      </S.MetricContainer>
    </S.Container>
  );
};

export default ChallengeDetailInProgressStatus;

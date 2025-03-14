import React from 'react';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms/SccButton';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ListChallengesItemDto} from '@/generated-sources/openapi';
import BottomSheet from '@/modals/BottomSheet';
import {ChallengeDateFormat} from '@/utils/ChallengeDateFormat';

interface PropsType {
  selectedUpcomingChallenge?: ListChallengesItemDto;
  onPressConfirmButton: () => void;
}

const ChallengeUpcomingBottomSheet = ({
  selectedUpcomingChallenge,
  onPressConfirmButton,
}: PropsType) => {
  return (
    <BottomSheet isVisible={selectedUpcomingChallenge !== undefined}>
      <Title>이 챌린지는 추후 오픈 예정이예요</Title>
      {selectedUpcomingChallenge?.startsAt && (
        <Message>{`${ChallengeDateFormat.formatUpcomingBottomSheet(
          selectedUpcomingChallenge?.startsAt,
        )} 부터 참여할 수 있어요. 계단을 정복하고 멤버들과 함께 목표를 달성해보세요!`}</Message>
      )}
      <ButtonContainer>
        <ConfirmButton
          text={'확인'}
          textColor="white"
          buttonColor="brandColor"
          fontFamily={font.pretendardBold}
          onPress={() => {
            onPressConfirmButton();
          }}
        />
      </ButtonContainer>
    </BottomSheet>
  );
};

export default ChallengeUpcomingBottomSheet;

export const Title = styled.Text({
  color: color.black,
  fontSize: 20,
  fontFamily: font.pretendardBold,
  marginTop: 28,
  marginHorizontal: 24,
});

export const Message = styled.Text({
  color: color.black,
  fontSize: 16,
  fontFamily: font.pretendardRegular,
  marginTop: 10,
  marginHorizontal: 24,
});

export const ButtonContainer = styled.View({
  flexDirection: 'row',
  gap: 10,
  paddingVertical: 20,
  paddingHorizontal: 20,
});

export const ConfirmButton = styled(SccButton)`
  flex: 1;
`;

import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {useUpdateMarketingPushAgreement} from '@/utils/marketingPushAgreement';

import BottomSheet from './BottomSheet';
import BottomSheetButtonGroup, {
  BottomSheetButtonGroupLayout,
} from './BottomSheet/BottomSheetButtonGroup';

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

// 배경 탭으로는 닫히지 않는다(onPressBackground 미지정). 어느 버튼이든 응답해야 닫힌다.
// 실패해도 닫는다 — 다음 홈 진입 때 서버가 needs=true 를 다시 준다.
const MarketingPushAgreementBottomSheet = ({isVisible, onClose}: Props) => {
  const updateAgreement = useUpdateMarketingPushAgreement();

  const respond = async (isAgreed: boolean) => {
    await updateAgreement(isAgreed);
    onClose();
  };

  return (
    <BottomSheet isVisible={isVisible}>
      <ContentsContainer>
        <Title>혜택·소식 알림을 받아보시겠어요?</Title>
        <Message>
          계단뿌셔클럽의 이벤트, 챌린지 소식 같은 마케팅 정보를 푸시 알림으로
          보내드려요. 메뉴 &gt; 설정에서 언제든 바꿀 수 있어요.
        </Message>
      </ContentsContainer>
      <BottomSheetButtonGroup
        layout={BottomSheetButtonGroupLayout.HORIZONTAL_1X2}
        positiveButton={{text: '알림 받기', onPressed: () => respond(true)}}
        negativeButton={{text: '괜찮아요', onPressed: () => respond(false)}}
      />
    </BottomSheet>
  );
};

export default MarketingPushAgreementBottomSheet;

const ContentsContainer = styled.View({
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  paddingTop: 28,
  paddingHorizontal: 20,
});

const Title = styled.Text({
  width: '100%',
  color: color.black,
  fontSize: 20,
  fontFamily: font.pretendardBold,
  marginTop: 10,
  marginBottom: 10,
});

const Message = styled.Text({
  width: '100%',
  color: color.black,
  fontSize: 16,
  fontFamily: font.pretendardRegular,
});

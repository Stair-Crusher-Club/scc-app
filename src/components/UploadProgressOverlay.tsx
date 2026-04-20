import {Modal} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export interface UploadProgressOverlayProps {
  visible: boolean;
  stage: 'compressing' | 'uploading' | 'registering';
  currentIndex: number;
  totalImages: number;
  progress: number; // 0-1
  imageSizeMb: number;
  label?: string; // e.g. '입구 사진', '엘리베이터 사진'
}

export function UploadProgressOverlay({
  visible,
  stage,
  currentIndex,
  totalImages,
  progress,
  imageSizeMb,
  label,
}: UploadProgressOverlayProps) {
  const photoLabel = label ?? '사진';
  const isRegistering = stage === 'registering';
  const titleText = isRegistering
    ? '정보 등록 중...'
    : `${photoLabel} 업로드 중 (${currentIndex + 1}/${totalImages})`;

  const progressPercent = Math.round(progress * 100);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}>
      <Overlay>
        <Card>
          <TitleText>{titleText}</TitleText>
          <SizeText>
            {isRegistering
              ? ' '
              : stage === 'compressing'
                ? '압축 중'
                : `${imageSizeMb.toFixed(2)} MB`}
          </SizeText>
          <ProgressBarContainer>
            <ProgressBarFill style={{width: `${progressPercent}%`}} />
          </ProgressBarContainer>
          <PercentText>
            {isRegistering ? ' ' : `${progressPercent}%`}
          </PercentText>
        </Card>
      </Overlay>
    </Modal>
  );
}

const Overlay = styled.View`
  flex: 1;
  background-color: ${color.blacka50};
  align-items: center;
  justify-content: center;
`;

const Card = styled.View`
  background-color: ${color.white};
  border-radius: 16px;
  padding: 24px;
  align-items: center;
  min-width: 260px;
`;

const TitleText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 16px;
  line-height: 24px;
  color: ${color.gray80};
  margin-bottom: 8px;
`;

const SizeText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 13px;
  line-height: 18px;
  color: ${color.gray50};
  margin-bottom: 12px;
`;

const ProgressBarContainer = styled.View`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background-color: #e5e5e5;
  overflow: hidden;
`;

const ProgressBarFill = styled.View`
  height: 6px;
  border-radius: 3px;
  background-color: ${color.lightOrange};
`;

const PercentText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 13px;
  line-height: 18px;
  color: ${color.gray50};
  margin-top: 8px;
`;

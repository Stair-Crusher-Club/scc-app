import {SccButton} from '@/components/atoms';
import {Modal} from 'react-native';
import styled from 'styled-components/native';

interface GuideModalProps {
  visible: boolean;
  onDismissPermanently: () => void;
  onConfirm: () => void;
  onRequestClose: () => void;
}

export default function GuideModal({
  visible,
  onDismissPermanently,
  onConfirm,
  onRequestClose,
}: GuideModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onRequestClose}>
      <GuideModalContainer>
        <SccButton
          elementName=""
          text="다시보지 않기"
          onPress={onDismissPermanently}
        />
        <SccButton elementName="" text="확인했어요!" onPress={onConfirm} />
      </GuideModalContainer>
    </Modal>
  );
}

const GuideModalContainer = styled.View`
  flex: 1;
  padding: 20px;
`;

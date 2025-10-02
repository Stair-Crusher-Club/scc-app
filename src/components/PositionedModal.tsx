import React, {useState, useRef} from 'react';
import {Modal, View, LayoutRectangle} from 'react-native';

import {SccTouchableWithoutFeedback} from '@/components/SccTouchableWithoutFeedback';
import styled from 'styled-components/native';

import {color} from '@/constant/color';

interface PositionedModalProps {
  children: React.ReactNode;
  modalContent: React.ReactNode;
  visible?: boolean;
  onClose?: () => void;
}

const PositionedModal = ({
  children,
  modalContent,
  visible,
  onClose,
}: PositionedModalProps) => {
  const [showModal, setShowModal] = useState(false);
  const [childPosition, setChildPosition] = useState<LayoutRectangle | null>(
    null,
  );
  const childRef = useRef<View>(null);

  const measureChildPosition = () => {
    childRef.current?.measureInWindow((x, y, width, height) => {
      setChildPosition({x, y, width, height});
      setShowModal(true);
    });
  };

  const handleClose = () => {
    setShowModal(false);
    onClose?.();
  };

  return (
    <>
      <SccTouchableWithoutFeedback
        elementName="positioned_modal_trigger"
        onPress={measureChildPosition}>
        <View ref={childRef}>{children}</View>
      </SccTouchableWithoutFeedback>

      <Modal
        visible={visible ?? showModal}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={handleClose}>
        <SccTouchableWithoutFeedback
          elementName="positioned_modal_overlay"
          onPress={handleClose}>
          <ModalOverlay>
            {childPosition && (
              <ModalArea>
                <ModalTail
                  style={{
                    top: childPosition.y + childPosition.height + 5 + 5,
                    left: childPosition.x + childPosition.width / 2 - 5,
                  }}
                />
                <ModalContent
                  style={{
                    top: childPosition.y + childPosition.height + 5,
                  }}>
                  {modalContent}
                </ModalContent>
              </ModalArea>
            )}
          </ModalOverlay>
        </SccTouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalArea = styled.View`
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  elevation: 3;
`;

const ModalContent = styled.View`
  background-color: ${color.brandColor};
  padding: 12px;
  margin-left: 32px;
  margin-right: 32px;
  border-radius: 8px;
`;

const ModalTail = styled.View`
  background-color: ${color.brandColor};
  width: 10px;
  height: 10px;
  transform: rotate(45deg);
`;

export default PositionedModal;

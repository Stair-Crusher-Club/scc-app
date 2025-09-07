import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import DangerousIcon from '@/assets/icon/ic_dangerous.svg';
import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import BottomSheet from '@/modals/BottomSheet';

interface Props {
  isVisible: boolean;
  confirmText: string;
  onPressCancelButton: () => void;
  onPressConfirmButton: () => void;
}

const DeleteBottomSheet = ({
  isVisible,
  confirmText,
  onPressCancelButton,
  onPressConfirmButton,
}: Props) => {
  return (
    <BottomSheet isVisible={isVisible}>
      <View style={styles.dangerous}>
        <DangerousIcon />
      </View>
      <View style={styles.warningMessageContainer}>
        <Text style={styles.warningMessage}>{confirmText}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <SccButton
          text="취소"
          textColor="black"
          buttonColor="gray10"
          fontFamily={font.pretendardMedium}
          style={styles.button}
          onPress={onPressCancelButton}
          elementName="delete_modal_cancel"
        />
        <View style={styles.spaceBetweenButtons} />
        <SccButton
          text="삭제"
          textColor="white"
          buttonColor="red"
          fontFamily={font.pretendardBold}
          style={styles.button}
          onPress={onPressConfirmButton}
          elementName="delete_modal_confirm"
        />
      </View>
    </BottomSheet>
  );
};

export default DeleteBottomSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column-reverse',
    backgroundColor: color.blacka50,
  },
  contentsContainer: {
    flexDirection: 'column',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    backgroundColor: color.white,
  },
  dangerous: {
    marginTop: 44,
    alignItems: 'center',
  },
  warningMessageContainer: {},
  warningMessage: {
    color: color.black,
    fontSize: 20,
    fontFamily: font.pretendardBold,
    lineHeight: 32,
    marginTop: 28,
    paddingHorizontal: 24,
    letterSpacing: -0.5,
  },
  optionSelector: {
    paddingHorizontal: 24,
  },
  spaceBetweenOptions: {
    height: 10,
  },
  buttonContainer: {
    height: 96,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  spaceBetweenButtons: {
    width: 10,
  },
  button: {
    flex: 1,
  },
});

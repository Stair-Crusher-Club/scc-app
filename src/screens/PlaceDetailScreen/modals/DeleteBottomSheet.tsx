import React from 'react';
import {Modal, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import DangerousIcon from '@/assets/icon/ic_dangerous.svg';
import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

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
  const safeAreaInsets = useSafeAreaInsets(); // TODO: Modal 안에서 SafeAreaView 가 동작하지 않아서 넣은 값.

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade">
      <View style={styles.container}>
        <View
          style={[
            styles.contentsContainer,
            {paddingBottom: safeAreaInsets.bottom},
          ]}>
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
            />
            <View style={styles.spaceBetweenButtons} />
            <SccButton
              text="삭제"
              textColor="white"
              buttonColor="red"
              fontFamily={font.pretendardBold}
              style={styles.button}
              onPress={onPressConfirmButton}
            />
          </View>
        </View>
      </View>
    </Modal>
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
    marginTop: 24,
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

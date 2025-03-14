import React, {useCallback, useState} from 'react';
import {Modal, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface PlaceDetailNegativeFeedbackBottomSheetProps {
  isVisible: boolean;
  placeId: string;
  onPressCloseButton: () => void;
  onPressSubmitButton: (placeId: string, reason: string) => void;
}

const PlaceDetailNegativeFeedbackBottomSheet = ({
  isVisible,
  placeId,
  onPressCloseButton,
  onPressSubmitButton,
}: PlaceDetailNegativeFeedbackBottomSheetProps) => {
  const safeAreaInsets = useSafeAreaInsets(); // TODO: Modal 안에서 SafeAreaView 가 동작하지 않아서 넣은 값.
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const options = [
    '틀린 정보가 있어요',
    '폐점된 곳이에요',
    '이 정복자를 차단할래요',
  ];

  const onClear = useCallback(() => {
    setSelectedOption(null);
  }, []);

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade">
      <SafeAreaView style={styles.container}>
        <View
          style={[
            styles.contentsContainer,
            {paddingBottom: safeAreaInsets.bottom},
          ]}>
          <Text style={styles.title}>어떤 문제가 있나요?</Text>
          <View style={styles.optionSelector}>
            {options.map((option, index) => {
              const isSelected = option === selectedOption;
              return (
                <View key={option}>
                  {index > 0 && <View style={styles.spaceBetweenOptions} />}
                  <SccButton
                    key={option}
                    text={option}
                    textColor={isSelected ? 'brandColor' : 'gray70'}
                    buttonColor="white"
                    borderColor={isSelected ? 'blue50' : 'gray30'}
                    onPress={() => {
                      setSelectedOption(option);
                    }}
                  />
                </View>
              );
            })}
          </View>
          <View style={styles.buttonContainer}>
            <SccButton
              style={styles.closeButton}
              text="닫기"
              textColor="gray90"
              buttonColor="white"
              onPress={() => {
                onClear();
                onPressCloseButton();
              }}
            />
            <View style={styles.spaceBetweenButtons} />
            <SccButton
              style={styles.submitButton}
              text="제출하기"
              textColor="white"
              buttonColor="brandColor"
              fontFamily={font.pretendardBold}
              isDisabled={selectedOption === null}
              onPress={() => {
                onClear();
                if (selectedOption) {
                  onPressSubmitButton(placeId, selectedOption);
                }
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default PlaceDetailNegativeFeedbackBottomSheet;

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
    backgroundColor: color.white,
  },
  title: {
    color: color.black,
    fontSize: 20,
    fontFamily: font.pretendardBold,
    marginTop: 28,
    marginBottom: 30,
    paddingHorizontal: 24,
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
  closeButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});

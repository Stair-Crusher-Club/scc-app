import React from 'react';
import {useEffect} from 'react';
import {useState} from 'react';
import {View, StyleSheet} from 'react-native';

import {Color} from '@/constant/color';

import {SccButton} from '../atoms';

interface SccButtonGroupProps {
  buttonTextList: string[];
  selectedButtonColor?: Color;
  selectedBorderColor?: Color;
  selectedTextColor?: Color;
  defaultButtonColor?: Color;
  defaultBorderColor?: Color;
  defaultTextColor?: Color;
  setValue: any;
}

export const SccButtonGroup = ({
  buttonTextList,
  selectedButtonColor,
  selectedBorderColor,
  selectedTextColor,
  defaultButtonColor,
  defaultBorderColor,
  defaultTextColor,
  setValue,
}: SccButtonGroupProps) => {
  const [selectedButtonText, setSelectedButtonText] = useState(
    buttonTextList[0],
  );
  const isLastItem = (index: number) => index !== buttonTextList.length - 1;
  const getButtonColor = (text: string) => {
    if (text === selectedButtonText) {
      return selectedButtonColor;
    }
    return defaultButtonColor;
  };
  const getBorderColor = (text: string) => {
    if (text === selectedButtonText) {
      return selectedBorderColor;
    }
    return defaultBorderColor;
  };
  const getTextColor = (text: string) => {
    if (text === selectedButtonText) {
      return selectedTextColor;
    }
    return defaultTextColor;
  };

  const onPress = (text: string) => {
    setSelectedButtonText(text);
    setValue(text);
  };
  useEffect(() => {
    setValue(selectedButtonText);
  }, []);
  return (
    <View style={styles.wrapper}>
      {buttonTextList &&
        buttonTextList.map((text, i) => (
          <SccButton
            style={isLastItem(i) ? styles.test : {}}
            buttonColor={getButtonColor(text)}
            borderColor={getBorderColor(text)}
            textColor={getTextColor(text)}
            key={i}
            text={text}
            onPress={() => onPress(text)}
          />
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  test: {
    marginRight: 12,
  },
});

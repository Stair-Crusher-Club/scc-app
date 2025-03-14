import React from 'react';
import {Text, TextStyle} from 'react-native';

interface StyledTextProps {
  text: string;
  style?: TextStyle;
  boldStyle?: TextStyle;
}

const StyledText: React.FC<StyledTextProps> = ({text, style, boldStyle}) => {
  const parseText = (input: string) => {
    const parts: {text: string; isBold: boolean}[] = [];
    let currentText = '';
    let isBold = false;
    let i = 0;

    while (i < input.length) {
      if (input.startsWith('<b>', i)) {
        if (currentText) {
          parts.push({text: currentText, isBold});
          currentText = '';
        }
        isBold = true;
        i += 3; // Skip '<b>'
      } else if (input.startsWith('</b>', i)) {
        if (currentText) {
          parts.push({text: currentText, isBold});
          currentText = '';
        }
        isBold = false;
        i += 4; // Skip '</b>'
      } else {
        currentText += input[i];
        i++;
      }
    }

    if (currentText) {
      parts.push({text: currentText, isBold});
    }

    return parts;
  };

  const textParts = parseText(text);

  return (
    <Text style={style}>
      {textParts.map((part, index) => (
        <Text key={index} style={part.isBold ? boldStyle : undefined}>
          {part.text}
        </Text>
      ))}
    </Text>
  );
};

export default StyledText;

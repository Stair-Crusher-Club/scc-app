import {ReactNode} from 'react';
import {Text, View} from 'react-native';

interface FormQuestionProps {
  label?: string; // Optional section label
  question: ReactNode; // Question text (can be string or JSX)
  children: ReactNode; // Form controls (Controller, etc.)
}

export default function FormQuestion({
  label,
  question,
  children,
}: FormQuestionProps) {
  return (
    <View className="gap-[20px]">
      <View className="gap-[8px]">
        {label && (
          <Text className="font-pretendard-bold text-brand-50 text-[14px] leading-[20px]">
            {label}
          </Text>
        )}
        <Text className="font-pretendard-semibold text-gray-80 text-[20px] leading-[28px]">
          {question}
        </Text>
      </View>
      {children}
    </View>
  );
}

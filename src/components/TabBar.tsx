import {Text, View} from 'react-native';
import SccTouchableOpacity from './SccTouchableOpacity';

type TabItem<T> = {
  value: T;
  label: string;
};

export default function TabBar<T>({
  items,
  current,
  onChange,
}: {
  items: TabItem<T>[];
  current: T;
  onChange: (value: T) => void;
}) {
  return (
    <View className="flex-row justify-center items-center">
      {items.map(({value, label}) => {
        const isActive = current === value;
        return (
          <SccTouchableOpacity
            elementName={`${value}_tab_button`}
            key={String(value)}
            onPress={() => onChange(value)}
            className={`flex-1 justify-center items-center p-[12px] ${
              isActive
                ? 'border-b-[2px] border-b-brand-50'
                : 'border-b-[1px] border-b-gray-20'
            }`}>
            <Text
              className={`font-pretendard-medium ${
                isActive ? 'text-gray-80' : 'text-gray-40'
              }`}
              style={{fontSize: 16}}>
              {label}
            </Text>
          </SccTouchableOpacity>
        );
      })}
    </View>
  );
}

import {font} from '@/constant/font';
import {Text, View} from 'react-native';

export default function HistoryView() {
  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 78,
      }}>
      <Text
        style={{
          textAlign: 'center',
          lineHeight: 24,
          fontSize: 16,
          fontFamily: font.pretendardRegular,
        }}>{`크러셔 활동 히스토리를\n확인 할 수 있어요`}</Text>
    </View>
  );
}

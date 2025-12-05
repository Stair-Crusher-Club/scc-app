import {Image, ImageSourcePropType, View} from 'react-native';

interface MeasureGuideProps {
  source: ImageSourcePropType;
}

export default function MeasureGuide({source}: MeasureGuideProps) {
  return (
    <View
      className="rounded-[8px] overflow-hidden border border-gray-20"
      style={{aspectRatio: 315 / 152}}>
      <Image source={source} className="w-full h-full" />
    </View>
  );
}

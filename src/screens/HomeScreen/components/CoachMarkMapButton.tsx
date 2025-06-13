import {LayoutRectangle, Text, View} from 'react-native';

import CoachMapIconArrow from '@/assets/icon/coach_map_icon_arrow.svg';
import {color} from '@/constant/color';

import * as S from './CoachMark.style';

export default function CoachMarkMapButton({
  x,
  y,
  width,
}: Omit<LayoutRectangle, 'height'>) {
  return (
    <>
      <CoachMapIconArrow
        style={{
          position: 'absolute',
          top: y - 24,
          left: x + width + 6,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: y - 24,
          left: x + width + 44,
        }}>
        <View>
          <S.Description>아이콘을 누르면</S.Description>
          <S.Description>
            <Text style={{color: color.yellow}}>지도 화면</Text>
            으로 바로 이동할 수 있어요.
          </S.Description>
        </View>
      </View>
    </>
  );
}

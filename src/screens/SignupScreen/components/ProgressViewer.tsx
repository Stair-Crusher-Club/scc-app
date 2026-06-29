import React, {useEffect, useRef, useState} from 'react';
import {Animated, LayoutChangeEvent, View} from 'react-native';

import GoalIcon from '@/assets/icon/ic_signup_goal.svg';
import MoveIcon from '@/assets/icon/ic_signup_move.svg';

// Figma measurements:
//   - Track bar: height 6px, centered vertically within the component
//   - GoalIcon (flag): w=29px h=35px, fixed at right end; its center aligns with track center
//   - MoveIcon (Willy): ~48px square, rides along fill; its center aligns with fill right edge
const GOAL_ICON_WIDTH = 29;
const GOAL_ICON_HEIGHT = 35;
const MOVE_ICON_SIZE = 35;
const TRACK_HEIGHT = 6;

// Container must be tall enough to show MoveIcon above the track.
// MoveIcon is centered on track → extends (48-6)/2 = 21px above and below track.
// Add a few px of breathing room.
const CONTAINER_HEIGHT = 60;
// Track sits at this y from container top (so icon has room above)
const TRACK_TOP = CONTAINER_HEIGHT / 2 - TRACK_HEIGHT / 2; // ~27

export default function ProgressViewer({progress}: {progress: number}) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [animatedValue, progress]);

  // 100%일 때 캐릭터는 깃발(우측 고정) 바로 왼쪽에 "도달"한 모습이어야 한다.
  // 깃발 중심이 trackWidth에 있으므로, 채움/캐릭터를 깃발 폭만큼 앞에서 멈춰야
  // 캐릭터가 깃발을 덮거나 화면 밖으로 잘리지 않고 깃발이 그 오른쪽에 또렷이 보인다.
  const fillMax = trackWidth;

  // MoveIcon x position: follows the fill right edge, offset by half icon width
  const moveIconX = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [-MOVE_ICON_SIZE, fillMax - MOVE_ICON_SIZE - 3], // -3은 미세 조정
  });

  // Fill width as absolute pixels (not %)
  const fillWidth = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [0, fillMax],
  });

  const onTrackLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const goalIconTop = TRACK_TOP - (GOAL_ICON_HEIGHT - TRACK_HEIGHT) + 2; // +2는 미세 조정
  const moveIconTop = TRACK_TOP - (MOVE_ICON_SIZE - TRACK_HEIGHT) + 3; // +3은 미세 조정

  return (
    <View style={{height: CONTAINER_HEIGHT, position: 'relative'}}>
      {/* Background Track */}
      <View
        onLayout={onTrackLayout}
        style={{
          position: 'absolute',
          height: TRACK_HEIGHT,
          left: 0,
          right: GOAL_ICON_WIDTH / 2,
          top: TRACK_TOP,
          backgroundColor: '#E3E4E8',
          borderRadius: 5,
        }}
      />

      {/* Progress Fill — sibling of track, same position/size */}
      <Animated.View
        style={{
          position: 'absolute',
          height: TRACK_HEIGHT,
          left: 0,
          top: TRACK_TOP,
          width: fillWidth,
          backgroundColor: '#0C76F7',
          borderRadius: 7,
        }}
      />

      {/* GoalIcon (Flag) — fixed at right end */}
      <View
        style={{
          position: 'absolute',
          right: 0,
          top: goalIconTop,
        }}>
        <GoalIcon width={GOAL_ICON_WIDTH} height={GOAL_ICON_HEIGHT} />
      </View>

      {/* MoveIcon (Willy) — sibling, follows fill right edge. 깃발보다 더 앞에 렌더링되어야 하므로 깃발 뒤에 컴포넌트를 선언해준다. */}
      {trackWidth > 0 && (
        <Animated.View
          style={{
            position: 'absolute',
            top: moveIconTop,
            left: moveIconX,
            width: MOVE_ICON_SIZE,
            height: MOVE_ICON_SIZE,
          }}>
          <MoveIcon width={MOVE_ICON_SIZE} height={MOVE_ICON_SIZE} />
        </Animated.View>
      )}
    </View>
  );
}

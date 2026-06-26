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
const MOVE_ICON_SIZE = 48;
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

  // MoveIcon x position: follows the fill right edge, offset by half icon width
  const moveIconX = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [-(MOVE_ICON_SIZE / 2), trackWidth - MOVE_ICON_SIZE / 2],
  });

  // Fill width as absolute pixels (not %)
  const fillWidth = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [0, trackWidth],
  });

  const onTrackLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const goalIconTop = TRACK_TOP - (GOAL_ICON_HEIGHT - TRACK_HEIGHT) / 2;
  const moveIconTop = TRACK_TOP - (MOVE_ICON_SIZE - TRACK_HEIGHT) / 2;

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

      {/* MoveIcon (Willy) — sibling, follows fill right edge */}
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

      {/* GoalIcon (Flag) — fixed at right end */}
      <View
        style={{
          position: 'absolute',
          right: 0,
          top: goalIconTop,
        }}>
        <GoalIcon width={GOAL_ICON_WIDTH} height={GOAL_ICON_HEIGHT} />
      </View>
    </View>
  );
}

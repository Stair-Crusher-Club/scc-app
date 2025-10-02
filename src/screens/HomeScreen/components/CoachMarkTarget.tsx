import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {InteractionManager, StatusBar, View, ViewStyle} from 'react-native';

import {
  CoachMark,
  useCoachMark,
} from '@/screens/HomeScreen/contexts/CoachMarkContext';

const COACH_MARK_MEASURE_DELAY_MS = 20;

interface CoachMarkTargetProps extends CoachMark {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function CoachMarkTarget({
  id,
  children,
  style,
  rx,
  ry,
  renderItem,
}: CoachMarkTargetProps) {
  const [layoutReady, setLayoutReady] = useState(false);
  const ref = useRef<View>(null);
  const {register} = useCoachMark();
  const topInset = StatusBar.currentHeight || 0;
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!layoutReady || !isFocused) {
      return;
    }

    let timeoutId: NodeJS.Timeout | undefined;
    const task = InteractionManager?.runAfterInteractions(() => {
      timeoutId = setTimeout(() => {
        requestAnimationFrame(() => {
          if (!ref.current?.measure) {
            return;
          }

          ref.current?.measure((_x, _y, width, height, pageX, pageY) => {
            if (![pageX, pageY, width, height].every(Number.isFinite)) {
              return null;
            }

            const renderWithLayout = () => {
              return renderItem?.({x: pageX, y: pageY + topInset, width});
            };

            register({
              id,
              rx,
              ry,
              x: pageX,
              y: pageY + topInset,
              width,
              height,
              renderItem: renderWithLayout,
            });
          });
        });
      }, COACH_MARK_MEASURE_DELAY_MS);
    });

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      task.cancel();
    };
  }, [layoutReady, isFocused]);

  return (
    <View
      ref={ref}
      style={style}
      collapsable={false}
      onLayout={() => {
        requestAnimationFrame(() => setLayoutReady(true));
      }}>
      {children}
    </View>
  );
}

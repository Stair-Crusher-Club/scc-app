import {useEffect, useRef, useState} from 'react';
import {InteractionManager, StatusBar, View, ViewStyle} from 'react-native';

import {
  CoachMark,
  useCoachMark,
} from '@/screens/HomeScreen/contexts/CoachMarkContext';

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

  useEffect(() => {
    if (!layoutReady) {
      return;
    }

    const task = InteractionManager?.runAfterInteractions(() => {
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
    });

    return () => task.cancel();
  }, [layoutReady]);

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

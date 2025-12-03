import {useIsFocused} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import {useAtom, useAtomValue} from 'jotai';
import React, {useEffect, useState} from 'react';
import {Dimensions, Modal} from 'react-native';
import Svg, {Mask, Rect} from 'react-native-svg';

import {
  hasShownCoachMarkForFirstVisitAtom,
  hasShownGuideForFirstVisitAtom,
} from '@/atoms/User';
import useAppComponents from '@/hooks/useAppComponents';
import {useCoachMark} from '@/screens/HomeScreen/contexts/CoachMarkContext';

const {width, height} = Dimensions.get('window');

const COACH_MARK_DELAY_MS = 200;

export default function CoachMarkOverlay({
  padding = 12,
  visible: _visible,
}: {
  padding?: number;
  visible: boolean;
}) {
  const {api} = useAppComponents();
  const {items} = useCoachMark();
  const [visible, setVisible] = useState(false);
  const isFocused = useIsFocused();
  const {data} = useQuery({
    queryKey: ['BannerSection', 'HomeBanners'],
    queryFn: async () => (await api.getHomeBanners()).data,
    staleTime: 1000 * 60 * 10,
  });

  const hasShownGuideForFirstVisit = useAtomValue(
    hasShownGuideForFirstVisitAtom,
  );
  const [hasShownCoachMarkForFirstVisit, setHasShownCoachMarkForFirstVisit] =
    useAtom(hasShownCoachMarkForFirstVisitAtom);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    if (
      _visible &&
      isFocused &&
      hasShownGuideForFirstVisit &&
      !hasShownCoachMarkForFirstVisit &&
      data?.banners.length
    ) {
      timeoutId = setTimeout(() => {
        setVisible(true);
      }, COACH_MARK_DELAY_MS);
      return;
    }

    if (visible) {
      setVisible(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [
    _visible,
    isFocused,
    hasShownGuideForFirstVisit,
    hasShownCoachMarkForFirstVisit,
    data?.banners.length,
  ]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent={true}>
      <Svg
        onPress={() => {
          setHasShownCoachMarkForFirstVisit(true);
        }}
        width={width}
        height={height}
        className="absolute">
        <Mask id="coach-mark-target-mask">
          <Rect width={width} height={height} fill="white" />
          {items.map(rect => (
            <Rect
              key={rect.id}
              x={rect.x - padding}
              y={rect.y - padding}
              width={rect.width + padding * 2}
              height={rect.height + padding * 2}
              rx={rect.rx ?? 9}
              ry={rect.ry ?? 9}
              fill="black"
            />
          ))}
        </Mask>

        <Rect
          width={width}
          height={height}
          fill="rgba(0,0,0,0.7)"
          mask="url(#coach-mark-target-mask)"
        />
      </Svg>

      {items.map(({id, renderItem, x, y, width: hWidth}, index) => (
        <React.Fragment key={`coach-description-${id}-${index}`}>
          {renderItem?.({
            x,
            y,
            width: hWidth,
          })}
        </React.Fragment>
      ))}
    </Modal>
  );
}

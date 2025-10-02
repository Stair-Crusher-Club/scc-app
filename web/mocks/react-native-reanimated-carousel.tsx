import React, { useState, useEffect } from 'react';

interface CarouselProps {
  data: any[];
  width?: number;
  renderItem: ({ item, index }: { item: any; index: number }) => React.ReactElement;
  onScrollEnd?: (index: number) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  loop?: boolean;
  onConfigurePanGesture?: (gestureChain: any) => void;
}

// 웹용 간단한 Carousel 컴포넌트 - setInterval로 이미지 자동 전환
const Carousel: React.FC<CarouselProps> = ({
  data,
  renderItem,
  onScrollEnd,
  autoPlay = false,
  autoPlayInterval = 5000,
  loop = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (autoPlay && data.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prevIndex => {
          const nextIndex = loop
            ? (prevIndex + 1) % data.length
            : prevIndex + 1 >= data.length ? 0 : prevIndex + 1;

          if (onScrollEnd) {
            onScrollEnd(nextIndex);
          }

          return nextIndex;
        });
      }, autoPlayInterval);

      return () => clearInterval(interval);
    }
  }, [autoPlay, data.length, autoPlayInterval, loop, onScrollEnd]);

  if (!data || data.length === 0) {
    return null;
  }

  // 현재 인덱스의 데이터에 대한 renderItem 결과 반환
  return renderItem({ item: data[currentIndex], index: currentIndex });
};

export default Carousel;
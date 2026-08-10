import React, {
  forwardRef,
  Ref,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import {Dimensions, FlatList, LayoutChangeEvent, View} from 'react-native';
import styled from 'styled-components/native';

import attachDragToScroll from '@/components/maps/attachDragToScroll';

const {width} = Dimensions.get('window');
const ITEM_RATIO = 0.9;
const ITEM_SIZE = Math.round(width * ITEM_RATIO);
const ITEM_SIDE_PADDING = (width - ITEM_SIZE) / 2;
// 스크롤 이벤트가 이만큼 끊기면 멈춘 것으로 본다.
const SCROLL_IDLE_MS = 110;

type Props<T> = {
  searchResults: T[];
  onFocusedItemChange: (item: T | null) => void;
  /** 스크롤이 움직이기 시작/멈춤. 카드 위 오버레이가 스크롤을 따라 즉시 숨을 수 있게 알린다. */
  onScrollStateChange?: (isScrolling: boolean) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  onCardPress?: (item: T) => void;
  ItemCard: React.FC<{item: T; onPress?: () => void}>;
  initialScrollIndex?: number;
};

function ItemMapList<T extends {id: string}>(
  {
    searchResults,
    onFocusedItemChange,
    onScrollStateChange,
    onLayout,
    onCardPress,
    ItemCard,
    initialScrollIndex,
  }: Props<T>,
  ref: Ref<FlatList<T>>,
) {
  const wrapperRef = useRef<View>(null);
  const listRef = useRef<FlatList<T>>(null);
  // 스크롤 이벤트가 SCROLL_IDLE_MS 동안 없으면 멈춘 것으로 본다. onMomentumScrollEnd 만으로는
  // 웹(react-native-web)과 드래그 후 관성 없이 멈추는 경우를 못 잡는다.
  const scrollIdleTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const lastScrollOffsetRef = useRef(0);
  const isScrollingRef = useRef(false);
  // 최신 콜백/결과를 참조하되 핸들러 정체성은 유지한다.
  const onScrollStateChangeRef = useRef(onScrollStateChange);
  onScrollStateChangeRef.current = onScrollStateChange;
  const onFocusedItemChangeRef = useRef(onFocusedItemChange);
  onFocusedItemChangeRef.current = onFocusedItemChange;
  const searchResultsRef = useRef(searchResults);
  searchResultsRef.current = searchResults;

  const setIsScrolling = (isScrolling: boolean) => {
    if (isScrollingRef.current === isScrolling) return;
    isScrollingRef.current = isScrolling;
    onScrollStateChangeRef.current?.(isScrolling);
  };

  /**
   * 멈춤 처리. **포커스 확정과 isScrolling=false를 항상 같이** 내보낸다.
   * 둘을 따로 내보내면 관성 없이 끝난 드래그에서 "이전 카드의 오버레이가 새 카드 위에
   * 다시 뜨는" 상태가 생긴다.
   */
  const settle = (offsetX: number) => {
    clearTimeout(scrollIdleTimerRef.current);
    const index = Math.floor((offsetX + ITEM_SIZE / 2) / ITEM_SIZE);
    const clamped = Math.min(
      Math.max(index, 0),
      Math.max(searchResultsRef.current.length - 1, 0),
    );
    onFocusedItemChangeRef.current(searchResultsRef.current[clamped] ?? null);
    setIsScrolling(false);
  };

  const handleScroll = (offsetX: number) => {
    lastScrollOffsetRef.current = offsetX;
    setIsScrolling(true);
    clearTimeout(scrollIdleTimerRef.current);
    scrollIdleTimerRef.current = setTimeout(
      () => settle(lastScrollOffsetRef.current),
      SCROLL_IDLE_MS,
    );
  };

  useEffect(
    () => () => {
      clearTimeout(scrollIdleTimerRef.current);
      // 스크롤 도중 언마운트되면 부모의 isScrolling이 true로 굳는다.
      if (isScrollingRef.current) {
        isScrollingRef.current = false;
        onScrollStateChangeRef.current?.(false);
      }
    },
    [],
  );
  // 웹 스냅 시 최신 결과/콜백을 참조하도록 ref 로 감싼다 (effect 는 1회만 attach).
  const onSettleRef = useRef<(index: number) => void>(() => {});
  onSettleRef.current = (index: number) =>
    onFocusedItemChange(searchResults[index] ?? null);
  // 웹에서 핀 클릭 시 부드러운 스크롤을 위해 attachDragToScroll 이 채워주는 핸들.
  const controlRef = useRef<{scrollToIndex?: (index: number) => void}>({});
  useEffect(
    () =>
      attachDragToScroll(wrapperRef.current, {
        itemSize: ITEM_SIZE,
        onSettle: index => onSettleRef.current(index),
        control: controlRef.current,
      }),
    [],
  );
  // 외부(ItemMapView)에서 cardsRef.scrollToIndex 호출 시: 웹은 부드러운 스크롤,
  // 그 외엔 네이티브 FlatList 동작.
  useImperativeHandle(
    ref,
    () =>
      ({
        scrollToIndex: (params: {index: number; animated?: boolean}) => {
          if (controlRef.current.scrollToIndex) {
            controlRef.current.scrollToIndex(params.index);
          } else {
            listRef.current?.scrollToIndex(params);
          }
        },
      }) as unknown as FlatList<T>,
    [],
  );
  return (
    <View
      ref={wrapperRef}
      style={{
        width: '100%',
        height: searchResults.length > 0 ? 242 + 28 : 0,
      }}>
      <FlatList
        ref={listRef}
        data={searchResults}
        contentContainerStyle={{
          paddingHorizontal: ITEM_SIDE_PADDING,
        }}
        renderItem={({item}) => (
          <Item item={item} onPress={onCardPress} ItemCard={ItemCard} />
        )}
        keyExtractor={item => item.id}
        getItemLayout={(_, index) => ({
          length: ITEM_SIZE,
          offset: index * ITEM_SIZE,
          index,
        })}
        initialScrollIndex={initialScrollIndex}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={ITEM_SIZE}
        decelerationRate="fast"
        onLayout={onLayout}
        scrollEventThrottle={16}
        onScroll={({nativeEvent}) => handleScroll(nativeEvent.contentOffset.x)}
        onMomentumScrollEnd={({nativeEvent}) =>
          settle(nativeEvent.contentOffset.x)
        }
      />
    </View>
  );
}

function Item<T extends {id: string}>({
  item,
  onPress,
  ItemCard,
}: {
  item: T;
  onPress?: (item: T) => void;
  ItemCard: React.FC<{item: T; onPress?: () => void}>;
}) {
  return (
    <ItemWrapper key={item.id}>
      <ItemCard item={item} onPress={() => onPress?.(item)} />
    </ItemWrapper>
  );
}

// Higher Order Function 의 타이핑이 제대로 먹지 않아 강제로 캐스팅 해준다.
const TypedForwardRef = forwardRef(ItemMapList) as <T extends {id: string}>(
  props: Props<T> & {ref?: Ref<FlatList<T>>},
) => React.ReactElement;

export default TypedForwardRef;

const ItemWrapper = styled.View`
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  elevation: 3;
  /* 카드 하단을 캐러셀 밴드 바닥에 고정 → 썸네일 없는 짧은 카드는 위쪽이 열려
     지도 아래가 비지 않는다 (flex-start면 위에 붙어 아래가 텅 빔). */
  align-self: flex-end;
  background-color: white;
  overflow: visible;
  width: ${() => ITEM_SIZE - 10}px;
  margin-left: 5px;
  margin-right: 5px;
  padding: 14px;
  border-radius: 12px;
`;

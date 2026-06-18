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

type Props<T> = {
  searchResults: T[];
  onFocusedItemChange: (item: T | null) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  onCardPress?: (item: T) => void;
  ItemCard: React.FC<{item: T; onPress?: () => void}>;
  initialScrollIndex?: number;
};

function ItemMapList<T extends {id: string}>(
  {
    searchResults,
    onFocusedItemChange,
    onLayout,
    onCardPress,
    ItemCard,
    initialScrollIndex,
  }: Props<T>,
  ref: Ref<FlatList<T>>,
) {
  const wrapperRef = useRef<View>(null);
  const listRef = useRef<FlatList<T>>(null);
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
        onMomentumScrollEnd={({nativeEvent}) => {
          const index = Math.floor(
            (nativeEvent.contentOffset.x + ITEM_SIZE / 2) / ITEM_SIZE,
          );
          onFocusedItemChange(searchResults[index] || null);
        }}
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
  align-self: flex-start;
  background-color: white;
  overflow: visible;
  width: ${() => ITEM_SIZE - 10}px;
  margin-left: 5px;
  margin-right: 5px;
  padding: 14px;
  border-radius: 12px;
`;

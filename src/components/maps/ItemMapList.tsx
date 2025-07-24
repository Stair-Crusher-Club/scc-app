import React, {forwardRef, Ref} from 'react';
import {Dimensions, FlatList, LayoutChangeEvent, View} from 'react-native';
import styled from 'styled-components/native';

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
};

function ItemMapList<T extends {id: string}>(
  {
    searchResults,
    onFocusedItemChange,
    onLayout,
    onCardPress,
    ItemCard,
  }: Props<T>,
  ref: Ref<FlatList<T>>,
) {
  return (
    <View
      style={{
        width: '100%',
        height: searchResults.length > 0 ? 242 + 28 : 0,
      }}>
      <FlatList
        ref={ref}
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

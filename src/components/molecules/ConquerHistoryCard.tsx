import {FlashList} from '@shopify/flash-list';
import * as React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface IHistoryData {
  name: string;
  count: number;
}

export const ConquerHistoryCard = ({data}: {data: IHistoryData[]}) => {
  const numColumns = 3;
  const [containerWidth, setContainerWidth] = React.useState(0);

  return (
    <View style={historyCardStyles.wrapper}>
      <FlashList
        data={data}
        numColumns={3}
        horizontal={false}
        onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}
        renderItem={({item, index}) => (
          <Item
            index={index}
            lastIndex={data.length}
            name={item.name}
            count={item.count}
            width={(containerWidth - 80) / numColumns}
            numColumns={numColumns}
          />
        )}
        estimatedItemSize={100}
        estimatedListSize={{width: 100, height: 100}}
        keyExtractor={item => item.name}
      />
    </View>
  );
};

const Item = ({
  name,
  count,
  width,
  index,
  lastIndex,
  numColumns,
}: {
  name: string;
  count: number;
  width: number;
  index: number;
  lastIndex: number;
  numColumns: number;
}) => {
  const isLastRow =
    Math.floor(lastIndex / numColumns) === Math.floor(index / numColumns);
  const isLastItem = index === lastIndex - 1 || index % numColumns === 2;
  const marginBottom = isLastRow ? 0 : 20;
  const borderRightColor = color.gray30;
  const borderRightWidth = isLastItem ? 0 : 2;
  const marginLeft = 20;
  return (
    <View
      style={{
        width,
        marginBottom,
        borderRightColor,
        borderRightWidth,
        marginLeft,
      }}>
      <Text style={historyCardStyles.name}>{name}</Text>
      <Text style={historyCardStyles.count}>{count}개</Text>
    </View>
  );
};

const historyCardStyles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingVertical: 28,
    paddingHorizontal: 8,
    backgroundColor: color.gray20,
    borderRadius: 20,
  },
  name: {
    color: color.gray80,
    fontSize: 16,
    marginBottom: 6,
  },
  count: {
    color: color.orange,
    fontSize: 20,
    fontFamily: font.pretendardBold,
  },
});

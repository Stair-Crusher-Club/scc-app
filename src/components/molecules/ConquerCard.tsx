import * as React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import RightAngleBracketIcon from '@/assets/icon/ic_angle_bracket_right.svg';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {IInfo} from '@/models/IInfo';

export const ConquerCard = ({info}: {info: IInfo}) => {
  return (
    <View style={[cardStyle.wrapper, cardStyle[info.style]]}>
      <Text style={[cardStyle.title, cardStyle[`${info.style}Title`]]}>
        {info.title}
      </Text>
      <Text style={[cardStyle.content, cardStyle[`${info.style}Content`]]}>
        {info.content}
      </Text>
      {info.description && (
        <Text
          style={[
            cardStyle.description,
            cardStyle[`${info.style}Description`],
          ]}>
          {info.description}
        </Text>
      )}
      {info.icon ? (
        <Text style={cardStyle.icon}>{info.icon}</Text>
      ) : (
        <View style={cardStyle.showAllWrapper}>
          <Text style={cardStyle.showAllButton}>모두 보기</Text>
          <RightAngleBracketIcon />
        </View>
      )}
    </View>
  );
};

const cardStyle: any = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    height: 180,
    marginBottom: 24,
    paddingLeft: 32,
    paddingRight: 24,
    paddingTop: 28,
    overflow: 'hidden',
  },
  showAllWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 24,
    bottom: 22,
  },
  showAllButton: {
    color: color.white,
    marginRight: 8,
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 6,
  },
  content: {
    fontSize: 24,
    fontFamily: font.pretendardBold,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontFamily: font.pretendardBold,
  },
  icon: {
    fontSize: 120,
    color: color.black,
    position: 'absolute',
    right: 24,
    bottom: -14,
  },

  level: {
    backgroundColor: color.gray20,
  },
  levelTitle: {
    color: color.gray80,
  },
  levelContent: {
    color: color.gray90,
  },
  levelDescription: {
    color: color.gray90,
  },

  rank: {
    backgroundColor: color.blue50,
  },
  rankTitle: {
    color: color.white,
  },
  rankContent: {
    color: color.white,
  },

  count: {
    backgroundColor: color.orange,
  },
  countTitle: {
    color: color.white,
  },
  countContent: {
    color: color.white,
  },
});

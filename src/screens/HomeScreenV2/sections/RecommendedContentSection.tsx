import React from 'react';
import {FlatList, Linking, View} from 'react-native';
import styled from 'styled-components/native';

import Skeleton from '@/components/Skeleton';
import {SccPressable} from '@/components/SccPressable';
import SccRemoteImage from '@/components/SccRemoteImage';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {HomeRecommendedContentDto} from '@/generated-sources/openapi';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import useNavigation from '@/navigation/useNavigation';
import {isAppDeepLink} from '@/utils/deepLinkUtils';

const CARD_WIDTH = 130;
const CARD_HEIGHT = 160;
const CARD_GAP = 12;
const IMAGE_SIZE = Math.round(CARD_WIDTH * 0.55); // ~72px, scales with card
const CARD_BORDER_RADIUS = 12;
const CARD_BG_COLOR = '#f2f5fa';

const CardSeparator = () => <View style={{width: CARD_GAP}} />;

interface RecommendedContentSectionProps {
  contents: HomeRecommendedContentDto[];
  isLoading: boolean;
}

export default function RecommendedContentSection({
  contents,
  isLoading,
}: RecommendedContentSectionProps) {
  if (contents.length === 0) {
    if (isLoading) {
      return (
        <Container>
          <SectionTitle>이런 키워드는 어때요?</SectionTitle>
          <SkeletonRow>
            <Skeleton
              style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                borderRadius: CARD_BORDER_RADIUS,
              }}
            />
            <Skeleton
              style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                borderRadius: CARD_BORDER_RADIUS,
              }}
            />
            <Skeleton
              style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                borderRadius: CARD_BORDER_RADIUS,
              }}
            />
          </SkeletonRow>
        </Container>
      );
    }
    return null;
  }

  return (
    <LogParamsProvider
      params={{displaySectionName: 'recommended_content_section'}}>
      <Container>
        <SectionTitle>이런 키워드는 어때요?</SectionTitle>
        <FlatList
          data={contents}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 20}}
          ItemSeparatorComponent={CardSeparator}
          renderItem={({item, index}) => (
            <ContentCard content={item} index={index} />
          )}
          keyExtractor={item => item.id}
        />
      </Container>
    </LogParamsProvider>
  );
}

interface ContentCardProps {
  content: HomeRecommendedContentDto;
  index: number;
}

function ContentCard({content, index}: ContentCardProps) {
  const navigation = useNavigation();

  const openContent = async () => {
    const url = content.linkUrl;

    if (isAppDeepLink(url)) {
      await Linking.openURL(url);
    } else {
      navigation.navigate('Webview', {
        fixedTitle: content.title,
        url: url,
      });
    }
  };

  return (
    <SccPressable
      elementName="home_v2_recommended_content"
      logParams={{content_id: content.id, index}}
      onPress={openContent}>
      <CardContainer>
        <TextContainer>
          <ContentTitle numberOfLines={1}>{content.title}</ContentTitle>
          <ContentDescription numberOfLines={2}>
            {content.description}
          </ContentDescription>
        </TextContainer>
        <ImageContainer>
          <SccRemoteImage
            imageUrl={content.imageUrl}
            style={{
              width: IMAGE_SIZE,
              height: IMAGE_SIZE,
              borderRadius: 0,
              backgroundColor: CARD_BG_COLOR,
            }}
          />
        </ImageContainer>
      </CardContainer>
    </SccPressable>
  );
}

const Container = styled.View`
  padding: 20px 0;
  gap: 16px;
`;

const SectionTitle = styled.Text`
  color: #16181c;
  font-size: 20px;
  font-family: ${font.pretendardSemibold};
  line-height: 28px;
  letter-spacing: -0.4px;
  margin-horizontal: 20px;
`;

const CardContainer = styled.View`
  width: ${CARD_WIDTH}px;
  height: ${CARD_HEIGHT}px;
  border-radius: ${CARD_BORDER_RADIUS}px;
  background-color: ${CARD_BG_COLOR};
  padding: 14px;
  position: relative;
`;

const TextContainer = styled.View`
  gap: 6px;
`;

const ContentTitle = styled.Text`
  color: #121a27;
  font-size: 16px;
  font-family: ${font.pretendardBold};
  line-height: 24px;
  letter-spacing: -0.32px;
`;

const ContentDescription = styled.Text`
  color: ${color.gray50v2};
  font-size: 12px;
  line-height: 16px;
  font-family: ${font.pretendardRegular};
  letter-spacing: -0.24px;
`;

const ImageContainer = styled.View`
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: ${IMAGE_SIZE}px;
  height: ${IMAGE_SIZE}px;
  overflow: hidden;
`;

const SkeletonRow = styled.View`
  flex-direction: row;
  gap: 12px;
  padding-horizontal: 20px;
`;

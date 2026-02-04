import React from 'react';
import {FlatList, Linking, View} from 'react-native';
import styled from 'styled-components/native';

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
const IMAGE_HEIGHT = 90;

const CardSeparator = () => <View style={{width: CARD_GAP}} />;

interface RecommendedContentSectionProps {
  contents: HomeRecommendedContentDto[];
}

export default function RecommendedContentSection({
  contents,
}: RecommendedContentSectionProps) {
  if (contents.length === 0) {
    return null;
  }

  return (
    <LogParamsProvider
      params={{displaySectionName: 'recommended_content_section'}}>
      <Container>
        <SectionTitle>이런 정보는 어때요?</SectionTitle>
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
        <ImageContainer>
          <SccRemoteImage
            imageUrl={content.imageUrl}
            style={{
              width: CARD_WIDTH,
              height: IMAGE_HEIGHT,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            }}
          />
        </ImageContainer>
        <TextContainer>
          <ContentTitle numberOfLines={1}>{content.title}</ContentTitle>
          <ContentDescription numberOfLines={2}>
            {content.description}
          </ContentDescription>
        </TextContainer>
      </CardContainer>
    </SccPressable>
  );
}

const Container = styled.View`
  margin-bottom: 24px;
`;

const SectionTitle = styled.Text`
  color: ${color.gray90};
  font-size: 18px;
  font-family: ${font.pretendardBold};
  margin-horizontal: 20px;
  margin-bottom: 16px;
`;

const CardContainer = styled.View`
  width: ${CARD_WIDTH}px;
  height: ${CARD_HEIGHT}px;
  border-radius: 10px;
  background-color: ${color.white};
  border-width: 1px;
  border-color: ${color.gray20};
  overflow: hidden;
`;

const ImageContainer = styled.View`
  width: ${CARD_WIDTH}px;
  height: ${IMAGE_HEIGHT}px;
  overflow: hidden;
`;

const TextContainer = styled.View`
  padding: 10px;
  flex: 1;
`;

const ContentTitle = styled.Text`
  color: ${color.gray90};
  font-size: 13px;
  font-family: ${font.pretendardBold};
  margin-bottom: 2px;
`;

const ContentDescription = styled.Text`
  color: ${color.gray60};
  font-size: 11px;
  line-height: 14px;
  font-family: ${font.pretendardRegular};
`;

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
const IMAGE_SIZE = 72;

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
              backgroundColor: color.white,
            }}
          />
        </ImageContainer>
      </CardContainer>
    </SccPressable>
  );
}

const Container = styled.View`
  padding-top: 40px;
  padding-bottom: 30px;
`;

const SectionTitle = styled.Text`
  color: ${color.gray90};
  font-size: 20px;
  font-family: ${font.pretendardSemibold};
  line-height: 28px;
  letter-spacing: -0.4px;
  margin-horizontal: 20px;
  margin-bottom: 20px;
`;

const CardContainer = styled.View`
  width: ${CARD_WIDTH}px;
  height: ${CARD_HEIGHT}px;
  border-radius: 12px;
  background-color: ${color.white};
  padding: 14px;
  position: relative;
`;

const TextContainer = styled.View`
  gap: 2px;
`;

const ContentTitle = styled.Text`
  color: #121a27;
  font-size: 16px;
  font-family: ${font.pretendardBold};
  line-height: 24px;
  letter-spacing: -0.32px;
`;

const ContentDescription = styled.Text`
  color: ${color.gray50};
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

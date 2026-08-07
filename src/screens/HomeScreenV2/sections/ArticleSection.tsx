import React from 'react';
import {FlatList, View} from 'react-native';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import SccRemoteImage from '@/components/SccRemoteImage';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import useNavigation from '@/navigation/useNavigation';
import {
  Article,
  ARTICLE_AUTHOR,
  ARTICLES_LIST_URL,
  getLatestArticles,
} from '@/utils/articles';

const SECTION_TITLE = '이런 장소 어때요?';
const ARTICLE_COUNT = 3;
const CARD_WIDTH = 260;
const CARD_GAP = 12;
const IMAGE_HEIGHT = (CARD_WIDTH * 9) / 16; // 16:9
const IMAGE_BORDER_RADIUS = 8;
const IMAGE_PLACEHOLDER_COLOR = '#d9d9d9';

const CardSeparator = () => <View style={{width: CARD_GAP}} />;

// 번들된 web-articles/manifest.json에서 읽는다 — 서버 호출이 없으니 로딩/스켈레톤 상태도 없다.
// 대신 발행분이 prod 앱에 반영되려면 prod OTA(v* 태그)가 필요하다.
export default function ArticleSection() {
  const navigation = useNavigation();
  const articles = getLatestArticles(ARTICLE_COUNT);

  if (articles.length === 0) {
    return null;
  }

  return (
    <LogParamsProvider params={{displaySectionName: 'article_section'}}>
      <Container>
        <Header>
          <SectionTitle>{SECTION_TITLE}</SectionTitle>
          <SccPressable
            elementName="home_v2_article_more"
            onPress={() =>
              navigation.navigate('Webview', {
                url: ARTICLES_LIST_URL,
                // 웹 목록의 OG title('아티클 | 계단뿌셔클럽')이 아니라 섹션 제목을 그대로 쓴다 —
                // 눌러서 들어간 섹션과 헤더가 같아야 어디로 왔는지가 이어진다.
                fixedTitle: SECTION_TITLE,
                confirmOnClose: false,
              })
            }>
            <MoreLabel>더보기</MoreLabel>
          </SccPressable>
        </Header>
        <FlatList
          data={articles}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 20}}
          ItemSeparatorComponent={CardSeparator}
          renderItem={({item, index}) => (
            <ArticleCard article={item} index={index} />
          )}
          keyExtractor={item => item.slug}
        />
      </Container>
    </LogParamsProvider>
  );
}

function ArticleCard({article, index}: {article: Article; index: number}) {
  const navigation = useNavigation();

  return (
    <SccPressable
      elementName="home_v2_article_card"
      logParams={{slug: article.slug, index}}
      onPress={() =>
        navigation.navigate('Webview', {
          url: article.url,
          fixedTitle: article.title,
          // 읽기 전용 콘텐츠라 "정말 페이지를 나가시겠어요?" 확인이 불필요하다.
          confirmOnClose: false,
        })
      }>
      <CardContainer>
        {/* radius는 컨테이너가 clip한다 — SccRemoteImage 래퍼엔 overflow:hidden이 없다 */}
        <ImageContainer>
          <SccRemoteImage
            imageUrl={article.imageUrl}
            fixedHeight={IMAGE_HEIGHT}
            style={{width: CARD_WIDTH, height: IMAGE_HEIGHT}}
            wrapperBackgroundColor={IMAGE_PLACEHOLDER_COLOR}
          />
        </ImageContainer>
        <ArticleTitle numberOfLines={2}>{article.title}</ArticleTitle>
        <MetaRow>
          <MetaText>{ARTICLE_AUTHOR}</MetaText>
          <MetaDot />
          <MetaText>{article.dateLabel}</MetaText>
        </MetaRow>
      </CardContainer>
    </SccPressable>
  );
}

const Container = styled.View`
  padding: 20px 0 30px;
  gap: 16px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-horizontal: 20px;
`;

const SectionTitle = styled.Text`
  color: ${color.gray90v2};
  font-size: 20px;
  font-family: ${font.pretendardSemibold};
  line-height: 28px;
  letter-spacing: -0.4px;
`;

const MoreLabel = styled.Text`
  color: ${color.gray60v2};
  font-size: 15px;
  font-family: ${font.pretendardMedium};
  line-height: 22px;
  letter-spacing: -0.3px;
`;

const CardContainer = styled.View`
  width: ${CARD_WIDTH}px;
  gap: 6px;
`;

const ImageContainer = styled.View`
  width: ${CARD_WIDTH}px;
  height: ${IMAGE_HEIGHT}px;
  border-radius: ${IMAGE_BORDER_RADIUS}px;
  overflow: hidden;
  background-color: ${IMAGE_PLACEHOLDER_COLOR};
`;

const ArticleTitle = styled.Text`
  color: #121a27;
  font-size: 18px;
  font-family: ${font.pretendardSemibold};
  line-height: 26px;
  letter-spacing: -0.36px;
`;

const MetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

const MetaText = styled.Text`
  color: ${color.gray60v2};
  font-size: 13px;
  font-family: ${font.pretendardRegular};
  line-height: 18px;
  letter-spacing: -0.26px;
`;

const MetaDot = styled.View`
  width: 2px;
  height: 2px;
  border-radius: 1px;
  background-color: ${color.gray60v2};
`;

import {useMemo} from 'react';
import {Image, ScrollView, View} from 'react-native';
import styled from 'styled-components/native';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import useNavigation from '@/navigation/useNavigation';

export default function SearchExplore() {
  const navigation = useNavigation();

  const exploreList = useMemo(
    () => [
      {
        label: '계단뿌셔클럽 이용 가이드',
        title: `방문할 장소의\n접근성이 궁금할 땐?`,
        imageUrl: require('@/assets/img/img_search_banner_guide_search.png'),
        visibleMoreButton: true,
        onPress: () => {
          navigation.navigate('Webview', {
            fixedTitle: '정보 등록/조회 가이드',
            url: 'https://admin.staircrusher.club/public/guide?tab=search',
            headerVariant: 'navigation',
          });
        },
      },
      {
        label: '계단뿌셔클럽 이용 가이드',
        title: `계단정보 등록하는\n방법이 궁금할 땐?`,
        imageUrl: require('@/assets/img/img_search_banner_guide_register.png'),
        visibleMoreButton: true,
        onPress: () => {
          navigation.navigate('Webview', {
            fixedTitle: '정보 등록/조회 가이드',
            url: 'https://admin.staircrusher.club/public/guide?tab=register',
            headerVariant: 'navigation',
          });
        },
      },
      {
        label: '이동약자 찐 리뷰, 뿌클로드',
        title: `이동약자들이\n다녀온 장소가 궁금할 땐?`,
        imageUrl: require('@/assets/img/img_search_banner_scc_road.png'),
        onPress: () => {
          navigation.navigate('Webview', {
            fixedTitle: '뿌클로드: 이동약자를 위한 진짜 리뷰',
            url: 'https://www.staircrusher.club/crusher_road',
          });
        },
      },
    ],
    [],
  );

  return (
    <Container>
      <TitleText>계단뿌셔클럽 둘러보기</TitleText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{overflow: 'visible'}}
        contentContainerStyle={{
          flexDirection: 'row',
          gap: 8,
          flexWrap: 'nowrap',
        }}>
        {exploreList.map(
          ({label, title, imageUrl, visibleMoreButton, onPress}) => (
            <PressableItemBox
              elementName="search_explore_item"
              logParams={{label, title}}
              key={title}
              onPress={onPress}>
              <ItemDescriptionWrapper>
                <View style={{gap: 4}}>
                  <ItemLabelText>{label}</ItemLabelText>
                  <ItemTitleText>{title}</ItemTitleText>
                </View>
              </ItemDescriptionWrapper>
              {visibleMoreButton && (
                <MoreButton
                  elementName="search_explore_more_button"
                  disableLogging>
                  <MoreText>자세히보기</MoreText>
                </MoreButton>
              )}
              <Image
                source={imageUrl}
                style={{
                  width: 273,
                  height: 160,
                }}
              />
            </PressableItemBox>
          ),
        )}
      </ScrollView>
    </Container>
  );
}

const Container = styled.View({
  backgroundColor: color.gray20,
  paddingVertical: 20,
  paddingHorizontal: 16,
  gap: 12,
});

const TitleText = styled.Text({
  fontSize: 14,
  fontFamily: font.pretendardBold,
  color: color.black,
});

const PressableItemBox = styled(SccTouchableOpacity)({
  backgroundColor: color.white,
  borderRadius: 8,
  position: 'relative',
});

const ItemDescriptionWrapper = styled.View({
  gap: 44,
  position: 'absolute',
  top: 14,
  left: 14,
});

const ItemLabelText = styled.Text({
  color: color.gray90,
  fontSize: 11,
  fontFamily: font.pretendardRegular,
});

const ItemTitleText = styled.Text({
  color: color.black,
  fontSize: 17,
  fontFamily: font.pretendardBold,
});

const MoreButton = styled(SccTouchableOpacity)({
  borderWidth: 1,
  borderColor: color.black,
  borderRadius: 100,
  position: 'absolute',
  left: 14,
  bottom: 14,
});

const MoreText = styled.Text({
  paddingVertical: 4,
  paddingHorizontal: 10,
  fontSize: 12,
  color: color.black,
  fontFamily: font.pretendardMedium,
});

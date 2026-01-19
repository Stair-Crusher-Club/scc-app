import React from 'react';
import { View, Text, Linking } from 'react-native';
import styled from 'styled-components/native';

import { color } from '@/constant/color';
import { SccPressable } from '@/components/SccPressable';
import SccRemoteImage from '@/components/SccRemoteImage';
import { useResponsive } from '../../BbucleRoadScreen/context/ResponsiveContext';

const COVER_IMAGE_URL =
  'https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20260119_BBUCLE_ROAD_LIST_COVER_V3.png';
const APP_DOWNLOAD_URL = 'https://link.staircrusher.club/gexs2i';

export default function ListHeader() {
  const { isDesktop } = useResponsive();

  const handleAppDownload = () => {
    Linking.openURL(APP_DOWNLOAD_URL);
  };

  return (
    <Container>
      <SccRemoteImage
        imageUrl={COVER_IMAGE_URL}
        resizeMode="cover"
        wrapperBackgroundColor={null}
      />

      <ContentWrapper isDesktop={isDesktop}>
        <Title isDesktop={isDesktop}>뿌클로드</Title>
        <Description isDesktop={isDesktop}>
          이동약자에게 꼭 필요한 정보를 담은 컨텐츠를 전합니다.
        </Description>

        <SccPressable
          elementName="app-download-button"
          logParams={{ location: 'list-header' }}
          onPress={handleAppDownload}>
          <DownloadButton isDesktop={isDesktop}>
            <DownloadButtonText>앱 다운로드</DownloadButtonText>
          </DownloadButton>
        </SccPressable>
      </ContentWrapper>
    </Container>
  );
}

const Container = styled(View)`
  width: 100%;
`;

const ContentWrapper = styled(View)<{ isDesktop: boolean }>`
  width: 100%;
  max-width: ${({ isDesktop }) => (isDesktop ? '800px' : '100%')};
  align-self: center;
  padding: ${({ isDesktop }) => (isDesktop ? '32px 0' : '24px 16px')};
  align-items: ${({ isDesktop }) => (isDesktop ? 'center' : 'flex-start')};
`;

const Title = styled(Text)<{ isDesktop: boolean }>`
  font-size: ${({ isDesktop }) => (isDesktop ? '28px' : '22px')};
  font-weight: 700;
  color: ${color.gray80};
  margin-bottom: 8px;
`;

const Description = styled(Text)<{ isDesktop: boolean }>`
  font-size: ${({ isDesktop }) => (isDesktop ? '16px' : '14px')};
  color: ${color.gray60};
  margin-bottom: 20px;
  line-height: ${({ isDesktop }) => (isDesktop ? '24px' : '20px')};
`;

const DownloadButton = styled(View)<{ isDesktop: boolean }>`
  background-color: ${color.brand30};
  padding: ${({ isDesktop }) => (isDesktop ? '12px 24px' : '10px 20px')};
  border-radius: 8px;
`;

const DownloadButtonText = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  color: ${color.white};
`;

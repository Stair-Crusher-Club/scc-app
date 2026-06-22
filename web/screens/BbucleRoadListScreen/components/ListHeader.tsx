import React from 'react';
import {View, Text} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import LogoBbucleRoad from '@/assets/icon/logo_bbucle_road.svg';

import {useResponsive} from '../../BbucleRoadScreen/context/ResponsiveContext';
import LoginButton from '../../../components/LoginButton';

export default function ListHeader() {
  const {isDesktop} = useResponsive();

  return (
    <Container>
      <AppBar>
        <AppBarInner isDesktop={isDesktop}>
          <Side />
          <LogoBbucleRoad width={94} height={43} />
          <Side align="flex-end">
            <LoginButton location="list-header" />
          </Side>
        </AppBarInner>
      </AppBar>

      <DescriptionWrapper isDesktop={isDesktop}>
        <Description>
          공연장, 경기장, 핫플까지 휠체어로 가는 법!<br />뿌클로드에서 동선, 시야, 접근성을 한 번에 확인해보세요🙌
        </Description>
      </DescriptionWrapper>
    </Container>
  );
}

const Container = styled(View)`
  width: 100%;
`;

const AppBar = styled(View)`
  width: 100%;
  background-color: #b8ff55;
`;

const AppBarInner = styled(View)<{isDesktop: boolean}>`
  flex-direction: row;
  align-items: center;
  height: 60px;
  width: 100%;
  max-width: ${({isDesktop}) => (isDesktop ? '800px' : '100%')};
  align-self: center;
  padding: 0 20px;
`;

const Side = styled(View)<{align?: string}>`
  flex: 1;
  align-items: ${({align}) => align ?? 'flex-start'};
`;

const DescriptionWrapper = styled(View)<{isDesktop: boolean}>`
  width: 100%;
  max-width: ${({isDesktop}) => (isDesktop ? '800px' : '100%')};
  align-self: center;
  padding: ${({isDesktop}) => (isDesktop ? '24px 0 20px' : '24px 20px 0px 20px')};
`;

const Description = styled(Text)`
  font-family: Pretendard;
  font-size: 18px;
  font-weight: 500;
  color: ${color.black};
  line-height: 26px;
  letter-spacing: -0.36px;
`;

import { View } from 'react-native';
import styled from 'styled-components/native';

interface HtmlContentWrapperProps {
  isDesktop: boolean;
}

/**
 * HTML 콘텐츠를 감싸는 래퍼 컴포넌트
 *
 * isDesktop에 따라 루트 폰트 사이즈를 조절하여
 * 내부 HTML의 rem 단위가 반응형으로 동작하도록 함
 *
 * - Desktop: 16px (기준)
 * - Mobile: 15px
 *
 * CSS 변수를 통해 반응형 스타일 제공:
 * - --chip-font-size: chip 폰트 크기 (Desktop 13px, Mobile 12px)
 * - --title-font-size: 제목 폰트 크기 (Desktop 22px, Mobile 18px)
 * - --list-font-size: 리스트 폰트 크기 (Desktop 16px, Mobile 15px)
 * - --chip-gap: chip과 제목 사이 간격 (Desktop 8px, Mobile 4px)
 * - --box-border-radius: 박스 border-radius (Desktop 12px, Mobile 4px)
 * - --box-padding: 박스 padding (Desktop 16px, Mobile 12px)
 */
const HtmlContentWrapper = styled(View)<HtmlContentWrapperProps>`
  font-size: ${({ isDesktop }) => (isDesktop ? '16px' : '15px')};
  --chip-font-size: ${({ isDesktop }) => (isDesktop ? '13px' : '12px')};
  --chip-line-height: ${({ isDesktop }) => (isDesktop ? '18px' : '16px')};
  --title-font-size: ${({ isDesktop }) => (isDesktop ? '22px' : '18px')};
  --title-line-height: ${({ isDesktop }) => (isDesktop ? '32px' : '26px')};
  --list-font-size: ${({ isDesktop }) => (isDesktop ? '16px' : '15px')};
  --list-line-height: ${({ isDesktop }) => (isDesktop ? '26px' : '24px')};
  --chip-gap: ${({ isDesktop }) => (isDesktop ? '8px' : '4px')};
  --box-border-radius: ${({ isDesktop }) => (isDesktop ? '12px' : '4px')};
  --box-padding: ${({ isDesktop }) => (isDesktop ? '16px' : '12px')};
`;

export default HtmlContentWrapper;

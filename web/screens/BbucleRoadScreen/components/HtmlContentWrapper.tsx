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
 * - Mobile: 14px (약 87.5%)
 */
const HtmlContentWrapper = styled(View)<HtmlContentWrapperProps>`
  font-size: ${({ isDesktop }) => (isDesktop ? '16px' : '15px')};
`;

export default HtmlContentWrapper;

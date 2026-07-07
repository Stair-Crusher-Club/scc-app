import React from 'react';
import {Platform} from 'react-native';
import AnimatedGlow, {type PresetConfig} from 'react-native-animated-glow';

import GradientBorderPill from '@/components/GradientBorderPill';

/**
 * 저장리스트 추천 칩 글로우 shell (블랙 칩 + 빛나는 테두리).
 *
 * - iOS: react-native-animated-glow(Skia/Metal 백엔드)로 애니메이션 글로우 유지.
 * - Android: Skia OpenGL(Ganesh) present가 Adreno GPU(갤S25/안드16)에서
 *   eglSwapBuffers→Fence::waitForever 로 메인스레드 영구 블록 → ANR/강제종료를 유발한다.
 *   (skia 2.6.7·animated-glow 3.1.0 최신에서도 재현, Android는 Vulkan 전환 escape hatch 없음.)
 *   → 애니메이션을 빼고 정적 그라데이션 테두리로 대체해 Android에서 Skia canvas를 아예
 *   mount하지 않는다(= OpenGL 컨텍스트 미생성). 색상은 iOS 글로우와 동일 계열.
 */

const CHIP_BACKGROUND = '#16181C'; // Figma 블랙 칩
const CHIP_CORNER_RADIUS = 20;
const CHIP_BORDER_COLORS = ['#1EFF00', '#0093FF', '#00FFFA']; // green → blue → cyan

export default function RecommendationChipGlow({
  children,
}: {
  children: React.ReactNode;
}) {
  if (Platform.OS === 'ios') {
    return (
      <AnimatedGlow preset={RECOMMENDATION_CHIP_GLOW}>{children}</AnimatedGlow>
    );
  }

  return (
    <GradientBorderPill
      borderWidth={2}
      borderRadius={CHIP_CORNER_RADIUS}
      colors={CHIP_BORDER_COLORS}
      contentBackgroundColor={CHIP_BACKGROUND}
      gradientId="recommendationChipBorder">
      {children}
    </GradientBorderPill>
  );
}

// iOS 애니메이션 글로우 프리셋 — react-native-animated-glow "Confirmation Green" 기반.
// (Slack 디자인 협의: 시인성↑ + 고대비를 위한 '블랙 버튼 + 빛나는 테두리')
// borderColor: #1EFF00(green) → #0093FF(blue) → #00FFFA(cyan), background: Figma 블랙 칩(#16181C)
const RECOMMENDATION_CHIP_GLOW: PresetConfig = {
  metadata: {
    name: 'Recommendation Chip Glow',
    textColor: '#FFFFFF',
    category: 'Custom',
    tags: ['recommendation', 'chip'],
  },
  states: [
    {
      name: 'default',
      preset: {
        cornerRadius: CHIP_CORNER_RADIUS,
        outlineWidth: 2,
        borderColor: CHIP_BORDER_COLORS,
        backgroundColor: CHIP_BACKGROUND,
        animationSpeed: 2,
        borderSpeedMultiplier: 1,
        glowLayers: [
          {
            glowPlacement: 'behind',
            colors: ['#0fff47', 'rgba(255, 241, 0, 1)', '#00d646'],
            glowSize: 10,
            opacity: 0.05,
            speedMultiplier: 1,
            coverage: 1,
            relativeOffset: 0,
          },
          {
            glowPlacement: 'behind',
            colors: ['#0fff47', 'rgba(255, 241, 0, 1)', '#00d646'],
            glowSize: 4,
            opacity: 0.1,
            speedMultiplier: 1,
            coverage: 1,
            relativeOffset: 0,
          },
          {
            glowPlacement: 'inside',
            colors: ['rgba(99, 255, 0, 1)', 'rgba(180, 255, 65, 1)'],
            glowSize: [0, 20],
            opacity: 0.02,
            speedMultiplier: 1,
            coverage: 0.3,
            relativeOffset: 0,
          },
          {
            glowPlacement: 'over',
            colors: ['rgba(135, 255, 0, 1)', 'rgba(255, 248, 196, 1)'],
            glowSize: [0, 1],
            opacity: 0.5,
            speedMultiplier: 1,
            coverage: 0.4,
            relativeOffset: 0,
          },
        ],
      },
    },
  ],
};

module.exports = {
  root: true,
  extends: ['@react-native', 'plugin:prettier/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest'],
  // web/ 를 통째로 빼면 아래 "터치 컴포넌트는 Scc* 만" 룰이 웹 전용 화면에 안 걸린다.
  // 실제로 그 틈으로 뿌클로드 화면들이 raw TouchableOpacity 를 쓰게 됐고, 클릭 로깅이
  // 앱보다 훨씬 성겼다(노출 밀도 앱 5.53 vs 뿌클로드 0.47). 계측 정책은 표면과 무관하게 같아야 한다.
  // web/mocks 만 예외 — react-native 컴포넌트의 web shim 이라 raw Pressable 이 정당하다.
  ignorePatterns: ['web/mocks/', 'dist/'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'react/react-in-jsx-scope': 'off',
        '@typescript-eslint/no-shadow': ['error'],
        'no-shadow': 'off',
        'no-undef': 'off',
        'react-hooks/exhaustive-deps': 'off',
        'react-native/no-inline-styles': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            // _로 시작하는 변수는 unused-vars에 걸리지 않도록 처리
            args: 'all',
            argsIgnorePattern: '^_',
            caughtErrors: 'all',
            caughtErrorsIgnorePattern: '^e$|^_',
            destructuredArrayIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            ignoreRestSiblings: true,
          },
        ],
        // 자동 이벤트 로깅을 위한 Touchable 컴포넌트 사용 제한
        'no-restricted-imports': [
          'warn',
          {
            paths: [
              {
                name: 'react-native',
                importNames: [
                  'TouchableOpacity',
                  'TouchableHighlight',
                  'TouchableWithoutFeedback',
                  'Pressable',
                ],
                message:
                  'Use Scc* components from @/components instead for automatic event logging',
              },
              {
                name: '@/logging/Logger',
                importNames: ['logElementView', 'logElementClick'],
                message:
                  'Use useLogger() hook from @/logging/useLogger instead. Direct usage is only allowed in logging infrastructure (src/logging/, useSccEventLogging).',
              },
            ],
          },
        ],
        'no-restricted-syntax': [
          'warn', // 처음에는 warning으로 시작
          {
            selector:
              "MemberExpression[object.name='styled'][property.name='TouchableOpacity']",
            message:
              'Use styled(SccTouchableOpacity) instead of styled.TouchableOpacity for automatic event logging',
          },
          {
            selector:
              "MemberExpression[object.name='styled'][property.name='TouchableHighlight']",
            message:
              'Use styled(SccTouchableHighlight) instead of styled.TouchableHighlight for automatic event logging',
          },
          {
            selector:
              "MemberExpression[object.name='styled'][property.name='TouchableWithoutFeedback']",
            message:
              'Use styled(SccTouchableWithoutFeedback) instead of styled.TouchableWithoutFeedback for automatic event logging',
          },
          {
            selector:
              "MemberExpression[object.name='styled'][property.name='Pressable']",
            message:
              'Use styled(SccPressable) instead of styled.Pressable for automatic event logging',
          },
        ],
      },
    },
    // Logging infra는 logElementView/logElementClick 직접 사용 허용
    {
      files: [
        'src/logging/*.ts',
        'src/logging/*.tsx',
        'src/hooks/useSccEventLogging.ts',
      ],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
    // web/ 은 오랫동안 린트 제외였다. 이제 계측 강제 룰(no-restricted-imports)을 걸기 위해
    // 대상에 넣었는데, 포맷은 src/ 와 다른 스타일로 쌓여 있어 prettier 만 켜면 3,000줄 넘는
    // 포맷 diff 가 난다. 계측과 무관한 변경이라 포맷 정리는 별도 커밋으로 분리한다.
    // TODO: web/ 전체 prettier 정리 후 이 override 삭제.
    {
      files: ['web/**/*.ts', 'web/**/*.tsx', 'web/**/*.js'],
      rules: {
        'prettier/prettier': 'off',
      },
    },
  ],
};

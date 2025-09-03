module.exports = {
  root: true,
  extends: ['@react-native', 'plugin:prettier/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest'],
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
        // 전체 마이그레이션 전까지 임시로 주석 처리
        // // 자동 이벤트 로깅을 위한 Touchable 컴포넌트 사용 제한
        // 'no-restricted-imports': [
        //   'warn', // 처음에는 warning으로 시작
        //   {
        //     paths: [
        //       {
        //         name: 'react-native',
        //         importNames: ['TouchableOpacity', 'TouchableHighlight', 'TouchableWithoutFeedback', 'Pressable'],
        //         message: 'Use Scc* components from @/components instead for automatic event logging'
        //       }
        //     ]
        //   }
        // ],
        // 'no-restricted-syntax': [
        //   'warn', // 처음에는 warning으로 시작
        //   {
        //     selector: "MemberExpression[object.name='styled'][property.name='TouchableOpacity']",
        //     message: 'Use styled(SccTouchableOpacity) instead of styled.TouchableOpacity for automatic event logging'
        //   },
        //   {
        //     selector: "MemberExpression[object.name='styled'][property.name='TouchableHighlight']",
        //     message: 'Use styled(SccTouchableHighlight) instead of styled.TouchableHighlight for automatic event logging'
        //   },
        //   {
        //     selector: "MemberExpression[object.name='styled'][property.name='TouchableWithoutFeedback']",
        //     message: 'Use styled(SccTouchableWithoutFeedback) instead of styled.TouchableWithoutFeedback for automatic event logging'
        //   },
        //   {
        //     selector: "MemberExpression[object.name='styled'][property.name='Pressable']",
        //     message: 'Use styled(SccPressable) instead of styled.Pressable for automatic event logging'
        //   }
        // ],
      },
    },
  ],
};

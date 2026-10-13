import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        Buffer: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        URL: 'readonly',
      },
    },
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'style',
          property: 'marginLeft',
          message: 'Use logical CSS properties.',
        },
        {
          object: 'style',
          property: 'marginRight',
          message: 'Use logical CSS properties.',
        },
        {
          object: 'style',
          property: 'paddingLeft',
          message: 'Use logical CSS properties.',
        },
        {
          object: 'style',
          property: 'paddingRight',
          message: 'Use logical CSS properties.',
        },
      ],
    },
  },
);

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
  {
    files: ['src/**/*.{ts,js}', 'tests/**/*.{ts,js}', 'netlify/functions/**/*.{ts,js}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      'no-var': 'error',
      'prefer-const': 'warn',
    },
  },
];

module.exports = {
  root: true,
  env: {
    browser: false,
    node: true,
  },
  extends: ['plugin:vue/essential', 'eslint:recommended', '@vue/prettier'],
  parserOptions: {
    parser: 'babel-eslint',
  },
  ignorePatterns: ['**/*.d.ts'],
  overrides: [
    {
      files: ['src/**/*.{j,t}s?(x)'],
      env: {
        browser: true,
        node: false,
      },
    },
    {
      files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)'],
      env: {
        jest: true,
      },
    },
  ],
}

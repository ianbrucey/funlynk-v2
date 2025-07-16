module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'prettier/prettier': 'error',
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['prettier'],
};

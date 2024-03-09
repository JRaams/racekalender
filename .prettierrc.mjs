/** @type {import('prettier').Config} */
export default {
  useTabs: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  printWidth: 120,
  plugins: ['prettier-plugin-astro'],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
};

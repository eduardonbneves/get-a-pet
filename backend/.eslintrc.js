module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  overrides: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "import-helpers"],
  rules: {
    indent: ["error", "tab"],
    "linebreak-style": ["error", "windows"],
    quotes: ["error", "single"],
    semi: ["error", "always"],
    "arrow-spacing": ["error", { "before": true, "after": true }],
    "comma-dangle": ["error", "never"],
    "eol-last": ["error", "never"],
    "func-call-spacing": ["error", "never"],
    "brace-style": "error",
    "key-spacing": ["error", { "beforeColon": false }],
    "keyword-spacing": ["error", { "before": true }],
    "no-multi-spaces": ["error", { ignoreEOLComments: true }],
    "no-trailing-spaces": ["error", { "ignoreComments": true }],
    "object-curly-spacing": ["error", "always"],
    "semi-spacing": ["error", { "after": true }],
    "comma-spacing": ["error", { "after": true }],
    "no-console": "error",
    'import-helpers/order-imports': [
      "warn",
      {
          newlinesBetween: "always",
          groups: [
              "module",
              ["parent", "sibling", "index"],
          ],
          alphabetize: { order: "asc", ignoreCase: true },
      },
  ],
  },
};

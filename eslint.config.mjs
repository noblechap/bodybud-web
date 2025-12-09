import antfu from "@antfu/eslint-config";

export default antfu({
  ignores: ["node_modules", "out", "package.json"],
  markdown: false,
  rules: {
    "style/semi": ["error", "always"],
    "style/quotes": ["error", "double"],
    "style/comma-dangle": ["off"],
    "style/member-delimiter-style": [
      "error",
      {
        multiline: {
          delimiter: "semi"
        }
      }
    ],
    "style/arrow-parens": ["error", "always"],
    "style/object-curly-newline": [
      "error",
      {
        ImportDeclaration: {
          minProperties: 5,
          multiline: true,
          consistent: true
        }
      }
    ],
    "ts/no-explicit-any": "error",
    "vue/max-attributes-per-line": [
      "error",
      {
        singleline: {
          max: 3
        },
        multiline: {
          max: 1
        }
      }
    ]
  }
});

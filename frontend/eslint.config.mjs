import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: ["**/src/lib/api.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-non-null-assertion": "error",
      "react-hooks/exhaustive-deps": "error",
      "react/jsx-no-useless-fragment": "warn",
      "react/no-array-index-key": "warn",
      "@next/next/no-img-element": "warn",
    },
  },
  {
    files: ["**/src/lib/api.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;

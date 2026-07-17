import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

/**
 * Shared flat ESLint config for TypeScript packages in the monorepo.
 * Type-checked rules stay off by default so config files don't need a tsconfig;
 * packages that want them can layer `tseslint.configs.recommendedTypeChecked`.
 */
export default tseslint.config(
  {
    ignores: ["dist/**", ".next/**", "node_modules/**", "coverage/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // §8: no `any` — use `unknown` and narrow.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
    },
  },
  prettier,
);

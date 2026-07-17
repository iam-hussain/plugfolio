import jsxA11y from "eslint-plugin-jsx-a11y";
import base from "./base.js";

/**
 * ESLint preset for the Next.js app. Extends the base TS config and adds
 * accessibility rules (§8: accessibility is not optional).
 *
 * Note: `@next/eslint-plugin-next` is wired in the app's own eslint config via
 * `next lint`; this preset carries the shared, framework-agnostic rules plus a11y.
 */
export default [
  ...base,
  {
    files: ["**/*.{ts,tsx,jsx}"],
    plugins: { "jsx-a11y": jsxA11y },
    rules: {
      ...jsxA11y.configs.recommended.rules,
    },
  },
];

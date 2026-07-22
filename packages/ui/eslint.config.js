import next from "@plugfolio/config/eslint/next";

export default [
  ...next,
  {
    // src/components/ is shadcn registry output (vendored, refreshed by the
    // CLI) — relax the rules its generated patterns trip so refreshes stay
    // diff-only. Our own composed components live in the apps and keep the
    // full rule set.
    files: ["src/components/**"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_|^children$" }],
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-noninteractive-element-interactions": "off",
      "jsx-a11y/anchor-has-content": "off",
    },
  },
];

import { FlatCompat } from "@eslint/eslintrc";
import base from "@plugfolio/config/eslint/base";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

// Shared TS rules + Next.js core-web-vitals (which already bundles jsx-a11y).
export default [...base, ...compat.extends("next/core-web-vitals")];

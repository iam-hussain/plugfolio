// Storybook stub for next/font/google. The real webfonts are loaded via
// preview-head.html; this just satisfies the import shape.
type FontResult = { className: string; variable: string; style: { fontFamily: string } };

function font(): FontResult {
  return { className: "", variable: "", style: { fontFamily: "" } };
}

export const Sora = font;
export const Inter = font;
export const Space_Mono = font;

// Design-sync preview wrapper — replaces the storybook `.storybook/preview.tsx`
// decorators (which don't bundle: @storybook/addon-themes' withThemeByDataAttribute
// isn't a stubbed export). It reproduces exactly what those decorators did:
//   1. pin the dark theme by setting data-theme="dark" on <html> — the tokens
//      scope dark to :root[data-theme="dark"], and the reference storybook
//      renders defaultTheme="dark", so previews must match to grade clean;
//   2. wrap the story in the page surface (bg-background/text-foreground/font-sans)
//      with p-8 padding, same as the second decorator.
// Exposed on window.PlugfolioUI via cfg.extraEntries and used as cfg.provider.
import * as React from "react";

export function PreviewShell({ children }: { children?: React.ReactNode }) {
  React.useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);
  return (
    <div className="bg-background text-foreground font-sans">
      <div className="p-8">{children}</div>
    </div>
  );
}

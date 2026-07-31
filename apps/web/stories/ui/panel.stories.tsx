import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  Panel,
  PanelBody,
  PanelControls,
  PanelFooter,
  PanelHeader,
  SortButton,
  Textarea,
} from "@plugfolio/ui";

/**
 * The panel shell (DESIGN creator.html §.pn) — what goes *inside* a drawer or
 * a modal. The shells themselves stay shadcn's `Sheet` and `Dialog` (§8: don't
 * rebuild what they give us).
 *
 * The rule the shape exists for: the body is the **only** thing that scrolls.
 * Header and footer stay put, so the composer never walks off the bottom of a
 * long thread — and the footer's padding carries `env(safe-area-inset-bottom)`,
 * without which it sits under the home indicator on the phones most of our
 * traffic arrives on.
 */
const meta = {
  title: "UI Kit/Panel",
  component: Panel,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="border-border bg-card rounded-card h-[440px] w-[380px] max-w-[92vw] overflow-hidden border">
    {children}
  </div>
);

const Line = ({ children }: { children: React.ReactNode }) => (
  <p className="border-border text-copy border-b py-3.5 last:border-b-0">{children}</p>
);

/** Header, a scrolling body, and a footer that stays. */
export const Comments: Story = {
  args: { children: null },
  render: () => (
    <Frame>
      <Panel>
        <PanelHeader title="Comments" />
        <PanelControls>
          <SortButton selected>Recent</SortButton>
          <SortButton>Oldest</SortButton>
          <SortButton>Most helpful</SortButton>
        </PanelControls>
        <PanelBody>
          {Array.from({ length: 12 }, (_, i) => (
            <Line key={i}>Comment {i + 1} — the body is the only thing that scrolls.</Line>
          ))}
        </PanelBody>
        <PanelFooter>
          <Textarea rows={1} placeholder="Add a comment" className="min-w-0 flex-1" />
          <Button>Post</Button>
        </PanelFooter>
      </Panel>
    </Frame>
  ),
};

/** With its own close control, for shells that don't draw one. */
export const WithClose: Story = {
  args: { children: null },
  render: () => (
    <Frame>
      <Panel>
        <PanelHeader title="Customise" onClose={() => {}} />
        <PanelBody>
          <p className="text-copy text-muted-foreground py-3.5">
            The drawer opens over the page, so the creator edits against the real thing (ADR-0017).
          </p>
        </PanelBody>
        <PanelFooter>
          <Button variant="secondary">Cancel</Button>
          <Button>Save</Button>
        </PanelFooter>
      </Panel>
    </Frame>
  ),
};

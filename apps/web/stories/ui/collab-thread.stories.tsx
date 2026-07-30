import type { Meta, StoryObj } from "@storybook/react";
import {
  AcceptRow,
  AcceptStatus,
  AgreedBanner,
  Badge,
  Button,
  MessageBubble,
  TermsCard,
  TermsHeader,
  TermsLabel,
  TermsLine,
  TermsSubtitle,
  TermsTitle,
  ThreadEvent,
} from "@plugfolio/ui";
import { Check } from "lucide-react";

/**
 * UI Kit · Collab thread — the furniture of /collabs/[collabId] (brief 12).
 *
 * The states here are the ones worth reviewing side by side, because the
 * whole design rests on them staying honest with each other: a new proposal
 * clears both acceptances, so "Agreed" can only ever mean agreed to the
 * terms currently pinned. Badge, pinned line and banner all read from one
 * `status` for exactly that reason.
 */
const meta: Meta<typeof TermsCard> = {
  title: "UI Kit/Collab thread",
  component: TermsCard,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof TermsCard>;

export const Negotiating: Story = {
  render: () => (
    <div className="max-w-inner mx-auto max-w-[760px]">
      <TermsCard status="negotiating">
        <TermsHeader>
          <div className="min-w-0 flex-1">
            <TermsTitle>Fold &amp; Co × @mayamoves</TermsTitle>
            <TermsSubtitle>Skincare creators for a spring launch</TermsSubtitle>
          </div>
          <Badge variant="outline">Negotiating</Badge>
        </TermsHeader>
        <TermsLine>
          <TermsLabel>The terms ·</TermsLabel>
          Two posts and one story · ₹25,000 · by 30 Aug 2026
        </TermsLine>
      </TermsCard>
    </div>
  ),
};

/** Both sides accepted. The banner states the money fact in the same breath. */
export const Agreed: Story = {
  render: () => (
    <div className="mx-auto max-w-[760px]">
      <TermsCard status="agreed">
        <TermsHeader>
          <div className="min-w-0 flex-1">
            <TermsTitle>Fold &amp; Co × @mayamoves</TermsTitle>
            <TermsSubtitle>Skincare creators for a spring launch</TermsSubtitle>
          </div>
          <Badge>Agreed</Badge>
        </TermsHeader>
        <TermsLine>
          <TermsLabel>The terms ·</TermsLabel>
          Two posts and one story · ₹25,000 · by 30 Aug 2026
        </TermsLine>
        <AgreedBanner>
          <Check className="size-4 shrink-0" aria-hidden="true" />
          Both sides accepted — payment settles off Plugfolio.
        </AgreedBanner>
      </TermsCard>
    </div>
  ),
};

/**
 * A thread that has not been given terms yet. Not an error — most threads
 * open this way, so the copy reads as the next step.
 */
export const NoTermsYet: Story = {
  render: () => (
    <div className="mx-auto max-w-[760px]">
      <TermsCard>
        <TermsHeader>
          <div className="min-w-0 flex-1">
            <TermsTitle>Fold &amp; Co × @mayamoves</TermsTitle>
            <TermsSubtitle>Direct collab</TermsSubtitle>
          </div>
          <Badge variant="outline">Negotiating</Badge>
        </TermsHeader>
        <TermsLine pending>
          No terms proposed yet — pin what gets made, the price, and the deadline below.
        </TermsLine>
      </TermsCard>
    </div>
  ),
};

/** Bubbles by side, and a proposal marker across the column. */
export const Conversation: Story = {
  render: () => (
    <ul className="mx-auto flex max-w-[760px] flex-col gap-3.5">
      <li>
        <MessageBubble tone="theirs">
          Hi Maya — we&rsquo;re launching a serum in the spring and your skin posts are exactly the
          register we want.
        </MessageBubble>
      </li>
      <li className="flex justify-end">
        <MessageBubble tone="mine">
          Open to it. Two posts and a story — is that within range?
        </MessageBubble>
      </li>
      <ThreadEvent>Fold &amp; Co proposed terms · 13 June</ThreadEvent>
      <li>
        <MessageBubble tone="theirs">
          It is. Proposed above — shout if the date is tight and we&rsquo;ll move it.
        </MessageBubble>
      </li>
    </ul>
  ),
};

/**
 * Status left, action right — the order the decision is made in. Once you
 * have accepted, the button states that rather than offering the action
 * again; an enabled button there invites a second press that means nothing.
 */
export const Accepting: Story = {
  render: () => (
    <div className="mx-auto flex max-w-[760px] flex-col gap-3">
      <AcceptRow>
        <AcceptStatus>The other side hasn&rsquo;t accepted yet.</AcceptStatus>
        <Button>Accept terms</Button>
      </AcceptRow>
      <AcceptRow>
        <AcceptStatus>The other side has accepted.</AcceptStatus>
        <Button>Accept terms</Button>
      </AcceptRow>
      <AcceptRow>
        <AcceptStatus>The other side has accepted.</AcceptStatus>
        <Button disabled>You accepted</Button>
      </AcceptRow>
    </div>
  ),
};

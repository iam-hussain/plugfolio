import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  Comment,
  CommentAvatar,
  CommentList,
  CommentSection,
  CommentSort,
  CommentThread,
  EmptyState,
  PageBand,
  PageBandText,
  ShelfChip,
  ShelfChips,
  ShelfDescription,
  SortButton,
} from "@plugfolio/ui";

/**
 * The rest of the creator page's vocabulary (DESIGN creator.html) — the shelf
 * rail, the bands, the empty state and the comment shapes. Each is used on
 * more than one page, which is why they live in the design system (ADR-0018).
 */
const meta: Meta = {
  title: "Creator page/Parts",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

/**
 * Filters, not links out — square-shouldered and text-led, so they can't be
 * mistaken for the circular icon-only socials above them.
 */
export const Shelves: Story = {
  render: () => (
    <div className="max-w-[720px]">
      <ShelfChips>
        <ShelfChip selected href="#">
          All
        </ShelfChip>
        <ShelfChip href="#">Desk setup</ShelfChip>
        <ShelfChip href="#">Gym</ShelfChip>
        <ShelfChip href="#">Skin</ShelfChip>
        <ShelfChip href="#">Home</ShelfChip>
        <ShelfChip href="#">Under ₹1,000</ShelfChip>
      </ShelfChips>
      <ShelfDescription>
        Everything on and around the desk, including the boring bits.
      </ShelfDescription>
    </div>
  ),
};

/** The bands a specific viewer sees. Never shown to everyone at once. */
export const Bands: Story = {
  render: () => (
    <div className="flex max-w-[720px] flex-col">
      <PageBand>
        <PageBandText title="This is your page">Visitors see exactly this.</PageBandText>
        <Button variant="secondary" size="sm">
          Dashboard
        </Button>
      </PageBand>
      <PageBand>
        <PageBandText title="312 taps tracked from this post">
          Counted when someone opens a retailer from here.
        </PageBandText>
        <Button variant="secondary" size="sm">
          See all Earnings
        </Button>
      </PageBand>
      <PageBand tone="surface" layout="stack">
        <PageBandText title="You run a brand">
          Approach @mayamoves about working together — terms are agreed in one thread.
        </PageBandText>
        <Button size="sm" className="self-start">
          Request a collab
        </Button>
      </PageBand>
    </div>
  ),
};

/**
 * Dashed, not solid: a solid border reads as a card that failed to load, a
 * dashed one as a space waiting to be filled.
 */
export const Empty: Story = {
  render: () => (
    <div className="flex max-w-[720px] flex-col gap-4">
      <EmptyState
        title="Nothing on this shelf yet"
        action={<Button variant="secondary">See everything</Button>}
      >
        This shelf is empty — the rest of the page still has everything on it.
      </EmptyState>
      <EmptyState title="No comments yet">
        Be the first to ask something about these posts.
      </EmptyState>
    </div>
  ),
};

/** A thread: the comment, its reactions, and one level of replies (ADR-0013). */
export const Comments: Story = {
  render: () => (
    <div className="max-w-[720px]">
      <CommentSection
        count={24}
        report={
          <a
            href="#"
            className="text-faint hover:text-primary text-micro font-bold uppercase tracking-[0.06em] no-underline"
          >
            Report page
          </a>
        }
      >
        <CommentSort>
          <SortButton selected>Recent</SortButton>
          <SortButton>Oldest</SortButton>
          <SortButton>Most helpful</SortButton>
        </CommentSort>
        <CommentList>
          <li>
            <Comment
              avatar={<CommentAvatar initial="P" />}
              author="@priyareads"
              when="2 days ago"
              body="Do the runners ship to Pune? Tapped through and it looked like only metros."
              actions={
                <>
                  <SortButton>👍 12</SortButton>
                  <SortButton>Reply</SortButton>
                </>
              }
              replies={
                <CommentThread>
                  <li>
                    <Comment
                      avatar={<CommentAvatar initial="M" />}
                      author="mayamoves"
                      badge="Creator"
                      when="1 day ago"
                      body="They do now — the listing was stale. Fixed the link."
                    />
                  </li>
                </CommentThread>
              }
            />
          </li>
          <li>
            <Comment
              avatar={<CommentAvatar initial="S" />}
              author="@sanj"
              when="5 days ago"
              body="The gua sha is genuinely the best ₹649 I've spent this year."
            />
          </li>
        </CommentList>
      </CommentSection>
    </div>
  ),
};

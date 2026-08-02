import type { Meta, StoryObj } from "@storybook/react";
import {
  AdSlot,
  AdSlotWhy,
  Button,
  DiscoveryAvatar,
  DiscoveryCard,
  DiscoveryGrid,
  DiscoveryPinMore,
  DiscoveryRail,
  discoveryTone,
  ProductTag,
  WallEnd,
  WallEndNote,
} from "@plugfolio/ui";

/**
 * Discovery — one card, three contents.
 *
 * A creator, a post and a thing are the same chassis: same width, same 4:5
 * photo in its colour mat, same byline, same footer rule. Only what the card is
 * *about* changes. Compare the stories below at one viewport: the columns line
 * up, and nothing has to be relearned between sections.
 */
const swatch = (hue: string, w = 480, h = 600) =>
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><rect width='${w}' height='${h}' fill='${hue}'/></svg>`,
  );

const img = (fill: string) => <img src={swatch(fill)} alt="" className="size-full object-cover" />;

const HUES = ["#C9B6FF", "#A9D8FF", "#FFD84D", "#96E6BC", "#FFC9DE", "#FF8A73"];
const hue = (i: number) => HUES[i % HUES.length] as string;

const CREATORS = [
  { handle: "mayamoves", name: "Maya Iyer", posts: 18, things: 42 },
  { handle: "arjunbuilds", name: null, posts: 24, things: 51 },
  { handle: "rheamakes", name: "Rhea Makes", posts: 11, things: 20 },
  { handle: "studiolane", name: "Studio Lane", posts: 9, things: 14 },
  { handle: "foldandco", name: "Fold & Co", posts: 3, things: 4 },
];

function creatorCards(layout: "rail" | "grid") {
  return CREATORS.map((creator, index) => (
    <DiscoveryCard
      key={creator.handle}
      layout={layout}
      tone={discoveryTone(index)}
      avatar={<DiscoveryAvatar initial={creator.handle.charAt(0).toUpperCase()} />}
      handle={creator.name ?? "Creator"}
      title={<a href="#">{creator.name ?? `@${creator.handle}`}</a>}
      stat={`${creator.posts} posts · ${creator.things} things`}
      action="View page →"
      media={img(hue(index))}
    />
  ));
}

const meta: Meta = { title: "Explore/Discovery", parameters: { layout: "padded" } };
export default meta;
type Story = StoryObj;

/** The deck: the All tab's creator rail, the one place the resting tilt lives. */
export const CreatorRail: Story = {
  render: () => <DiscoveryRail>{creatorCards("rail")}</DiscoveryRail>,
};

/**
 * Scoped to Creators the deck becomes the result set — the shared grid, no
 * tilt. A rail says "there is more sideways"; a results page has to say "this
 * is the set".
 */
export const CreatorResults: Story = {
  render: () => <DiscoveryGrid>{creatorCards("grid")}</DiscoveryGrid>,
};

/** Posts: the same card, wearing the signature — one tag pinned on the photo. */
export const Posts: Story = {
  render: () => (
    <DiscoveryGrid>
      {[
        { caption: "The desk reset that actually stuck", things: 3, tone: "affiliate" as const },
        { caption: "Everything in the Sunday bag", things: 5, tone: "offer" as const },
        { caption: null, things: 1, tone: "own" as const },
        { caption: "One frame, one lens, one week", things: 0, tone: "affiliate" as const },
      ].map((post, index) => (
        <DiscoveryCard
          key={post.caption ?? "untitled"}
          tone={discoveryTone(index)}
          avatar={<DiscoveryAvatar initial="M" />}
          handle="@mayamoves"
          title={<a href="#">{post.caption ?? "See what's tagged"}</a>}
          stat={post.things > 0 ? `${post.things} things` : "Nothing tagged"}
          action="Open →"
          media={img(hue(index))}
          pins={
            post.things > 0 ? (
              <>
                <ProductTag
                  asChild
                  tone={post.tone}
                  name="Brightening serum"
                  price="₹1,299"
                  className="min-w-0 max-w-full"
                >
                  <a href="#" aria-label="Brightening serum — ₹1,299" />
                </ProductTag>
                {post.things > 1 ? (
                  <DiscoveryPinMore asChild>
                    <a href="#">+{post.things - 1}</a>
                  </DiscoveryPinMore>
                ) : null}
              </>
            ) : null
          }
        />
      ))}
    </DiscoveryGrid>
  ),
};

/** Things: the same card again — the price is where every card carries its number. */
export const Things: Story = {
  render: () => (
    <DiscoveryGrid>
      {[
        { title: "Brightening serum", price: "₹1,299", flag: "offer" as const, go: "Buy →" },
        { title: "Court trainers", price: "$32.00", flag: "own" as const, go: "Shop →" },
        { title: "Desk lamp", price: "$48.00", flag: null, go: "Buy →" },
        {
          title: "Brass task lamp with a name long enough to wrap onto two lines and stop",
          price: "See price",
          flag: null,
          go: "Buy →",
        },
      ].map((thing, index) => (
        <DiscoveryCard
          key={thing.title}
          tone={discoveryTone(index)}
          avatar={<DiscoveryAvatar initial="A" />}
          handle="@arjunbuilds"
          title={<a href="#">{thing.title}</a>}
          stat={thing.price}
          action={thing.go}
          flag={
            thing.flag === "offer"
              ? { label: "Code SAVE30", tone: "offer" }
              : thing.flag === "own"
                ? { label: "Their own", tone: "own" }
                : null
          }
          media={img(hue(index))}
        />
      ))}
    </DiscoveryGrid>
  ),
};

/** All three kinds in one row — the point of the redesign, at a glance. */
export const OneChassisThreeContents: Story = {
  render: () => (
    <DiscoveryGrid>
      <DiscoveryCard
        tone="lavender"
        avatar={<DiscoveryAvatar initial="M" />}
        handle="Maya Iyer"
        title={<a href="#">Maya Iyer</a>}
        stat="18 posts · 42 things"
        action="View page →"
        media={img(hue(0))}
      />
      <DiscoveryCard
        tone="sky"
        avatar={<DiscoveryAvatar initial="M" />}
        handle="@mayamoves"
        title={<a href="#">The desk reset that actually stuck</a>}
        stat="3 things"
        action="Open →"
        media={img(hue(1))}
        pins={
          <>
            <ProductTag asChild name="Desk lamp" price="$48" className="min-w-0 max-w-full">
              <a href="#" aria-label="Desk lamp — $48" />
            </ProductTag>
            <DiscoveryPinMore asChild>
              <a href="#">+2</a>
            </DiscoveryPinMore>
          </>
        }
      />
      <DiscoveryCard
        tone="butter"
        avatar={<DiscoveryAvatar initial="M" />}
        handle="@mayamoves"
        title={<a href="#">Brightening serum</a>}
        stat="₹1,299"
        action="Buy →"
        flag={{ label: "Code SAVE30", tone: "offer" }}
        media={img(hue(2))}
      />
    </DiscoveryGrid>
  ),
};

/**
 * The sponsored slot is deliberately **not** a discovery card: full-width, no
 * mat, no tag pill, no price, no Buy label — every one of those belongs to a
 * creator's recommendation, and an ad wearing them is claiming to be one.
 */
export const Sponsored: Story = {
  render: () => (
    <AdSlot
      href="#"
      image={<img src={swatch("#FFD84D", 200, 200)} alt="" className="size-full object-cover" />}
      title="Aster — the notebook that lies flat"
      description="Made in Chennai. Free shipping over ₹999."
      why={<AdSlotWhy>Why this?</AdSlotWhy>}
    />
  ),
};

/** Both ends of the wall. The page always shows exactly one. */
export const Ends: Story = {
  render: () => (
    <div className="flex flex-col">
      <WallEnd>
        <Button variant="secondary">Load more</Button>
        <WallEndNote>Showing 24 of 128</WallEndNote>
      </WallEnd>
      <WallEnd>
        <WallEndNote>
          That&apos;s everything for now. More lands as creators tag their posts.
        </WallEndNote>
      </WallEnd>
    </div>
  ),
};

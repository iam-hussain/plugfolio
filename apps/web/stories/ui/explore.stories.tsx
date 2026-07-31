import type { Meta, StoryObj } from "@storybook/react";
import {
  AdSlot,
  AdSlotWhy,
  Button,
  CreatorCard,
  CreatorFan,
  PostWall,
  ProductTag,
  ThingCard,
  ThingsGrid,
  Tile,
  WallEnd,
  WallEndNote,
  WallPost,
} from "@plugfolio/ui";

/**
 * Explore (DESIGN explore.html — "the tagged wall"). A search result and a
 * browse are the same page in two states, so the fan and the wall are the
 * result groups too; only the labelling changes.
 */
const swatch = (hue: string, w = 400, h = 500) =>
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><rect width='${w}' height='${h}' fill='${hue}'/></svg>`,
  );

const img = (hue: string) => <img src={swatch(hue)} alt="" className="size-full object-cover" />;

const CREATORS = [
  { handle: "@mayamoves", meta: "18 posts · 42 things", hue: "#FFD84D" },
  { handle: "@arjunbuilds", meta: "24 posts · 51 things", hue: "#A9D8FF" },
  { handle: "@rheamakes", meta: "11 posts · 20 things", hue: "#96E6BC" },
  { handle: "@studiolane", meta: "9 posts · 14 things", hue: "#C9B6FF" },
  { handle: "@foldandco", meta: "3 posts · 4 things", hue: "#FFC9DE" },
];

const meta: Meta = { title: "Explore/Wall", parameters: { layout: "padded" } };
export default meta;
type Story = StoryObj;

/** The rail: cards overlap and tilt at rest, straighten on hover. */
export const CreatorRail: Story = {
  render: () => (
    <CreatorFan>
      {CREATORS.map((c) => (
        <CreatorCard
          key={c.handle}
          href="#"
          handle={c.handle}
          meta={c.meta}
          cover={img(c.hue)}
          avatar={
            <span className="bg-active text-primary rounded-pill grid size-6 place-items-center text-[11px] font-bold">
              {c.handle.charAt(1).toUpperCase()}
            </span>
          }
        />
      ))}
    </CreatorFan>
  ),
};

/**
 * Scoped to Creators the fan becomes the result set — a grid that wraps, no
 * overlap, no tilt. A rail says "there is more sideways"; a results page has
 * to say "this is the set".
 */
export const CreatorResults: Story = {
  render: () => (
    <CreatorFan layout="grid">
      {CREATORS.map((c) => (
        <CreatorCard
          key={c.handle}
          layout="grid"
          href="#"
          handle={c.handle}
          meta={c.meta}
          cover={img(c.hue)}
          avatar={
            <span className="bg-active text-primary rounded-pill grid size-6 place-items-center text-[11px] font-bold">
              {c.handle.charAt(1).toUpperCase()}
            </span>
          }
        />
      ))}
    </CreatorFan>
  ),
};

/** The wall — a grid, not columns, so an odd count leaves no hole. */
export const Wall: Story = {
  render: () => (
    <PostWall>
      {["#C9B6FF", "#A9D8FF", "#FFD84D", "#FFC9DE", "#96E6BC"].map((hue, i) => (
        <WallPost
          key={hue}
          media={
            <Tile tone="lavender" className="rounded-card shadow-rest p-2">
              <div className="relative">
                <div className="rounded-image overflow-hidden">
                  <img
                    src={swatch(hue)}
                    alt=""
                    className="block aspect-[4/5] w-full object-cover"
                  />
                </div>
                <ProductTag name="Desk lamp" price="$48" className="absolute left-[8%] top-[24%]" />
                {i % 2 === 0 ? (
                  <ProductTag
                    tone="offer"
                    name="Serum"
                    price="₹1,299"
                    className="absolute left-[40%] top-[64%]"
                  />
                ) : null}
              </div>
            </Tile>
          }
          by={<span className="text-label font-semibold">@mayamoves</span>}
          count="3 things"
        />
      ))}
    </PostWall>
  ),
};

/** Things is its own view — a scope control that doesn't scope is worse than none. */
export const Things: Story = {
  render: () => (
    <ThingsGrid>
      <ThingCard
        href="#"
        title="Brightening serum"
        by="by @mayamoves"
        price="₹1,299"
        flag={{ label: "Code SAVE30", tone: "offer" }}
        image={img("#FFC9DE")}
      />
      <ThingCard
        href="#"
        title="Court trainers"
        by="by @mayamoves"
        price="$32.00"
        flag={{ label: "Their own", tone: "own" }}
        go="Shop →"
        image={img("#A9D8FF")}
      />
      <ThingCard
        href="#"
        title="Desk lamp"
        by="by @arjunbuilds"
        price="$48.00"
        image={img("#FFD84D")}
      />
      <ThingCard
        href="#"
        title="Brass task lamp — price unknown"
        by="by @studiolane"
        price={null}
        image={img("#96E6BC")}
      />
    </ThingsGrid>
  ),
};

/**
 * The sponsored slot is deliberately **not** a wall tile: full-width, no tilt,
 * no tag pill, no price, no Buy label — every one of those belongs to a
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

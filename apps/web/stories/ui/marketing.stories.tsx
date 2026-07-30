import type { Meta, StoryObj } from "@storybook/react";
import {
  BriefCard,
  Button,
  CollabBubble,
  CollabThread,
  Exclusions,
  Faq,
  FaqItem,
  HandleClaim,
  LimitPanel,
  LoopStep,
  LoopSteps,
  ProductTag,
  ProofRow,
  RetailerFrame,
  Tile,
} from "@plugfolio/ui";

/**
 * The persuade surfaces (DESIGN how-it-works / for-creators / for-business).
 *
 * The rule all of them follow: show the real component rather than describing
 * it. A screenshot of a feature is a claim; the feature itself is evidence.
 */
const swatch = (hue: string) =>
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='400' height='300' fill='${hue}'/></svg>`,
  );

const meta: Meta = { title: "Marketing/Persuade", parameters: { layout: "padded" } };
export default meta;
type Story = StoryObj;

/**
 * The loop. Step three is the retailer — deliberately **not** a Plugfolio
 * surface. An empty dashed box read as a card that failed to load, so it shows
 * the thing you actually land on, with their buy button, and keeps the dashed
 * edge as the only cue that the frame isn't ours.
 */
export const Loop: Story = {
  render: () => (
    <LoopSteps>
      <LoopStep
        n={1}
        title="A creator tags their post"
        artefact={
          <Tile tone="butter" data-artefact className="rounded-card shadow-rest p-2.5">
            <div className="relative">
              <div className="rounded-image overflow-hidden">
                <img src={swatch("#FFD84D")} alt="" className="block aspect-[4/3] w-full object-cover" />
              </div>
              <ProductTag name="Desk lamp" price="$48" className="absolute left-[10%] top-[30%]" />
            </div>
          </Tile>
        }
      >
        Everything in the photo gets a price pill pinned onto it.
      </LoopStep>
      <LoopStep
        n={2}
        title="You tap the tag"
        artefact={
          <Tile tone="sky" data-artefact className="rounded-card shadow-rest p-2.5">
            <div className="rounded-image overflow-hidden">
              <img src={swatch("#A9D8FF")} alt="" className="block aspect-[4/3] w-full object-cover" />
            </div>
          </Tile>
        }
      >
        No account, no popup — the tag is the control.
      </LoopStep>
      <LoopStep
        n={3}
        title="You land on the shop"
        artefact={
          <div data-artefact>
            <RetailerFrame name="Desk lamp — warm white" note="on the retailer's site">
              <img src={swatch("#EDEAF6")} alt="" className="block aspect-[4/3] w-full object-cover" />
            </RetailerFrame>
          </div>
        }
      >
        Their site, their checkout. Plugfolio never touches the money.
      </LoopStep>
    </LoopSteps>
  ),
};

/** Native `<details>` — works with no JS, and search engines read it. */
export const Questions: Story = {
  render: () => (
    <div className="max-w-[720px]">
      <Faq>
        <FaqItem q="Do I need an account to buy?">
          No. Buying never asks for one — an account only exists if you want to follow a creator or
          leave a comment.
        </FaqItem>
        <FaqItem q="Does Plugfolio take a cut?">
          No. The retailer&apos;s affiliate network pays the creator directly, on its own schedule.
          We measure the tap and stay out of the payment path.
        </FaqItem>
        <FaqItem q="What can't you measure?">
          In-store redemption. If someone shows a code at a till, nothing reports back — so the
          product says so rather than guessing.
        </FaqItem>
      </Faq>
    </div>
  ),
};

/**
 * for-creators: the handle claim states real scarcity plainly (a handle is
 * proved by a connected social), the proof row carries one measured number
 * with its honesty label, and the money limit gets a panel of its own.
 */
export const ForCreators: Story = {
  render: () => (
    <div className="max-w-[560px]">
      <HandleClaim handle="yourhandle" action={<Button>Claim it</Button>} />
      <ProofRow
        figure="128"
        caption="taps from this post"
        flag="Tracked"
        thumb={<img src={swatch("#96E6BC")} alt="" className="size-full object-cover" />}
      />
      <LimitPanel title="Plugfolio never holds your money">
        The retailer&apos;s network pays you directly. There is no balance here to withdraw, no
        payout schedule to wait on, and nothing for us to freeze.
      </LimitPanel>
    </div>
  ),
};

/**
 * for-business: a brief as a piece of paper, one thread as a *shape* rather
 * than a screenshot, and the exclusions said out loud.
 */
export const ForBusiness: Story = {
  render: () => (
    <div className="max-w-[560px]">
      <BriefCard eyebrow="Open brief" title="Two reels for a launch week">
        Skincare, India, 10–50k followers. Product provided, plus a fee we agree in the thread.
      </BriefCard>
      <CollabThread>
        <CollabBubble>Two posts and a story — is that within range?</CollabBubble>
        <CollabBubble from="you">It is. Can you cover the launch week?</CollabBubble>
        <CollabBubble>Yes. Sending dates now.</CollabBubble>
        <CollabBubble from="deal">Terms agreed</CollabBubble>
      </CollabThread>
      <Exclusions title="What Plugfolio deliberately isn't">
        <li>No media kits or campaign suites — briefs and threads, nothing heavier.</li>
        <li>No on-platform payments, escrow or invoicing.</li>
        <li>No creator-to-creator collabs.</li>
      </Exclusions>
    </div>
  ),
};

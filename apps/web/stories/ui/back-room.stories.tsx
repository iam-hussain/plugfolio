import type { Meta, StoryObj } from "@storybook/react";
import {
  ActiveProfile,
  Avatar,
  AvatarFallback,
  Button,
  CategoryRow,
  CategoryRows,
  CollabRow,
  CollabRows,
  ConnectedAs,
  Connection,
  ConnectionChannel,
  Connections,
  DangerZone,
  DashCard,
  DashCardAction,
  DashCardHead,
  DashCardNote,
  DashCardTitle,
  DashField,
  DashFieldPair,
  DashFieldRow,
  EmptyState,
  FilterButton,
  Filters,
  Hint,
  IconAction,
  IconActions,
  Input,
  ManagerRow,
  MetaDot,
  MetaWarn,
  Nudge,
  PageHead,
  PageHeadActions,
  PageHeadTitle,
  Pill,
  PostRow,
  PostRowActions,
  PostRowCount,
  PostRowLink,
  PostRows,
  ProductRow,
  ProductRows,
  ProfileChip,
  ProfileChips,
  Provenance,
  RankKey,
  RankList,
  RankRow,
  SocialGlyph,
  Stat,
  StatDerivation,
  StatUnit,
  Stats,
  Switch,
  SwitchLabel,
  TrafficColumns,
} from "@plugfolio/ui";
import { ChevronDown, ChevronUp, Eye, Pencil, ShoppingBag, Trash2 } from "lucide-react";

/**
 * THE BACK ROOM (DESIGN dashboard.html) — the creator's dashboard.
 *
 * Operate mode, not Express mode: dense rows, visible labels, edits that save
 * where you made them. None of it is ever seen by a shopper, which is why it
 * looks nothing like the public surface — that one is a photograph with a
 * price pinned to it; this is a list you scan.
 *
 * Every story here renders the body alone; the shell (mark, profile switcher,
 * tab row) comes from the dashboard layout.
 */
const meta = {
  title: "UI/Back room",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const avatar = (initial: string, size = "size-7") => (
  <Avatar className={`${size} flex-none`}>
    <AvatarFallback className="bg-active text-primary text-[10px] font-bold">
      {initial}
    </AvatarFallback>
  </Avatar>
);

const thumb = <span className="bg-active rounded-image size-[54px] flex-none" />;
const square = <span className="bg-active rounded-image size-[52px] flex-none" />;

/** The page header every tab wears: eyebrow, headline, at most a couple of actions. */
export const PageHeader: Story = {
  render: () => (
    <PageHead>
      <PageHeadTitle eyebrow="@mayamoves">Posts</PageHeadTitle>
      <PageHeadActions>
        <Button>Add post</Button>
      </PageHeadActions>
    </PageHead>
  ),
};

/** Home: the profile you're editing, and the one thing that needs doing. */
export const Home: Story = {
  render: () => (
    <>
      <DashCard>
        <ActiveProfile
          avatar={avatar("M", "size-[60px]")}
          handle="@mayamoves"
          url="plugfolio.com/mayamoves"
          action={<Button variant="outline">View page</Button>}
        />
        <Nudge action={<Button>Tag them</Button>}>
          <b>3 posts have no products tagged.</b> Tag them to make those posts shoppable.
        </Nudge>
      </DashCard>

      <DashCard>
        <DashCardHead>
          <DashCardTitle>Profiles</DashCardTitle>
          <DashCardNote>3 of 5</DashCardNote>
          <DashCardAction>
            <Button variant="outline">New profile</Button>
          </DashCardAction>
        </DashCardHead>
        <ProfileChips>
          <ProfileChip current avatar={avatar("M")}>
            @mayamoves
          </ProfileChip>
          <ProfileChip avatar={avatar("F")}>@mayamoves.fit</ProfileChip>
          <ProfileChip avatar={avatar("R")} role="manager">
            @rheamakes
          </ProfileChip>
        </ProfileChips>
      </DashCard>

      <DashCard>
        <DashCardHead>
          <DashCardTitle>Connections</DashCardTitle>
        </DashCardHead>
        <Hint>
          Connect at least one to create a profile. This is how a username stays yours — you can
          only connect an account you own.
        </Hint>
        <Connections>
          <Connection
            icon={<SocialGlyph platform="youtube" />}
            name="Google · YouTube"
            status={<ConnectedAs>Connected</ConnectedAs>}
            action={
              <Button variant="outline" className="text-micro min-h-10 flex-none px-4 py-2.5">
                Reconnect
              </Button>
            }
            channels={
              <>
                <ConnectionChannel>@mayamoves · 48.2K</ConnectionChannel>
                <ConnectionChannel>@mayamovesfit · 6.1K</ConnectionChannel>
              </>
            }
          />
          <Connection
            icon={<SocialGlyph platform="instagram" />}
            name="Meta · Instagram"
            status="Coming next — no gateway yet"
            action={
              <Button
                variant="outline"
                disabled
                className="text-micro min-h-10 flex-none px-4 py-2.5"
              >
                Connect
              </Button>
            }
          />
        </Connections>
      </DashCard>
    </>
  ),
};

/**
 * Traffic. Views and taps are never shown apart: 1,284 taps sounds enormous
 * until you see 20,410 views, and 20,410 views sounds like reach until you see
 * how few moved. The rate between them is the one a creator can act on.
 */
export const Traffic: Story = {
  render: () => (
    <DashCard>
      <DashCardHead>
        <DashCardTitle>Traffic · @mayamoves</DashCardTitle>
        <DashCardNote>All time</DashCardNote>
      </DashCardHead>
      <Stats>
        <Stat
          label="Views"
          value="20,410"
          provenance={<Provenance kind="tracked">Tracked</Provenance>}
        >
          Your page, posts and product pages opening.
        </Stat>
        <Stat
          label="Taps"
          value="1,284"
          provenance={<Provenance kind="tracked">Tracked</Provenance>}
        >
          Someone leaving for a retailer.
        </Stat>
        <Stat
          label="Tap-through"
          value={
            <>
              6.3
              <StatUnit>%</StatUnit>
            </>
          }
          provenance={<StatDerivation>taps ÷ views</StatDerivation>}
        >
          Of everyone who looked, this many went to buy.
        </Stat>
      </Stats>

      <TrafficColumns>
        <div>
          <DashCardHead className="mb-0">
            <DashCardTitle className="text-label">By post</DashCardTitle>
            <RankKey>views · taps</RankKey>
          </DashCardHead>
          <RankList>
            <RankRow title="The desk reset" secondary="4,880" value="312" />
            <RankRow title="Gym kit that lasted a year" secondary="4,101" value="268" />
            <RankRow title="Untitled post" gone secondary="1,900" value="96" />
          </RankList>
        </div>
        <div>
          <DashCardHead className="mb-0">
            <DashCardTitle className="text-label">By product</DashCardTitle>
            <RankKey>views · taps</RankKey>
          </DashCardHead>
          <RankList>
            <RankRow title="Warm-white desk lamp" secondary="3,120" value="274" />
            <RankRow title="Brightening serum" secondary="2,740" value="221" />
          </RankList>
        </div>
      </TrafficColumns>

      <div className="mt-[22px]">
        <Stat
          label="Code copies"
          value="146"
          provenance={<Provenance kind="untracked">Redemption not tracked</Provenance>}
        >
          Copies are counted here. Whether a code was used happens on the retailer&rsquo;s side,
          where Plugfolio cannot see it — so this page never claims it did.
        </Stat>
      </div>
    </DashCard>
  ),
};

/**
 * Posts, as a list. The grid showed the photograph, which the creator already
 * recognises; what they came to check is in words, and words want rows.
 */
export const Posts: Story = {
  render: () => (
    <>
      <Filters>
        <FilterButton current>All</FilterButton>
        <FilterButton>Tagged</FilterButton>
        <FilterButton>Untagged</FilterButton>
      </Filters>
      <PostRows>
        <PostRow>
          <PostRowLink
            thumbnail={thumb}
            title="The desk reset"
            meta={
              <>
                <Pill tone="shelf">Desk setup</Pill>
                <PostRowCount>
                  <ShoppingBag aria-hidden />4 products
                </PostRowCount>
              </>
            }
          />
          <PostRowActions>
            <Switch checked className="h-6 w-[42px] [&_[data-slot=switch-thumb]]:size-[18px]" />
            <SwitchLabel>On page</SwitchLabel>
            <IconAction label="Edit this post">
              <Pencil aria-hidden />
            </IconAction>
          </PostRowActions>
        </PostRow>
        <PostRow>
          <PostRowLink
            thumbnail={thumb}
            title="Beach day"
            meta={<Pill tone="untagged">Untagged</Pill>}
          />
          <PostRowActions>
            <Switch checked className="h-6 w-[42px] [&_[data-slot=switch-thumb]]:size-[18px]" />
            <SwitchLabel>On page</SwitchLabel>
            <IconAction label="Edit this post">
              <Pencil aria-hidden />
            </IconAction>
          </PostRowActions>
        </PostRow>
        {/* A hidden post is dimmed, not removed: still yours, still listed,
            still editable — only its public URL is gone. */}
        <PostRow hidden>
          <PostRowLink thumbnail={thumb} title="An old one" meta={<Pill tone="shelf">Skin</Pill>} />
          <PostRowActions>
            <Switch className="h-6 w-[42px] [&_[data-slot=switch-thumb]]:size-[18px]" />
            <SwitchLabel>Hidden</SwitchLabel>
            <IconAction label="Edit this post">
              <Pencil aria-hidden />
            </IconAction>
          </PostRowActions>
        </PostRow>
      </PostRows>
    </>
  ),
};

/** The product library: a list you scan, never a CRM. The product page edits. */
export const Products: Story = {
  render: () => (
    <>
      <DashFieldRow className="mb-[18px] mt-0" role="search">
        <label className="min-w-0 flex-[1_1_220px]">
          <span className="sr-only">Search products</span>
          <Input type="search" placeholder="Search your products…" />
        </label>
        <Button variant="outline">Search</Button>
      </DashFieldRow>
      <ProductRows>
        <ProductRow
          image={square}
          title="Brightening serum"
          price="₹1,299"
          badges={<Pill tone="code">Code SAVE30</Pill>}
          meta={
            <>
              <span>Affiliate · opens nykaa.com</span>
              <MetaDot />
              <span>Skin</span>
              <MetaDot />
              <span>on 2 posts</span>
            </>
          }
          action={
            <IconAction label="Edit this product">
              <Pencil aria-hidden />
            </IconAction>
          }
        />
        <ProductRow
          image={square}
          title="Court trainers"
          price="$32.00"
          badges={
            <>
              <Pill tone="own">Their own</Pill>
              <Pill tone="code">Code MAYA15</Pill>
            </>
          }
          meta={
            <>
              <span>Own store · opens mayarao.co</span>
              <MetaDot />
              <span>No shelf</span>
              <MetaDot />
              <span>on 1 post</span>
            </>
          }
          action={
            <IconAction label="Edit this product">
              <Pencil aria-hidden />
            </IconAction>
          }
        />
        <ProductRow
          image={square}
          title="Keychron K3 Pro"
          badges={<Pill tone="none">No price</Pill>}
          meta={
            <>
              <span>In-store only · no link</span>
              <MetaDot />
              <span>Desk setup</span>
              <MetaDot />
              {/* A fact worth noticing, not an error — the product still works. */}
              <MetaWarn>not on any post</MetaWarn>
            </>
          }
          action={
            <IconAction label="Edit this product">
              <Pencil aria-hidden />
            </IconAction>
          }
        />
      </ProductRows>
    </>
  ),
};

/** Shelves: add, reorder, rename, delete — with what each one would loosen. */
export const Categories: Story = {
  render: () => (
    <>
      <DashCard>
        <DashCardHead>
          <DashCardTitle>Add a shelf</DashCardTitle>
        </DashCardHead>
        <DashFieldRow className="mt-0">
          <label className="min-w-0 flex-[1_1_220px]">
            <span className="sr-only">Shelf title</span>
            <Input placeholder="Title — e.g. Desk setup" />
          </label>
          <label className="min-w-0 flex-[1_1_220px]">
            <span className="sr-only">Shelf description</span>
            <Input placeholder="Description (optional)" />
          </label>
          <Button>Add</Button>
        </DashFieldRow>
      </DashCard>
      <div className="mt-3.5">
        <CategoryRows>
          {["Desk setup", "Gym", "Skin"].map((title, index) => (
            <CategoryRow
              key={title}
              handle={
                <span className="flex flex-none flex-col">
                  <IconAction label={`Move ${title} up`} className="size-6" disabled={index === 0}>
                    <ChevronUp aria-hidden />
                  </IconAction>
                  <IconAction
                    label={`Move ${title} down`}
                    className="size-6"
                    disabled={index === 2}
                  >
                    <ChevronDown aria-hidden />
                  </IconAction>
                </span>
              }
              title={title}
              description={index === 0 ? "Everything on and around the desk" : undefined}
              counts={`${6 - index * 2} posts · ${11 - index * 3} products`}
              actions={
                <IconActions>
                  <IconAction label={`Rename ${title}`}>
                    <Pencil aria-hidden />
                  </IconAction>
                  <IconAction tone="danger" label={`Delete ${title}`}>
                    <Trash2 aria-hidden />
                  </IconAction>
                </IconActions>
              }
            />
          ))}
        </CategoryRows>
      </div>
    </>
  ),
};

/**
 * Collabs: the list, not the thread. Payment is never shown here because it
 * never happens here — it settles off-platform, and this says so rather than
 * implying an escrow.
 */
export const Collabs: Story = {
  render: () => (
    <>
      <Filters>
        <FilterButton current count={4}>
          All
        </FilterButton>
        <FilterButton count={2}>Needs a reply</FilterButton>
        <FilterButton>Agreed</FilterButton>
      </Filters>
      <CollabRows>
        <CollabRow
          avatar={avatar("F", "size-11")}
          name="Fold & Co"
          status={<Pill tone="new">Needs a reply</Pill>}
          summary="Two posts and a story for a spring launch."
          meta="Direct request · 2 days ago"
          action={
            <IconAction label="Open this collab thread">
              <Eye aria-hidden />
            </IconAction>
          }
        />
        <CollabRow
          avatar={avatar("H", "size-11")}
          name="Hearth Home"
          status={<Pill tone="agreed">Terms agreed</Pill>}
          summary="One post, launch week. Agreed on dates and scope."
          meta="Direct request · 1 week ago · payment settles off-platform"
          action={
            <IconAction label="Open this collab thread">
              <Eye aria-hidden />
            </IconAction>
          }
        />
        <CollabRow
          closed
          avatar={avatar("N", "size-11")}
          name="Northline"
          status={<Pill tone="closed">Closed</Pill>}
          summary="Couldn't agree on timing. No hard feelings."
          meta="From the brief board · 3 weeks ago"
          action={
            <IconAction label="Open this collab thread">
              <Eye aria-hidden />
            </IconAction>
          }
        />
      </CollabRows>
    </>
  ),
};

/**
 * Settings. The Admin/Manager boundary is SHOWN, never silently hidden: a
 * Manager sees the field, sees the label saying it's Admin-only, and sees it
 * disabled. Hiding it would leave them wondering what they're missing.
 */
export const Settings: Story = {
  render: () => (
    <>
      <DashCard>
        <DashCardHead>
          <DashCardTitle>Public profile</DashCardTitle>
        </DashCardHead>
        <Hint>
          Your page lives at <b>plugfolio.com/mayamoves</b>. The username is fixed for now.
        </Hint>
        <DashFieldPair>
          <DashField
            label="Picture URL"
            htmlFor="pic"
            note="Paste an image URL. Uploads are not in v1."
          >
            <Input id="pic" type="url" defaultValue="https://images.plugfolio.com/maya.jpg" />
          </DashField>
          <DashField label="Display name" hint="· Admin only" htmlFor="dname">
            <Input id="dname" defaultValue="Maya Rao" disabled />
          </DashField>
        </DashFieldPair>
        <Button>Save profile</Button>
      </DashCard>

      <DashCard>
        <DashCardHead>
          <DashCardTitle>Managers</DashCardTitle>
          <DashCardNote>2 of 3</DashCardNote>
        </DashCardHead>
        <Hint>Up to 3 people who can post and tag. Settings and connections stay yours.</Hint>
        <ManagerRow
          name="Nia Okafor"
          email="nia@email.com"
          action={
            <IconAction tone="danger" label="Remove this Manager">
              <Trash2 aria-hidden />
            </IconAction>
          }
        />
        <ManagerRow
          name="Arjun Mehta"
          email="arjun@email.com"
          action={
            <IconAction tone="danger" label="Remove this Manager">
              <Trash2 aria-hidden />
            </IconAction>
          }
        />
      </DashCard>

      <DashCard>
        <DangerZone
          title="Delete this profile"
          action={<Button variant="destructive">Delete @mayamoves</Button>}
        >
          The page, its posts, products and traffic history disappear. This can&rsquo;t be undone,
          and it frees one of your five profile slots.
        </DangerZone>
      </DashCard>
    </>
  ),
};

/** Nothing here yet. Dashed, because a solid border reads as a card that failed to load. */
export const Empty: Story = {
  render: () => (
    <EmptyState title="No products yet" action={<Button>Add a product</Button>}>
      Add one here, or connect one while editing a post. Either way it lands in this list.
    </EmptyState>
  ),
};

import type { Meta, StoryObj } from "@storybook/react";
import { Button, PageHeader, SearchField } from "@plugfolio/ui";
import { Download } from "lucide-react";

/**
 * UI Kit · PageHeader — the Admin list-screen header: Sora title + optional
 * subtitle, right-aligned filter/search/export row.
 */
const meta: Meta<typeof PageHeader> = {
  title: "UI Kit/PageHeader",
  component: PageHeader,
};
export default meta;
type Story = StoryObj<typeof PageHeader>;

export const WithSearchRow: Story = {
  render: () => (
    <div className="w-[900px]">
      <PageHeader title="Comments" subtitle="Newest-first moderation stream.">
        <SearchField placeholder="Search text / author / page" className="w-[260px]" />
        <Button size="xs" variant="outline-strong">
          Search
        </Button>
        <Button size="xs" variant="ghost-muted">
          <Download aria-hidden className="size-[15px]" /> Export CSV
        </Button>
      </PageHeader>
    </div>
  ),
};

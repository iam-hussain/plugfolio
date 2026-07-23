import type { Meta, StoryObj } from "@storybook/react";
import { SocialsRow } from "@/features/creator-page";

/**
 * Creator page · Socials row (Dev Spec §06, required): Instagram · YouTube ·
 * TikTok · Facebook · personal website, authored in dashboard Settings.
 */
const meta: Meta<typeof SocialsRow> = {
  title: "Creator page/Socials row",
  component: SocialsRow,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof SocialsRow>;

export const AllPlatforms: Story = {
  args: {
    links: [
      { platform: "instagram", href: "https://instagram.com/ana", label: "Instagram" },
      { platform: "youtube", href: "https://youtube.com/@ana", label: "YouTube" },
      { platform: "tiktok", href: "https://tiktok.com/@ana", label: "TikTok" },
      { platform: "facebook", href: "https://facebook.com/ana", label: "Facebook" },
      { platform: "website", href: "https://ana.example.com", label: "Website" },
    ],
  },
};

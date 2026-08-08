import type { Meta, StoryObj } from "@storybook/react";
import { ProductThumb } from "@plugfolio/ui";

/**
 * The small square still used in dense dashboard rows (a post's cover, a
 * product's image). Two states reshape it: a cover image, and the `ImageOff`
 * placeholder when there is none — shown here at both sizes.
 */
const cover =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='120' height='120' fill='%237C3AED'/></svg>`,
  );

const meta: Meta<typeof ProductThumb> = {
  title: "Dashboard/ProductThumb",
  component: ProductThumb,
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof ProductThumb>;

export const WithImage: Story = { args: { src: cover, size: "md" } };
export const Placeholder: Story = { args: { src: null, size: "md" } };
export const Small: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <ProductThumb src={cover} size="sm" />
      <ProductThumb src={null} size="sm" />
    </div>
  ),
};

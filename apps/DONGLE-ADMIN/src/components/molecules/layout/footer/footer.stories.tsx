import type { Meta, StoryObj } from "@storybook/nextjs";
import type { ReactElement } from "react";
import Footer from "./footer";

const meta: Meta<typeof Footer> = {
  title: "layout/footer/Footer",
  component: Footer,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story: () => ReactElement) => (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1"></div>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

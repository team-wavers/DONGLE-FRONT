import type { Meta, StoryObj } from "@storybook/nextjs";
import ClubCard from "./club-card";

const meta: Meta<typeof ClubCard> = {
  title: "molecules/card/ClubCard",
  component: ClubCard,
  tags: ["autodocs"],
  args: {
    name: "코딩동아리",
    category: "학술분과",
    president: "홍길동",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

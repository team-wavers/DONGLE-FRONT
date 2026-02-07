import type { Meta, StoryObj } from "@storybook/nextjs";
import CategoryBadge from "./category-badge";

const meta: Meta<typeof CategoryBadge> = {
  title: "Atoms/CategoryBadge",
  component: CategoryBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    category: {
      control: { type: "select" },
      options: ["학술", "문화", "체육", "봉사", "종교", "기타"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const 학술: Story = {
  args: {
    category: "학술",
  },
};

export const 문화: Story = {
  args: {
    category: "문화",
  },
};

export const 체육: Story = {
  args: {
    category: "체육",
  },
};

export const 봉사: Story = {
  args: {
    category: "봉사",
  },
};

export const 종교: Story = {
  args: {
    category: "종교",
  },
};

export const 기타: Story = {
  args: {
    category: "기타",
  },
};

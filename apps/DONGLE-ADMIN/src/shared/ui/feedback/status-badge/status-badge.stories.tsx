import type { Meta, StoryObj } from "@storybook/nextjs";
import { StatusBadge } from "./status-badge";

const meta: Meta<typeof StatusBadge> = {
  title: "Atoms/StatusBadge",
  component: StatusBadge,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    status: {
      control: "select",
      options: ["recruiting", "closed"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Recruiting: Story = {
  args: {
    status: "recruiting",
  },
};

export const Closed: Story = {
  args: {
    status: "closed",
  },
};

export const CustomText: Story = {
  args: {
    status: "recruiting",
    customText: "신입생 모집중",
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status="recruiting" />
      <StatusBadge status="closed" />
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="w-80 p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">프로그래밍 동아리</h3>
        <StatusBadge status="recruiting" />
      </div>
      <p className="text-sm text-gray-600">컴퓨터공학과 학술분과</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm">모집기간: 2024.03.01 ~ 2024.03.15</span>
        <StatusBadge status="recruiting" customText="운영중" />
      </div>
    </div>
  ),
};

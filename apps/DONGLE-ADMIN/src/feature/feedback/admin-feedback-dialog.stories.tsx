import type { Meta, StoryObj } from "@storybook/nextjs";
import AdminFeedbackDialog from "./admin-feedback-dialog";

const meta = {
    title: "feature/feedback/AdminFeedbackDialog",
    component: AdminFeedbackDialog,
    parameters: {
        layout: "centered",
    },
    args: {
        role: "club-president",
        clubId: "123",
    },
} satisfies Meta<typeof AdminFeedbackDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

import type { Meta, StoryObj } from "@storybook/nextjs";
import AdminFeedbackDialog from "./admin-feedback-dialog";

const meta: Meta<typeof AdminFeedbackDialog> = {
    title: "Feature/Feedback/AdminFeedbackDialog",
    component: AdminFeedbackDialog,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Admin: Story = {
    args: {
        role: "admin",
    },
};

export const President: Story = {
    args: {
        role: "president",
        clubId: "1",
    },
};

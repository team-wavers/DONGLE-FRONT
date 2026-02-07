import type { Meta, StoryObj } from "@storybook/nextjs";
import ActivityReportForm from "./activity-report-form";

const meta: Meta<typeof ActivityReportForm> = {
    title: "Molecules/Form/ActivityReportForm",
    component: ActivityReportForm,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

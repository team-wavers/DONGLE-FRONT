import type { Meta, StoryObj } from "@storybook/nextjs";
import ClubForm from "./club-form";

const meta: Meta<typeof ClubForm> = {
    title: "Molecules/Form/ClubForm",
    component: ClubForm,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

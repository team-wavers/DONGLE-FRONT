import type { Meta, StoryObj } from "@storybook/nextjs";
import LoginForm from "./login-form";

const meta: Meta<typeof LoginForm> = {
  title: "Molecules/Form/LoginForm",
  component: LoginForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

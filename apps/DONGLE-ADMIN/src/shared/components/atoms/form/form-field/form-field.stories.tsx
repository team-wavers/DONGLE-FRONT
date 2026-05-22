import type { Meta, StoryObj } from "@storybook/nextjs";
import { FormField } from "./form-field";
import { Mail, User, Phone } from "lucide-react";

const meta: Meta<typeof FormField> = {
  title: "Atoms/FormField",
  component: FormField,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "tel", "number", "date"],
    },
    required: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "이름",
    placeholder: "이름을 입력하세요",
  },
};

export const Required: Story = {
  args: {
    label: "이메일",
    type: "email",
    placeholder: "example@email.com",
    required: true,
  },
};

export const WithIcon: Story = {
  args: {
    label: "사용자명",
    placeholder: "사용자명을 입력하세요",
    icon: <User className="h-4 w-4" />,
    required: true,
  },
};

export const WithDescription: Story = {
  args: {
    label: "비밀번호",
    type: "password",
    placeholder: "비밀번호를 입력하세요",
    description: "8자 이상, 영문과 숫자를 포함해주세요",
    required: true,
  },
};

export const WithError: Story = {
  args: {
    label: "이메일",
    type: "email",
    placeholder: "example@email.com",
    defaultValue: "invalid-email",
    error: "올바른 이메일 형식이 아닙니다",
    icon: <Mail className="h-4 w-4" />,
    required: true,
  },
};

export const WithSuccess: Story = {
  args: {
    label: "이메일",
    type: "email",
    placeholder: "example@email.com",
    defaultValue: "user@example.com",
    success: "사용 가능한 이메일입니다",
    icon: <Mail className="h-4 w-4" />,
    required: true,
  },
};

export const PhoneNumber: Story = {
  args: {
    label: "연락처",
    type: "tel",
    placeholder: "010-0000-0000",
    icon: <Phone className="h-4 w-4" />,
    required: true,
  },
};

export const FormExample: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <FormField
        id="name"
        label="이름"
        placeholder="이름을 입력하세요"
        icon={<User className="h-4 w-4" />}
        required
      />
      <FormField
        id="email"
        label="이메일"
        type="email"
        placeholder="example@email.com"
        icon={<Mail className="h-4 w-4" />}
        required
      />
      <FormField
        id="phone"
        label="연락처"
        type="tel"
        placeholder="010-0000-0000"
        icon={<Phone className="h-4 w-4" />}
        required
      />
      <FormField
        id="birthday"
        label="생년월일"
        type="date"
        description="선택사항입니다"
      />
    </div>
  ),
};

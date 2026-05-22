import type { Meta, StoryObj } from "@storybook/nextjs";
import { FormDatePicker } from "./form-datepicker";
import { Calendar, Clock } from "lucide-react";

const meta: Meta<typeof FormDatePicker> = {
  title: "Atoms/Form/FormDatePicker",
  component: FormDatePicker,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "날짜 선택 필드의 라벨",
    },
    id: {
      control: "text",
      description: "고유 식별자",
    },
    required: {
      control: "boolean",
      description: "필수 필드 여부",
    },
    description: {
      control: "text",
      description: "필드 설명 텍스트",
    },
    error: {
      control: "text",
      description: "에러 메시지",
    },
    success: {
      control: "text",
      description: "성공 메시지",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "날짜 선택",
    id: "date-picker",
  },
};

export const WithIcon: Story = {
  args: {
    label: "활동 날짜",
    id: "activity-date",
    icon: <Calendar className="w-4 h-4" />,
    description: "동아리 활동이 진행된 날짜를 선택해주세요.",
  },
};

export const Required: Story = {
  args: {
    label: "생년월일",
    id: "birth-date",
    required: true,
    icon: <Clock className="w-4 h-4" />,
    description: "회원가입을 위해 생년월일을 입력해주세요.",
  },
};

export const WithError: Story = {
  args: {
    label: "시작 날짜",
    id: "start-date",
    error: "시작 날짜는 종료 날짜보다 이전이어야 합니다.",
  },
};

export const WithSuccess: Story = {
  args: {
    label: "완료 날짜",
    id: "completion-date",
    success: "날짜가 성공적으로 설정되었습니다.",
  },
};

export const NoLabel: Story = {
  args: {
    id: "date-only",
  },
};

export const WithLongDescription: Story = {
  args: {
    label: "프로젝트 마감일",
    id: "deadline",
    icon: <Calendar className="w-4 h-4" />,
    description:
      "프로젝트의 최종 마감일을 설정해주세요. 이 날짜는 변경할 수 없으며, 마감일 이후에는 제출이 불가능합니다.",
    required: true,
  },
};

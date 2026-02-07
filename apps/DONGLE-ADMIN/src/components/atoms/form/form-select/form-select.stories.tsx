import type { Meta, StoryObj } from "@storybook/nextjs";
import { FormSelect } from "./form-select";
import { MapPin, Users, Building } from "lucide-react";

const meta: Meta<typeof FormSelect> = {
  title: "Atoms/FormSelect",
  component: FormSelect,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    required: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const departmentOptions = [
  { value: "academic", label: "학술분과" },
  { value: "culture", label: "문화분과" },
  { value: "sports", label: "체육분과" },
  { value: "volunteer", label: "봉사분과" },
  { value: "hobby", label: "취미분과" },
];

const statusOptions = [
  { value: "recruiting", label: "모집중" },
  { value: "closed", label: "모집마감" },
  { value: "pending", label: "모집예정" },
];

export const Default: Story = {
  args: {
    label: "분과",
    placeholder: "분과를 선택하세요",
    options: departmentOptions,
  },
};

export const Required: Story = {
  args: {
    label: "모집여부",
    placeholder: "모집 상태를 선택하세요",
    options: statusOptions,
    required: true,
  },
};

export const WithIcon: Story = {
  args: {
    label: "분과",
    placeholder: "분과를 선택하세요",
    options: departmentOptions,
    icon: <MapPin className="h-4 w-4" />,
    required: true,
  },
};

export const WithDescription: Story = {
  args: {
    label: "동아리 분과",
    placeholder: "해당하는 분과를 선택하세요",
    options: departmentOptions,
    description: "동아리 활동 성격에 맞는 분과를 선택해주세요",
    icon: <Building className="h-4 w-4" />,
    required: true,
  },
};

export const WithError: Story = {
  args: {
    label: "모집여부",
    placeholder: "모집 상태를 선택하세요",
    options: statusOptions,
    error: "모집 상태를 선택해주세요",
    icon: <Users className="h-4 w-4" />,
    required: true,
  },
};

export const WithSuccess: Story = {
  args: {
    label: "분과",
    placeholder: "분과를 선택하세요",
    options: departmentOptions,
    value: "academic",
    success: "분과가 선택되었습니다",
    icon: <MapPin className="h-4 w-4" />,
    required: true,
  },
};

export const FormExample: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <FormSelect
        label="모집여부"
        placeholder="모집 상태를 선택하세요"
        options={statusOptions}
        icon={<Users className="h-4 w-4" />}
        required
      />
      <FormSelect
        label="분과"
        placeholder="분과를 선택하세요"
        options={departmentOptions}
        icon={<MapPin className="h-4 w-4" />}
        required
      />
      <FormSelect
        label="건물"
        placeholder="건물을 선택하세요"
        options={[
          { value: "engineering", label: "공학관" },
          { value: "liberal", label: "인문관" },
          { value: "student", label: "학생회관" },
          { value: "library", label: "도서관" },
        ]}
        icon={<Building className="h-4 w-4" />}
        description="동아리방이 위치한 건물을 선택하세요"
      />
    </div>
  ),
};

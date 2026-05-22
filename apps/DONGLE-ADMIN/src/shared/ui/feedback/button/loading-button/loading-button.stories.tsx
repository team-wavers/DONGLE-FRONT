"use client";

import React from "react";

import type { Meta, StoryObj } from "@storybook/nextjs";
import { LoadingButton } from "./loading-button";
import { Mail } from "lucide-react";

const meta: Meta<typeof LoadingButton> = {
  title: "Atoms/LoadingButton",
  component: LoadingButton,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    loading: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "버튼",
    loading: false,
  },
};

export const Loading: Story = {
  args: {
    children: "저장하기",
    loading: true,
    loadingText: "저장 중...",
  },
};

export const CustomLoadingText: Story = {
  args: {
    children: "업로드",
    loading: true,
    loadingText: "파일 업로드 중...",
  },
};

export const LoadingWithIcon: Story = {
  args: {
    children: (
      <>
        <Mail className="mr-2 h-4 w-4" />
        이메일 보내기
      </>
    ),
    loading: true,
    loadingText: "전송 중...",
  },
};

const InteractiveComponent = () => {
  const [loading, setLoading] = React.useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <LoadingButton
      loading={loading}
      onClick={handleClick}
      loadingText="처리 중..."
    >
      클릭해보세요
    </LoadingButton>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveComponent />,
};

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <LoadingButton>기본</LoadingButton>
      <LoadingButton loading>로딩 중</LoadingButton>
      <LoadingButton disabled>비활성화</LoadingButton>
    </div>
  ),
};

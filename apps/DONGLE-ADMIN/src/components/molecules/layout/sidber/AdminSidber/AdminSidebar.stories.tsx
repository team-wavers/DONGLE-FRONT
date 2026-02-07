import type { Meta, StoryObj } from "@storybook/nextjs";
import { SidebarProvider } from "@dongle/ui/sidebar";
import AdminSidber from "./AdminSideber";

const meta: Meta<typeof AdminSidber> = {
    title: "layout/dashboard/AdminSidber",
    component: AdminSidber,
    parameters: {
        layout: "fullscreen", // 사이드바는 전체 화면에서 보는 것이 좋습니다
    },
    tags: ["autodocs"],
    argTypes: {
        role: {
            control: "select",
            options: ["club", "admin"],
            description: "사용자 역할",
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 동아리 관리자 대시보드
export const ClubManager: Story = {
    args: {
        role: "club",
    },
    parameters: {
        docs: {
            description: {
                story: "동아리 관리자용 대시보드입니다. 홈, 동아리 정보 관리, 활동보고서 관리 메뉴를 포함합니다.",
            },
        },
    },
    render: () => (
        <SidebarProvider>
            <AdminSidber />
        </SidebarProvider>
    ),
};

// 시스템 관리자 대시보드
export const SystemAdmin: Story = {
    args: {
        role: "admin",
    },
    parameters: {
        docs: {
            description: {
                story: "시스템 관리자용 대시보드입니다. 홈, 동아리 관리 메뉴를 포함합니다.",
            },
        },
    },
    render: () => (
        <SidebarProvider>
            <AdminSidber />
        </SidebarProvider>
    ),
};

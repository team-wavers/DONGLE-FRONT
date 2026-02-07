import type { Meta, StoryObj } from "@storybook/nextjs";
import ReportCard from "../../../../feature/report/components/report-card/report-card";

const meta: Meta<typeof ReportCard> = {
    title: "Molecules/ReportCard",
    component: ReportCard,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {
        title: {
            control: { type: "text" },
        },
        createdDate: {
            control: { type: "text" },
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: "2024년 1월 활동 보고서",
        createdDate: "2024-01-31",
    },
};

// 긴 제목과 설명
export const LongContent: Story = {
    args: {
        title: "매우 긴 제목을 가진 활동 보고서입니다. 이 제목은 매우 길어서 여러 줄에 걸쳐 표시될 수 있습니다.",
        createdDate: "2024-01-31",
    },
};

export const Grid: Story = {
    render: () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 max-w-6xl">
            <ReportCard title="2024년 1월 활동 보고서" createdDate="2024-01-31" href="/1" />
            <ReportCard href="/2" title="2024년 2월 활동 보고서" createdDate="2024-02-29" />
            <ReportCard href="/3" title="2024년 3월 활동 보고서" createdDate="2024-03-31" />
            <ReportCard href="/4" title="2024년 4월 활동 보고서" createdDate="2024-04-30" />
            <ReportCard href="/5" title="2024년 5월 활동 보고서" createdDate="2024-05-31" />
            <ReportCard href="/6" title="2024년 6월 활동 보고서" createdDate="2024-06-30" />
        </div>
    ),
    parameters: {
        layout: "fullscreen",
    },
};

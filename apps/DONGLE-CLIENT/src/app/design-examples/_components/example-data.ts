import type { LucideIcon } from "lucide-react";
import { BookOpen, Dumbbell, HandHeart, Mic2, Mountain, Palette } from "lucide-react";

export type ExampleClub = {
    id: number;
    name: string;
    category: string;
    description: string;
    tags: string[];
    location: string;
    period: string;
    president: string;
    isRecruiting: boolean;
    accent: string;
    softAccent: string;
    icon: LucideIcon;
};

export const exampleClubs: ExampleClub[] = [
    {
        id: 1,
        name: "스파이크",
        category: "체육분과",
        description: "정기 훈련과 교류전을 함께하는 배구 동아리",
        tags: ["배구", "교류전", "초보환영"],
        location: "4층 405호",
        period: "2026.03.31 - 2026.04.12",
        president: "김민준",
        isRecruiting: true,
        accent: "bg-emerald-500",
        softAccent: "bg-emerald-50 text-emerald-700 border-emerald-100",
        icon: Dumbbell,
    },
    {
        id: 2,
        name: "메아리",
        category: "음악분과",
        description: "밴드 합주와 작은 공연을 준비하는 음악 동아리",
        tags: ["밴드", "합주", "공연"],
        location: "학생회관 B102",
        period: "상시 모집",
        president: "이서연",
        isRecruiting: true,
        accent: "bg-sky-500",
        softAccent: "bg-sky-50 text-sky-700 border-sky-100",
        icon: Mic2,
    },
    {
        id: 3,
        name: "하늘",
        category: "문예분과",
        description: "사진, 글, 전시를 통해 일상을 기록하는 창작 모임",
        tags: ["사진", "글쓰기", "전시"],
        location: "3층 라운지",
        period: "2026.04.01 - 2026.04.20",
        president: "박지후",
        isRecruiting: true,
        accent: "bg-rose-500",
        softAccent: "bg-rose-50 text-rose-700 border-rose-100",
        icon: Palette,
    },
    {
        id: 4,
        name: "IYF",
        category: "봉사분과",
        description: "지역 봉사와 캠페인을 기획하는 실천형 동아리",
        tags: ["봉사", "캠페인", "지역연계"],
        location: "2층 회의실",
        period: "2026.03.25 - 2026.04.05",
        president: "최하린",
        isRecruiting: true,
        accent: "bg-teal-500",
        softAccent: "bg-teal-50 text-teal-700 border-teal-100",
        icon: HandHeart,
    },
    {
        id: 5,
        name: "책갈피",
        category: "학술분과",
        description: "책을 읽고 토론하며 지식을 나누는 독서 동아리",
        tags: ["독서", "토론", "스터디"],
        location: "도서관 세미나실",
        period: "모집마감",
        president: "정도윤",
        isRecruiting: false,
        accent: "bg-amber-500",
        softAccent: "bg-amber-50 text-amber-800 border-amber-100",
        icon: BookOpen,
    },
    {
        id: 6,
        name: "산악회",
        category: "체육분과",
        description: "주말 산행과 야외 활동을 함께 즐기는 동아리",
        tags: ["산행", "아웃도어", "친목"],
        location: "운동장 집결",
        period: "모집마감",
        president: "윤태오",
        isRecruiting: false,
        accent: "bg-lime-600",
        softAccent: "bg-lime-50 text-lime-800 border-lime-100",
        icon: Mountain,
    },
];

export const featuredClub = exampleClubs[0];

export const categorySummaries = [
    { name: "체육분과", count: 11, tone: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    { name: "음악분과", count: 7, tone: "bg-sky-50 text-sky-700 border-sky-100" },
    { name: "문예분과", count: 8, tone: "bg-rose-50 text-rose-700 border-rose-100" },
    { name: "봉사분과", count: 6, tone: "bg-teal-50 text-teal-700 border-teal-100" },
    { name: "학술분과", count: 5, tone: "bg-amber-50 text-amber-800 border-amber-100" },
];

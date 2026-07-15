import type { Club } from "@dongle/types/club/club";
import type { ClubReport } from "@dongle/types/club/club.report";
import type { User } from "@dongle/types/user/user";
import { AUTH_ROLE } from "@dongle/types/auth/auth-role";

export const mockClubs = [
    {
        id: 1,
        name: "D-Maker",
        icon_url: null,
        is_recruiting: true,
        category: "학술분과",
        sns: {
            youtube: "https://www.youtube.com/dmaker",
            instagram: "https://www.instagram.com/dmaker",
        },
        tags: ["#개발", "#디자인"],
        recruit_start: "2024-08-01T00:00:00Z",
        recruit_end: "2024-08-31T23:59:59Z",
        description: "디자인과 개발을 함께하는 IT 동아리 D-Maker 입니다.",
        main_activities: "주 2회 스터디, 프로젝트 진행",
        apply_url: "https://forms.example.com/dmaker",
        location: "동국대학교",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2024-07-29T10:00:00Z",
        deleted_at: null,
        president: {
            id: 1,
            name: "홍길동",
            phone: "010-1234-5678",
        },
    },
    {
        id: 2,
        name: "Dongguk Creative",
        icon_url: null,
        is_recruiting: false,
        category: "문예분과",
        sns: {
            youtube: "https://www.youtube.com/donggukcreative",
            instagram: "https://www.instagram.com/donggukcreative",
        },
        tags: ["#광고", "#기획"],
        recruit_start: "2024-09-01T00:00:00Z",
        recruit_end: "2024-09-30T23:59:59Z",
        description: "동국 크리에이티브는 광고 및 기획 동아리입니다.",
        main_activities: "광고 공모전 참여, 아이디어 기획",
        apply_url: null,
        location: "동국대학교",
        created_at: "2023-02-01T00:00:00Z",
        updated_at: "2024-07-29T10:00:00Z",
        deleted_at: null,
        president: {
            id: 2,
            name: "김철수",
            phone: "010-2345-6789",
        },
    },
    {
        id: 3,
        name: "맛따라 멋따라",
        icon_url: null,
        is_recruiting: true,
        category: "체육분과",
        sns: {
            youtube: "https://www.youtube.com/matttara",
            instagram: "https://www.instagram.com/matttara",
        },
        tags: ["#맛집탐방"],
        recruit_start: "2024-10-01T00:00:00Z",
        recruit_end: "2024-10-31T23:59:59Z",
        description: "맛있는 음식을 찾아 떠나는 동아리입니다.",
        main_activities: "맛집 탐방, 요리 대회 참여",
        apply_url: null,
        location: "동국대학교",
        created_at: "2023-03-01T00:00:00Z",
        updated_at: "2024-07-29T10:00:00Z",
        deleted_at: null,
        president: {
            id: 3,
            name: "이영희",
            phone: "010-3456-7890",
        },
    },
] as const satisfies readonly Club[];

export const mockUsers = [
    {
        id: 1,
        name: "홍길동",
        login_id: "2020123456",
        password: "hashed_password",
        role: AUTH_ROLE.PRESIDENT,
        phone: "010-1234-5678",
        refresh_token: "mock-refresh-token",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2024-07-29T10:00:00Z",
        deleted_at: null,
        club: {
            id: 1,
            name: "D-Maker",
        },
    },
    {
        id: 2,
        name: "김철수",
        login_id: "admin",
        password: "hashed_password",
        role: AUTH_ROLE.ADMIN,
        phone: "010-9876-5432",
        refresh_token: "mock-refresh-token",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2024-07-29T10:00:00Z",
        deleted_at: null,
    },
] as const satisfies readonly User[];

export function mockReportsForClub(clubId: number): ClubReport[] {
    return [
        {
            id: 1,
            content: "D-Maker의 첫 번째 활동보고서입니다. React 스터디를 진행했습니다.",
            image_urls: [
                "https://s3.ap-northeast-2.amazonaws.com/dongle-mock/photo-1555066931-4365d14bab8c?w=500",
                "https://s3.ap-northeast-2.amazonaws.com/dongle-mock/photo-1551650975-87deedd944c3?w=500",
            ],
            title: "React 스터디 활동보고서",
            createdAt: "2024-07-15T10:00:00Z",
            updatedAt: "2024-07-15T10:00:00Z",
            deletedAt: null,
            club_id: clubId,
        },
        {
            id: 2,
            content: "D-Maker의 두 번째 활동보고서입니다. 프로젝트 발표회를 진행했습니다.",
            image_urls: [
                "https://s3.ap-northeast-2.amazonaws.com/dongle-mock/photo-1515187029135-18ee286d815b?w=500",
            ],
            title: "프로젝트 발표회 보고서",
            createdAt: "2024-07-20T14:30:00Z",
            updatedAt: "2024-07-20T14:30:00Z",
            deletedAt: null,
            club_id: clubId,
        },
    ];
}

export function findMockClub(id: number): Club {
    return mockClubs.find((club) => club.id === id) ?? { ...mockClubs[0], id };
}

export function findMockUser(id: number): User {
    return mockUsers.find((user) => user.id === id) ?? { ...mockUsers[0], id };
}

import { Building2, CalendarDays, Home, Image, UserPlus, Users } from "lucide-react";

export const MENU_CONFIG = {
    home: {
        name: "홈",
        href: "/admin",
        icon: Home,
    },
    club: {
        name: "동아리 관리",
        href: "/admin/club",
        icon: Building2,
    },
    clubRegister: {
        name: "동아리 등록",
        href: "/admin/club-register",
        icon: UserPlus,
    },
    banner: {
        name: "배너 관리",
        href: "/admin/banner",
        icon: Image,
    },
    schedule: {
        name: "일정 관리",
        href: "/admin/schedule",
        icon: CalendarDays,
    },
    user: {
        name: "사용자 관리",
        href: "/admin/user",
        icon: Users,
    },
};

export type DashboardRole = keyof typeof MENU_CONFIG;

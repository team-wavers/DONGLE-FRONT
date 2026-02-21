import { Building2, Home, Image, UserPlus, Users } from "lucide-react";
import { FileText } from "lucide-react";

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
  report: {
    name: "활동 보고서",
    href: "/admin/report",
    icon: FileText,
  },
  banner: {
    name: "배너 관리",
    href: "/admin/banner",
    icon: Image,
  },
  user: {
    name: "사용자 관리",
    href: "/admin/user",
    icon: Users,
  },
};

export type DashboardRole = keyof typeof MENU_CONFIG;

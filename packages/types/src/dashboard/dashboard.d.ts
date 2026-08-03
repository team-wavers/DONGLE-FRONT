// dashboard.d.ts
import { UserRole } from "../user/user";

export interface DashboardRecentClub {
  id: number;
  name: string;
  category: string;
  is_recruiting: boolean;
}

export interface DashboardRecentUser {
  id: number;
  name: string;
  login_id: string;
  role: UserRole;
  created_at: string; // ISO 8601 날짜 문자열
}

export interface DashboardData {
  clubs: {
    total: number;
    recruiting: number;
    recent: DashboardRecentClub[];
  };
  users: {
    total: number;
    recent: DashboardRecentUser[];
  };
  banners: {
    total: number;
    active: number;
  };
  schedules: {
    thisMonth: number;
  };
}

import { describe, expect, test } from "vitest";
import type { Club } from "@dongle/types/club/club";
import type { ClubReport } from "@dongle/types/club/club.report";
import type { User } from "@dongle/types/user/user";
import { findMockClub, findMockUser, mockClubs, mockReportsForClub, mockUsers } from "./fixtures";

describe("msw fixtures", () => {
    test("mockClubs는 Club[] 형태를 유지한다", () => {
        const clubs: Club[] = [...mockClubs];
        expect(clubs.length).toBeGreaterThan(0);
        expect(clubs[0]).toMatchObject({
            id: expect.any(Number),
            name: expect.any(String),
            president: {
                id: expect.any(Number),
                name: expect.any(String),
                phone: expect.any(String),
            },
        });
    });

    test("mockUsers는 User[] 형태를 유지한다", () => {
        const users: User[] = [...mockUsers];
        expect(users[0].role).toBe("president");
        expect(users[1].role).toBe("admin");
    });

    test("mockReportsForClub은 ClubReport[] 형태를 유지한다", () => {
        const reports: ClubReport[] = mockReportsForClub(7);
        expect(reports.every((report) => report.club_id === 7)).toBe(true);
    });

    test("find helpers는 id를 반영한다", () => {
        expect(findMockClub(2).id).toBe(2);
        expect(findMockUser(99).id).toBe(99);
    });
});

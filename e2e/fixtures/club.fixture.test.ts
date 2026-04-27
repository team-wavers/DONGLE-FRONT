import { expect, test } from "vitest";
import { getClubIdFromPath } from "./club.fixture";

test("getClubIdFromPath는 동아리 경로에서 clubId를 추출한다", () => {
    expect(getClubIdFromPath("/123/club-form")).toBe("123");
    expect(getClubIdFromPath("/456/report")).toBe("456");
});

test("getClubIdFromPath는 동아리 경로가 아니면 undefined를 반환한다", () => {
    expect(getClubIdFromPath("/login")).toBeUndefined();
    expect(getClubIdFromPath("/admin")).toBeUndefined();
});

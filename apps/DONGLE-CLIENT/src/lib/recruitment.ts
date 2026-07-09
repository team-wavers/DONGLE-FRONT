const DAY_MS = 86_400_000;

/** 주어진 시각의 서울 기준 달력 날짜를 UTC 자정 타임스탬프로 환산한다. */
function toSeoulDateValue(date: Date): number {
    // en-CA 로케일은 YYYY-MM-DD 형식을 반환한다.
    const formatted = date.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
    return Date.parse(`${formatted}T00:00:00Z`);
}

/**
 * 모집 마감일까지 남은 일수(서울 달력 기준)를 반환한다.
 * 오늘 마감이면 0, 지났으면 음수, 값이 없거나 파싱 불가하면 null.
 */
export function getRecruitDday(recruitEnd: string | null | undefined, now: Date = new Date()): number | null {
    if (!recruitEnd) {
        return null;
    }

    const end = new Date(recruitEnd);
    if (Number.isNaN(end.getTime())) {
        return null;
    }

    return Math.round((toSeoulDateValue(end) - toSeoulDateValue(now)) / DAY_MS);
}

export function formatRecruitDdayLabel(dday: number): string {
    return dday === 0 ? "D-DAY" : `D-${dday}`;
}

type RecruitingClubItem = {
    is_recruiting: boolean;
    recruit_end?: string | null;
};

export type ClosingSoonClub<T> = {
    club: T;
    dday: number;
};

/** 모집중이면서 마감이 withinDays 이내인 동아리를 임박 순으로 반환한다. */
export function getClosingSoonClubs<T extends RecruitingClubItem>(
    clubs: T[],
    { withinDays = 7, now = new Date() }: { withinDays?: number; now?: Date } = {}
): ClosingSoonClub<T>[] {
    return clubs
        .flatMap((club) => {
            if (!club.is_recruiting) {
                return [];
            }

            const dday = getRecruitDday(club.recruit_end, now);
            if (dday === null || dday < 0 || dday > withinDays) {
                return [];
            }

            return [{ club, dday }];
        })
        .sort((left, right) => left.dday - right.dday);
}

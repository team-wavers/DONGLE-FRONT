"use client";

import * as React from "react";
import { memo, useDeferredValue, useMemo } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@dongle/ui/button";
import type { ClubReport } from "@dongle/types/club/club.report.d";
import { SearchInput } from "@dongle/ui";
import { filterByKeyword, matchesKeyword, normalizeSearchQuery } from "@dongle/utils";
import { useUrlKeywordSearch } from "@/shared/hooks/use-url-keyword-search";
import ReportCard from "@/feature/report/components/report-card/report-card";

interface FilterableReportListProps {
    reports: ClubReport[];
    clubId: string;
    loadFailed?: boolean;
}

function getReportSearchableText(report: ClubReport) {
    return [report.title, report.content].filter(Boolean).join(" ");
}

export function normalizeReportKeyword(value: string) {
    return normalizeSearchQuery(value);
}

export function matchesReport(report: ClubReport, keyword: string) {
    return matchesKeyword(getReportSearchableText(report), keyword);
}

export function filterReportsByKeyword(reports: ClubReport[], keyword: string) {
    return filterByKeyword(reports, keyword, getReportSearchableText);
}

interface ReportListResultsProps {
    reports: ClubReport[];
    clubId: string;
    keyword: string;
}

// keyword(useDeferredValue 결과)가 바뀔 때만 무거운 리스트를 다시 그린다.
// 이걸 memo로 분리해야 입력창 타이핑은 항상 즉시 반영되고, 한글 IME 조합 중에
// 리스트 리렌더링이 끼어들어 자모가 분리되는 문제가 생기지 않는다.
const ReportListResults = memo(function ReportListResults({ reports, clubId, keyword }: ReportListResultsProps) {
    const filteredReports = useMemo(() => filterReportsByKeyword(reports, keyword), [reports, keyword]);

    if (filteredReports.length === 0) {
        return <div className="text-center py-8 text-muted-foreground">검색 결과가 없습니다.</div>;
    }

    return (
        <div className="overflow-hidden rounded-lg border bg-white">
            {filteredReports.map((report) => (
                <ReportCard
                    key={report.id}
                    title={report.title}
                    createdDate={report.createdAt}
                    content={report.content}
                    href={`/${clubId}/report/${report.id}`}
                />
            ))}
        </div>
    );
});

export default function FilterableReportList({ reports, clubId, loadFailed = false }: FilterableReportListProps) {
    const { inputValue, keyword, onChange, onCompositionStart, onCompositionEnd } = useUrlKeywordSearch();

    const deferredKeyword = useDeferredValue(keyword);

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4">
                {loadFailed ? (
                    <div />
                ) : (
                    <div className="text-sm text-gray-600">
                        총 <span className="font-semibold text-blue-600">{reports.length}</span>
                        개의 활동보고서
                    </div>
                )}
                <Button asChild className="font-semibold">
                    <Link href="./create">
                        <Pencil className="h-4 w-4" />
                        작성하기
                    </Link>
                </Button>
            </div>

            {loadFailed ? (
                <div className="flex min-h-40 items-center justify-center rounded-lg border bg-white py-16">
                    <div className="text-red-500">활동보고서를 불러오지 못했습니다. 잠시 후 다시 확인해주세요.</div>
                </div>
            ) : (
                <>
                    {reports.length > 0 ? (
                        <SearchInput
                            value={inputValue}
                            onChange={onChange}
                            onCompositionStart={onCompositionStart}
                            onCompositionEnd={onCompositionEnd}
                            placeholder="제목, 내용 검색"
                        />
                    ) : null}

                    {reports.length === 0 ? (
                        <div className="flex min-h-40 items-center justify-center rounded-lg border bg-white py-16">
                            <div className="text-gray-500">활동보고서가 없습니다.</div>
                        </div>
                    ) : (
                        <ReportListResults reports={reports} clubId={clubId} keyword={deferredKeyword} />
                    )}
                </>
            )}
        </div>
    );
}

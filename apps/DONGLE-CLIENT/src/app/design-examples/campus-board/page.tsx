import { CalendarCheck2, Filter, Search } from "lucide-react";
import { ExampleShell, RecruitingPill } from "../_components/example-shell";
import { categorySummaries, exampleClubs, featuredClub } from "../_components/example-data";

export default function CampusBoardDesignExamplePage() {
    return (
        <ExampleShell
            eyebrow="Concept 03"
            title="Campus Board"
            description="분과별 탐색과 모집 현황을 먼저 보여주는 보드형 시안입니다. 원하는 분야를 아직 정하지 못한 사용자에게 잘 맞습니다.">
            <div className="space-y-8">
                <section className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                    <div className="rounded-lg border border-zinc-200 bg-white p-5">
                        <h2 className="text-2xl font-bold text-zinc-950">분과별 모집 현황</h2>
                        <p className="mt-2 text-sm leading-6 text-zinc-500">관심 분과를 먼저 고르고 동아리를 탐색합니다.</p>
                        <div className="mt-6 space-y-3">
                            {categorySummaries.map((category) => (
                                <div key={category.name} className="flex items-center justify-between rounded-lg border border-zinc-200 p-4">
                                    <span className={`rounded-md border px-3 py-1.5 text-sm font-bold ${category.tone}`}>
                                        {category.name}
                                    </span>
                                    <span className="text-sm font-bold text-zinc-500">{category.count}개</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5">
                        <div className="flex flex-col gap-3 md:flex-row">
                            <div className="flex h-12 flex-1 items-center gap-3 rounded-md border border-zinc-200 bg-white px-4">
                                <Search className="size-5 text-zinc-400" />
                                <span className="text-sm font-bold text-zinc-400">동아리 검색</span>
                            </div>
                            <div className="flex h-12 items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-600">
                                <Filter className="size-4" />
                                모집중
                            </div>
                        </div>
                        <div className="mt-5 grid gap-3">
                            {exampleClubs.slice(0, 4).map((club) => {
                                const Icon = club.icon;

                                return (
                                    <article key={club.id} className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm">
                                        <div className={`flex size-12 items-center justify-center rounded-md ${club.softAccent}`}>
                                            <Icon className="size-6" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate font-bold text-zinc-950">{club.name}</h3>
                                            <p className="mt-1 text-sm font-semibold text-zinc-400">{club.description}</p>
                                        </div>
                                        <RecruitingPill isRecruiting={club.isRecruiting} />
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="rounded-lg border border-zinc-200 bg-white p-5 md:p-7">
                    <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr]">
                        <div>
                            <p className="text-sm font-bold text-zinc-400">상세 화면 Preview</p>
                            <h2 className="mt-2 text-3xl font-bold text-zinc-950">{featuredClub.name}</h2>
                            <p className="mt-2 font-bold text-zinc-500">{featuredClub.category}</p>
                            <p className="mt-5 text-base leading-7 text-zinc-600">{featuredClub.description}</p>
                            <div className="mt-6 flex flex-wrap gap-2">
                                {featuredClub.tags.map((tag) => (
                                    <span key={tag} className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-bold text-zinc-500">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {[
                                ["모집 상태", "현재 지원 가능"],
                                ["모집기간", featuredClub.period],
                                ["장소", featuredClub.location],
                                ["활동", "정기 훈련 · 교류전"],
                            ].map(([label, value], index) => (
                                <div
                                    key={label}
                                    className={index === 0 ? "rounded-lg bg-emerald-500 p-5 text-white" : "rounded-lg bg-zinc-50 p-5"}>
                                    <CalendarCheck2 className={index === 0 ? "mb-4 size-5 text-white" : "mb-4 size-5 text-zinc-400"} />
                                    <p className={index === 0 ? "text-sm font-bold text-white/75" : "text-sm font-bold text-zinc-400"}>
                                        {label}
                                    </p>
                                    <p className={index === 0 ? "mt-2 font-bold text-white" : "mt-2 font-bold text-zinc-950"}>{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </ExampleShell>
    );
}

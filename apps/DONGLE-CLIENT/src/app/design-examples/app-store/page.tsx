import { ChevronRight, Search } from "lucide-react";
import { ExampleShell, RecruitingPill } from "../_components/example-shell";
import { exampleClubs, featuredClub } from "../_components/example-data";

export default function AppStoreDesignExamplePage() {
    const FeaturedIcon = featuredClub.icon;

    return (
        <ExampleShell
            eyebrow="Concept 02"
            title="App Store Cards"
            description="동아리를 앱처럼 빠르게 스캔하고 비교하는 카드 중심 시안입니다. 기존 그리드 구조에서 가장 자연스럽게 확장됩니다.">
            <div className="space-y-8">
                <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-zinc-950">동아리 둘러보기</h2>
                            <p className="mt-1 text-sm font-semibold text-zinc-400">아이콘, 소개, 태그로 빠르게 비교</p>
                        </div>
                        <div className="flex h-12 items-center gap-3 rounded-md border border-zinc-200 px-4 md:w-80">
                            <Search className="size-5 text-zinc-400" />
                            <span className="text-sm font-bold text-zinc-400">관심 키워드 검색</span>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2">
                    {exampleClubs.map((club) => {
                        const Icon = club.icon;

                        return (
                            <article
                                key={club.id}
                                className="group flex gap-4 rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-md">
                                <div className={`flex size-16 shrink-0 items-center justify-center rounded-lg ${club.softAccent}`}>
                                    <Icon className="size-8" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="truncate text-xl font-bold text-zinc-950">{club.name}</h3>
                                            <p className="mt-1 text-sm font-bold text-zinc-400">{club.category}</p>
                                        </div>
                                        <RecruitingPill isRecruiting={club.isRecruiting} />
                                    </div>
                                    <p className="mt-3 text-sm leading-6 text-zinc-600">{club.description}</p>
                                    <div className="mt-4 flex items-center justify-between gap-3">
                                        <div className="flex min-w-0 flex-wrap gap-2">
                                            {club.tags.slice(0, 2).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-500">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <ChevronRight className="size-5 shrink-0 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-zinc-700" />
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </section>

                <section className="rounded-lg border border-zinc-200 bg-zinc-950 p-5 text-white md:p-7">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center">
                        <div className={`flex size-20 items-center justify-center rounded-lg text-white ${featuredClub.accent}`}>
                            <FeaturedIcon className="size-10" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold">{featuredClub.name}</h2>
                                    <p className="mt-1 font-bold text-zinc-400">{featuredClub.category}</p>
                                </div>
                                <span className="w-fit rounded-md bg-white px-4 py-2 text-sm font-bold text-zinc-950">지원하기</span>
                            </div>
                            <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300">{featuredClub.description}</p>
                        </div>
                    </div>
                    <div className="mt-7 grid gap-3 md:grid-cols-3">
                        {[
                            ["동아리방", featuredClub.location],
                            ["모집기간", featuredClub.period],
                            ["대표 태그", featuredClub.tags.join(" · ")],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-4">
                                <p className="text-sm font-bold text-zinc-400">{label}</p>
                                <p className="mt-2 font-bold text-white">{value}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </ExampleShell>
    );
}

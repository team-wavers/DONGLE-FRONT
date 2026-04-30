import { CalendarDays, MapPin, Search, UserRound } from "lucide-react";
import { ExampleShell, RecruitingPill } from "../_components/example-shell";
import { categorySummaries, exampleClubs, featuredClub } from "../_components/example-data";

export default function MagazineDesignExamplePage() {
    const FeaturedIcon = featuredClub.icon;

    return (
        <ExampleShell
            eyebrow="Concept 01"
            title="Magazine Discovery"
            description="첫 화면에서 탐색 의도를 만들고, 카드와 상세 모두 동아리의 분위기를 먼저 전달하는 시안입니다.">
            <div className="space-y-8">
                <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-5 md:p-7">
                    <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-end">
                        <div>
                            <p className="text-sm font-bold text-emerald-600">40 clubs open to explore</p>
                            <h2 className="mt-3 text-3xl font-bold text-zinc-950 md:text-5xl">
                                오늘 합류할 동아리를 찾아보세요
                            </h2>
                            <p className="mt-4 max-w-xl text-base leading-7 text-zinc-500">
                                모집중인 동아리, 관심 분과, 활동 키워드를 한 번에 훑어보고 나에게 맞는 모임을
                                빠르게 고릅니다.
                            </p>
                        </div>
                        <div className="rounded-lg border border-white bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3 rounded-md border border-zinc-200 px-4 py-3">
                                <Search className="size-5 text-zinc-400" />
                                <span className="text-sm font-semibold text-zinc-400">동아리명, 분과, 태그 검색</span>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {categorySummaries.map((category) => (
                                    <span
                                        key={category.name}
                                        className={`rounded-md border px-3 py-2 text-sm font-bold ${category.tone}`}>
                                        {category.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-5 md:grid-cols-3">
                    {exampleClubs.slice(0, 6).map((club) => {
                        const Icon = club.icon;

                        return (
                            <article
                                key={club.id}
                                className="rounded-lg border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                                <div className="flex items-start justify-between gap-4">
                                    <div className={`flex size-12 items-center justify-center rounded-md ${club.softAccent}`}>
                                        <Icon className="size-6" />
                                    </div>
                                    <RecruitingPill isRecruiting={club.isRecruiting} />
                                </div>
                                <div className="mt-5">
                                    <h3 className="text-xl font-bold text-zinc-950">{club.name}</h3>
                                    <p className="mt-1 text-sm font-bold text-zinc-400">{club.category}</p>
                                    <p className="mt-4 min-h-12 text-sm leading-6 text-zinc-600">{club.description}</p>
                                </div>
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {club.tags.slice(0, 2).map((tag) => (
                                        <span key={tag} className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-500">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </article>
                        );
                    })}
                </section>

                <section className="rounded-lg border border-zinc-200 bg-white p-5 md:p-7">
                    <div className="grid gap-7 md:grid-cols-[0.9fr_1.1fr]">
                        <div className={`rounded-lg ${featuredClub.softAccent} p-6`}>
                            <div className={`flex size-16 items-center justify-center rounded-lg text-white ${featuredClub.accent}`}>
                                <FeaturedIcon className="size-8" />
                            </div>
                            <h2 className="mt-6 text-3xl font-bold text-zinc-950">{featuredClub.name}</h2>
                            <p className="mt-2 font-bold text-zinc-500">{featuredClub.category}</p>
                            <p className="mt-5 text-base leading-7 text-zinc-700">{featuredClub.description}</p>
                        </div>
                        <div className="space-y-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-bold text-zinc-400">상세 화면 Preview</p>
                                    <h3 className="mt-2 text-2xl font-bold text-zinc-950">핵심 정보와 소개를 분리</h3>
                                </div>
                                <RecruitingPill isRecruiting={featuredClub.isRecruiting} />
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {[
                                    { icon: MapPin, label: "동아리방", value: featuredClub.location },
                                    { icon: CalendarDays, label: "모집기간", value: featuredClub.period },
                                    { icon: UserRound, label: "회장", value: featuredClub.president },
                                ].map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <div key={item.label} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                                            <Icon className="mb-3 size-5 text-zinc-400" />
                                            <p className="text-sm font-bold text-zinc-400">{item.label}</p>
                                            <p className="mt-1 font-bold text-zinc-900">{item.value}</p>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="rounded-lg border border-zinc-200 p-5">
                                <h4 className="text-lg font-bold text-zinc-950">동아리 소개</h4>
                                <p className="mt-3 text-sm leading-7 text-zinc-600">
                                    상세 본문은 정보표 아래에 밀어 넣기보다, 소개와 주요 활동을 읽기 좋은 콘텐츠
                                    영역으로 넓게 보여줍니다.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </ExampleShell>
    );
}

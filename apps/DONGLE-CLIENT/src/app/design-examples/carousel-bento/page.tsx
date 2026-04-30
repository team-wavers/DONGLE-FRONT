import { Activity, BookOpen, GalleryHorizontal, Search, Trophy } from "lucide-react";
import { BannerCarouselMock } from "../_components/banner-carousel-mock";
import { ExampleShell, RecruitingPill } from "../_components/example-shell";
import { categorySummaries, exampleClubs, featuredClub } from "../_components/example-data";

export default function CarouselBentoDesignExamplePage() {
    return (
        <ExampleShell
            eyebrow="Concept 04"
            title="Carousel Bento"
            description="상단 배너 캐러셀을 유지하되, 바로 아래에서 분과, 모집, 추천을 bento 블록으로 빠르게 탐색하게 하는 시안입니다.">
            <div className="space-y-8">
                <BannerCarouselMock
                    label="이번 주 추천 동아리"
                    title="처음이라도 바로 참여할 수 있는 모집"
                    description="첫 슬라이드는 가장 중요한 모집 메시지만 담고, 배너 컨트롤은 명확하게 노출합니다."
                    icon={GalleryHorizontal}
                    tone="bg-emerald-500 text-white"
                />

                <section className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-zinc-200 bg-white p-5 md:col-span-2 md:row-span-2">
                        <div className="flex items-center gap-3 rounded-md border border-zinc-200 px-4 py-3">
                            <Search className="size-5 text-zinc-400" />
                            <span className="text-sm font-bold text-zinc-400">동아리명, 분과, 활동 키워드</span>
                        </div>
                        <h2 className="mt-7 text-2xl font-bold text-zinc-950">관심사로 좁혀보기</h2>
                        <div className="mt-5 flex flex-wrap gap-2">
                            {categorySummaries.map((category) => (
                                <span key={category.name} className={`rounded-md border px-3 py-2 text-sm font-bold ${category.tone}`}>
                                    {category.name}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-lg bg-zinc-950 p-5 text-white">
                        <Activity className="size-6 text-emerald-300" />
                        <p className="mt-5 text-3xl font-bold">31</p>
                        <p className="mt-1 text-sm font-semibold text-zinc-400">모집중 동아리</p>
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-white p-5">
                        <Trophy className="size-6 text-amber-500" />
                        <p className="mt-5 text-3xl font-bold text-zinc-950">6</p>
                        <p className="mt-1 text-sm font-semibold text-zinc-400">신규 추천</p>
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-white p-5 md:col-span-2">
                        <BookOpen className="size-6 text-sky-500" />
                        <p className="mt-4 text-lg font-bold text-zinc-950">{featuredClub.name} 활동 미리보기</p>
                        <p className="mt-2 text-sm leading-6 text-zinc-500">{featuredClub.description}</p>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    {exampleClubs.slice(0, 3).map((club) => {
                        const Icon = club.icon;

                        return (
                            <article key={club.id} className="rounded-lg border border-zinc-200 bg-white p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className={`flex size-12 items-center justify-center rounded-md ${club.softAccent}`}>
                                        <Icon className="size-6" />
                                    </div>
                                    <RecruitingPill isRecruiting={club.isRecruiting} />
                                </div>
                                <h3 className="mt-5 text-xl font-bold text-zinc-950">{club.name}</h3>
                                <p className="mt-2 text-sm leading-6 text-zinc-500">{club.description}</p>
                            </article>
                        );
                    })}
                </section>
            </div>
        </ExampleShell>
    );
}

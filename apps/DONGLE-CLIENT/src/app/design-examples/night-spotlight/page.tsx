import { GalleryHorizontal, Moon, Search } from "lucide-react";
import { BannerCarouselMock } from "../_components/banner-carousel-mock";
import { ExampleShell, RecruitingPill } from "../_components/example-shell";
import { exampleClubs, featuredClub } from "../_components/example-data";

export default function NightSpotlightDesignExamplePage() {
    const FeaturedIcon = featuredClub.icon;

    return (
        <ExampleShell
            eyebrow="Concept 07"
            title="Night Spotlight"
            description="상단 캐러셀만 어두운 극장형 영역으로 처리하고, 실제 탐색 카드는 밝게 유지하는 대비 중심 시안입니다.">
            <div className="space-y-8">
                <BannerCarouselMock
                    label="Spotlight"
                    title="오늘 가장 주목할 모집"
                    description="어두운 배너는 하나의 집중 영역으로만 사용하고, 읽어야 하는 카드와 상세 정보는 밝은 표면에 둡니다."
                    icon={GalleryHorizontal}
                    tone="bg-emerald-400 text-zinc-950"
                    dark
                />

                <section className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
                    <article className="rounded-lg bg-zinc-950 p-5 text-white md:p-7">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex size-16 items-center justify-center rounded-lg bg-emerald-400 text-zinc-950">
                                <FeaturedIcon className="size-8" />
                            </div>
                            <RecruitingPill isRecruiting={featuredClub.isRecruiting} />
                        </div>
                        <h2 className="mt-7 text-3xl font-bold">{featuredClub.name}</h2>
                        <p className="mt-2 font-bold text-zinc-400">{featuredClub.category}</p>
                        <p className="mt-5 text-base leading-7 text-zinc-300">{featuredClub.description}</p>
                    </article>
                    <article className="rounded-lg border border-zinc-200 bg-white p-5 md:p-7">
                        <div className="flex items-center gap-3 rounded-md bg-zinc-100 px-4 py-3">
                            <Search className="size-5 text-zinc-400" />
                            <span className="text-sm font-bold text-zinc-400">동아리 검색</span>
                        </div>
                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            {[
                                ["분위기", "활동적인"],
                                ["모집", "지원 가능"],
                                ["위치", featuredClub.location],
                                ["기간", featuredClub.period],
                            ].map(([label, value]) => (
                                <div key={label} className="rounded-lg bg-zinc-50 p-4">
                                    <p className="text-sm font-bold text-zinc-400">{label}</p>
                                    <p className="mt-2 font-bold text-zinc-950">{value}</p>
                                </div>
                            ))}
                        </div>
                    </article>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    {exampleClubs.slice(1, 4).map((club) => {
                        const Icon = club.icon;

                        return (
                            <article key={club.id} className="rounded-lg border border-zinc-200 bg-white p-5">
                                <div className={`mb-5 flex size-12 items-center justify-center rounded-md ${club.softAccent}`}>
                                    <Icon className="size-6" />
                                </div>
                                <h3 className="text-xl font-bold text-zinc-950">{club.name}</h3>
                                <p className="mt-2 text-sm leading-6 text-zinc-500">{club.description}</p>
                            </article>
                        );
                    })}
                </section>
            </div>
        </ExampleShell>
    );
}

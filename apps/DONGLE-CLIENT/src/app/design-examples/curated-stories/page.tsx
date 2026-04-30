import { Camera, GalleryHorizontal, Quote, Sparkles } from "lucide-react";
import { BannerCarouselMock } from "../_components/banner-carousel-mock";
import { ExampleShell, RecruitingPill } from "../_components/example-shell";
import { exampleClubs, featuredClub } from "../_components/example-data";

export default function CuratedStoriesDesignExamplePage() {
    return (
        <ExampleShell
            eyebrow="Concept 05"
            title="Curated Stories"
            description="배너 캐러셀을 단순 홍보 영역이 아니라 동아리 활동 스토리를 보여주는 큐레이션 영역으로 쓰는 시안입니다.">
            <div className="space-y-8">
                <BannerCarouselMock
                    label="활동 스토리"
                    title="사진과 기록으로 먼저 만나는 동아리"
                    description="상단 배너는 모집 공지보다 활동 분위기를 보여주고, 아래 카드에서 바로 상세 탐색으로 이어집니다."
                    icon={Camera}
                    tone="bg-amber-400 text-zinc-950"
                />

                <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                    <article className="rounded-lg border border-zinc-200 bg-white p-5 md:p-7">
                        <Sparkles className="size-7 text-amber-500" />
                        <h2 className="mt-5 text-2xl font-bold text-zinc-950">이번 주 큐레이션</h2>
                        <p className="mt-3 max-w-xl text-base leading-7 text-zinc-600">
                            사용자는 모든 목록을 보기 전에, 운영자가 고른 테마를 통해 동아리 분위기를 먼저 이해합니다.
                        </p>
                        <div className="mt-7 grid gap-3 sm:grid-cols-3">
                            {["처음 시작하기 좋은", "공연이 있는", "주말에 만나는"].map((label) => (
                                <div key={label} className="rounded-md bg-zinc-100 px-4 py-3 text-sm font-bold text-zinc-700">
                                    {label}
                                </div>
                            ))}
                        </div>
                    </article>
                    <article className="rounded-lg bg-zinc-950 p-5 text-white md:p-7">
                        <Quote className="size-7 text-emerald-300" />
                        <p className="mt-6 text-xl font-bold leading-8">
                            목록보다 먼저 이야기를 보여주면, 동아리 선택이 정보 비교가 아니라 취향 탐색이 됩니다.
                        </p>
                    </article>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    {exampleClubs.slice(0, 6).map((club) => {
                        const Icon = club.icon;

                        return (
                            <article key={club.id} className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
                                <div className={`flex h-32 items-center justify-center ${club.softAccent}`}>
                                    <Icon className="size-10" />
                                </div>
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-zinc-950">{club.name}</h3>
                                            <p className="mt-1 text-sm font-bold text-zinc-400">{club.category}</p>
                                        </div>
                                        <RecruitingPill isRecruiting={club.isRecruiting} />
                                    </div>
                                    <p className="mt-4 text-sm leading-6 text-zinc-600">{club.description}</p>
                                </div>
                            </article>
                        );
                    })}
                </section>
            </div>
        </ExampleShell>
    );
}

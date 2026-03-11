"use client";

import { useEffect, useState } from "react";
import type { CarouselApi } from "@dongle/ui/carousel";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@dongle/ui/carousel";
import { cn } from "@dongle/ui";
import Image from "next/image";

interface ClubMainHeroBannerCarouselProps {
    imageUrls: string[];
}

const AUTO_SLIDE_INTERVAL_MS = 5000;

export default function ClubMainHeroBannerCarousel({ imageUrls }: ClubMainHeroBannerCarouselProps) {
    const [api, setApi] = useState<CarouselApi | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (!api) return;

        const onSelect = () => {
            setSelectedIndex(api.selectedScrollSnap());
        };

        onSelect();
        api.on("select", onSelect);
        api.on("reInit", onSelect);

        return () => {
            api.off("select", onSelect);
            api.off("reInit", onSelect);
        };
    }, [api]);

    useEffect(() => {
        if (!api || imageUrls.length <= 1 || isPaused) return;

        const timer = window.setInterval(() => {
            api.scrollNext();
        }, AUTO_SLIDE_INTERVAL_MS);

        return () => {
            window.clearInterval(timer);
        };
    }, [api, imageUrls.length, isPaused]);

    if (imageUrls.length === 0) {
        return null;
    }

    return (
        <section aria-label="메인 배너">
            <Carousel
                setApi={setApi}
                opts={{ loop: imageUrls.length > 1 }}
                className="w-full"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onFocusCapture={() => setIsPaused(true)}
                onBlurCapture={() => setIsPaused(false)}>
                <CarouselContent className="ml-0">
                    {imageUrls.map((imageUrl, index) => (
                        <CarouselItem key={`${imageUrl}-${index}`} className="pl-0">
                            <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-50">
                                <Image
                                    width={1920}
                                    height={480}
                                    src={imageUrl}
                                    alt={`메인 배너 ${index + 1}`}
                                    className="w-full object-cover h-44 md:h-72"
                                    loading={index === 0 ? "eager" : "lazy"}
                                />
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-900/45 via-zinc-900/10 to-transparent" />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                {imageUrls.length > 1 ? (
                    <>
                        <CarouselPrevious className="left-3 bg-white/90 shadow-sm hover:bg-white disabled:opacity-30" />
                        <CarouselNext className="right-3 bg-white/90 shadow-sm hover:bg-white disabled:opacity-30" />
                        <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-zinc-900/40 px-2 py-1 backdrop-blur-sm">
                            <div className="flex items-center gap-1.5">
                                {imageUrls.map((_, index) => (
                                    <button
                                        key={`dot-${index}`}
                                        type="button"
                                        aria-label={`${index + 1}번 배너로 이동`}
                                        aria-current={selectedIndex === index}
                                        onClick={() => api?.scrollTo(index)}
                                        className={cn(
                                            "h-2 rounded-full transition-all",
                                            selectedIndex === index
                                                ? "w-5 bg-white"
                                                : "w-2 bg-white/50 hover:bg-white/75"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                ) : null}
            </Carousel>
        </section>
    );
}

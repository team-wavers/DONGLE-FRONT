import React from "react";
import { richTextContentClassName } from "@dongle/rich-text";

type ClubIntroViewModel = {
    /** 이미 sanitizeRichTextForViewer를 거친 안전한 HTML 문자열 */
    description: string;
    /** 이미 sanitizeRichTextForViewer를 거친 안전한 HTML 문자열 */
    main_activities: string;
};

interface ClubIntroTabContentProps {
    club: ClubIntroViewModel;
}

const styles = {
    article: "space-y-3",
    title: "text-2xl font-bold text-zinc-900",
    text: "text-zinc-700 leading-7",
} as const;

export default function ClubIntroTabContent({ club }: ClubIntroTabContentProps) {
    return (
        <section className="space-y-10">
            <article className={styles.article}>
                <h2 className={styles.title}>동아리 소개</h2>
                {club.description ? (
                    <div
                        className={`${richTextContentClassName} ${styles.text}`}
                        suppressHydrationWarning
                        dangerouslySetInnerHTML={{ __html: club.description }}
                    />
                ) : (
                    <p className={styles.text}>등록된 동아리 소개가 없습니다.</p>
                )}
            </article>

            <article className={styles.article}>
                <h2 className={styles.title}>주요 활동</h2>
                {club.main_activities ? (
                    <div
                        className={`${richTextContentClassName} ${styles.text}`}
                        suppressHydrationWarning
                        dangerouslySetInnerHTML={{ __html: club.main_activities }}
                    />
                ) : (
                    <p className={styles.text}>등록된 주요 활동 정보가 없습니다.</p>
                )}
            </article>
        </section>
    );
}

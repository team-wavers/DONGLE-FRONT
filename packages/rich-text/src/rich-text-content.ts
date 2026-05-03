import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";

export const richTextContentClassName =
    "w-full text-zinc-800 leading-7 " +
    "[&_a]:border-b [&_a]:border-transparent [&_a]:text-primary [&_a]:transition-colors [&_a:hover]:border-primary " +
    "[&_blockquote]:my-5 [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-300 [&_blockquote]:pl-4 [&_blockquote]:text-zinc-600 " +
    "[&_br]:leading-7 " +
    "[&_h1]:mt-8 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight " +
    "[&_h2]:mt-7 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-tight " +
    "[&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:leading-snug " +
    "[&_img]:my-6 [&_img]:block [&_img]:max-h-[560px] [&_img]:max-w-full [&_img]:rounded-2xl [&_img]:object-contain " +
    "[&_li]:ml-1 [&_li]:leading-7 " +
    "[&_ol]:my-4 [&_ol]:ml-5 [&_ol]:list-decimal [&_ol]:pl-5 " +
    "[&_p]:min-h-[1.75rem] [&_p]:whitespace-normal [&_p+p]:mt-4 [&_p:empty]:block [&_p:empty]:h-7 " +
    "[&_strong]:font-semibold " +
    "[&_ul]:my-4 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:pl-5";

export function createRichTextExtensions() {
    return [
        StarterKit.configure({
            heading: {
                levels: [1, 2, 3],
            },
        }),
        Link.configure({
            openOnClick: false,
            HTMLAttributes: {
                rel: "noopener noreferrer nofollow",
                target: "_blank",
            },
        }),
        Image,
    ];
}

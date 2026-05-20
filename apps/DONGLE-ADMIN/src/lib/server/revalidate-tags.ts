import { revalidateTag } from "next/cache";

export function revalidateTags(tags: string[]) {
    tags.forEach((tag) => {
        revalidateTag(tag);
    });
}

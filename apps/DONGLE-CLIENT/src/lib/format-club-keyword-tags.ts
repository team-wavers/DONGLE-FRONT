export function formatClubKeywordTags(tags: string[]) {
    return tags.flatMap((tag) => {
        const trimmedTag = tag.trim();

        if (!trimmedTag) {
            return [];
        }

        const keywords = trimmedTag.includes("#")
            ? trimmedTag
                  .split("#")
                  .map((keyword) => keyword.trim())
                  .filter(Boolean)
            : [trimmedTag];

        return keywords.map((keyword) => `#${keyword}`);
    });
}

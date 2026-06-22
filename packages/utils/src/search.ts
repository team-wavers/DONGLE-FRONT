export function normalizeSearchQuery(value: string): string {
    return value.trim().toLowerCase();
}

export function matchesKeyword(searchableText: string, keyword: string): boolean {
    const normalized = normalizeSearchQuery(keyword);

    if (!normalized) {
        return true;
    }

    return searchableText.toLowerCase().includes(normalized);
}

export function filterByKeyword<T>(items: T[], keyword: string, getSearchableText: (item: T) => string): T[] {
    const normalized = normalizeSearchQuery(keyword);

    if (!normalized) {
        return items;
    }

    return items.filter((item) => getSearchableText(item).toLowerCase().includes(normalized));
}

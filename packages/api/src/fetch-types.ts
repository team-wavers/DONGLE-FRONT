/**
 * Next.js extends fetch with cache options.
 * Standard RequestInit does not include these.
 * @see https://nextjs.org/docs/app/api-reference/functions/fetch
 */
export interface NextFetchConfig {
    next?: {
        revalidate?: number | false;
        tags?: string[];
        dynamic?: "auto" | "force-dynamic" | "error" | "force-static";
    };
}

export type FetchOptions = RequestInit &
    NextFetchConfig & {
        skipAuthRefresh?: boolean;
    };

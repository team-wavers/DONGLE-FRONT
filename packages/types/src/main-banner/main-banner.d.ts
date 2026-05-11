export interface MainBanner {
    id: number;
    image_url: string;
    link_url: string | null;
    publish_start_at: string;
    publish_end_at: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

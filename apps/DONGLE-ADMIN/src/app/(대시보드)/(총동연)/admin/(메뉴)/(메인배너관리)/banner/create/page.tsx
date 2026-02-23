import MainBannerForm from "@/feature/main-banner/components/main-banner-form";

export default function CreateMainBannerPage() {
    return <MainBannerForm submitText="등록" loadingText="등록 중..." successMessage="배너가 등록되었습니다." />;
}

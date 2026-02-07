import ChangeAccountForm from "@/feature/user/components/change-account-form";

export default async function AccountPage() {
    return (
        <div className="flex flex-col gap-8 w-full">
            <ChangeAccountForm />
        </div>
    );
}

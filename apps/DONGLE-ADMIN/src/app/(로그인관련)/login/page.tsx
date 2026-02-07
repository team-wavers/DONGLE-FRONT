import LoginForm from "@/feature/auth/components/login-form";

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center gap-6 max-w-[222px] w-full">
            <LoginForm />
        </div>
    );
}

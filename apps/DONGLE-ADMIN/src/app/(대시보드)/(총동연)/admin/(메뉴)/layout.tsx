export default function MainLayout({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-col min-h-screen h-full w-full justify-start items-center">{children}</div>;
}

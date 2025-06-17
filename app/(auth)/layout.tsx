export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col justify-center items-center h-svh">
            {children}
        </div>
    );
}

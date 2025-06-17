export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen grid place-items-center bg-gradient-to-br from-indigo-900 to-gray-900">
            {children}
        </div>
    );
}

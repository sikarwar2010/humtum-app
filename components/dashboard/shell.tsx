import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export function DashboardShell({
    children,
    className,
    ...props
}: DashboardShellProps) {
    return (
        <div className={cn("grid items-start gap-8", className)} {...props}>
            {children}
        </div>
    );
}

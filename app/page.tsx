import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col gap-6 justify-center items-center h-screen">
            <UserButton />
            <ModeToggle />
            <Button asChild>
                <Link href="/dashboard">
                    Dashboard
                </Link>
            </Button>
        </div>
    );
}

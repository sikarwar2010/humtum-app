"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export function ConvexInitializer() {
    const createUser = useMutation(api.users.createUser);
    const { user } = useUser();

    useEffect(() => {
        if (!user) return;

        // Sync user with Convex when component mounts
        createUser({
            clerkUserId: user.id,
            email: user.emailAddresses[0]?.emailAddress || "",
            name: user.fullName || user.username || "Anonymous",
            role: "user",
        }).catch(console.error);
    }, [createUser, user]);

    return null;
}

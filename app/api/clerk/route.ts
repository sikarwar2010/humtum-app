import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
        console.error("CLERK_WEBHOOK_SECRET is not set");
        return NextResponse.json(
            { error: "Server configuration error" },
            { status: 500 }
        );
    }

    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        console.error("Missing required Svix headers");
        return NextResponse.json(
            { error: "Missing required headers" },
            { status: 400 }
        );
    }

    let payload: WebhookEvent['data'];
    try {
        payload = await req.json();
    } catch (err) {
        console.error("Error parsing request body:", err);
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }

    const body = JSON.stringify(payload);
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error("Error verifying webhook:", err);
        return NextResponse.json(
            { error: "Invalid webhook signature" },
            { status: 400 }
        );
    }

    const eventType = evt.type;

    try {
        switch (eventType) {
            case "user.created": {
                const email = evt.data.email_addresses?.[0]?.email_address;
                if (!email) {
                    console.error("No email address found for user:", evt.data.id);
                    return NextResponse.json(
                        { error: "No email address found" },
                        { status: 400 }
                    );
                }
                await convex.mutation(api.users.createUser, {
                    userId: evt.data.id,
                    email,
                    name: `${evt.data.first_name || ''} ${evt.data.last_name || ''}`.trim() || 'Anonymous',
                    role: "user",
                });
                break;
            }
            case "user.updated": {
                const email = evt.data.email_addresses?.[0]?.email_address;
                if (!email) {
                    console.error("No email address found for user:", evt.data.id);
                    return NextResponse.json(
                        { error: "No email address found" },
                        { status: 400 }
                    );
                }
                await convex.mutation(api.users.updateUser, {
                    userId: evt.data.id,
                    email,
                    name: `${evt.data.first_name || ''} ${evt.data.last_name || ''}`.trim() || 'Anonymous',
                });
                break;
            }
            case "user.deleted":
                if (!evt.data.id) {
                    console.error("No user ID found in delete event");
                    return NextResponse.json(
                        { error: "No user ID found" },
                        { status: 400 }
                    );
                }
                await convex.mutation(api.users.deleteUser, { userId: evt.data.id });
                break;
            default:
                console.log(`Unhandled event type: ${eventType}`);
                return NextResponse.json(
                    { message: "Event type not handled" },
                    { status: 200 }
                );
        }

        return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error processing webhook:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

export function RecentActivity({ className }: { className?: string }) {
    const activities = useQuery(api.dashboard.getRecentActivities);

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {activities ? (
                    <ScrollArea className="h-[300px]">
                        <div className="space-y-4">
                            {activities.map((activity) => (
                                <div key={activity._id} className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium leading-none">
                                            {activity.description}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDistanceToNow(new Date(activity.date), {
                                                addSuffix: true,
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {activities.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    No recent activity
                                </p>
                            )}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[200px]" />
                                    <Skeleton className="h-4 w-[100px]" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

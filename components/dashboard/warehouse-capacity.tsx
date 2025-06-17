"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

export function WarehouseCapacity({ className }: { className?: string }) {
    const warehouses = useQuery(api.warehouses.listWarehouses);

    const data =
        warehouses?.map((warehouse) => ({
            name: warehouse.name,
            capacity: warehouse.capacity,
            used: warehouse.capacity,
            available: warehouse.capacity,
        })) || [];

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Warehouse Capacity</CardTitle>
            </CardHeader>
            <CardContent>
                {warehouses ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip />
                            <Bar
                                dataKey="used"
                                fill="#adfa1d"
                                radius={[4, 4, 0, 0]}
                                label="Used"
                            />
                            <Bar
                                dataKey="available"
                                fill="#8884d8"
                                radius={[4, 4, 0, 0]}
                                label="Available"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <Skeleton className="h-[300px] w-full" />
                )}
            </CardContent>
        </Card>
    );
}

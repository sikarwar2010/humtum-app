"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LowStockItems() {
    const lowStockItems = useQuery(api.inventory.getLowStockItems);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    Low Stock Items
                    <Button variant="outline" asChild>
                        <Link href="/inventory">View All</Link>
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {lowStockItems ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Current Stock</TableHead>
                                <TableHead>Minimum Level</TableHead>
                                <TableHead>Warehouse</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lowStockItems.map((item) => (
                                <TableRow key={item._id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.sku}</TableCell>
                                    <TableCell className="text-red-500">{item.quantity}</TableCell>
                                    <TableCell>{item.minStockLevel}</TableCell>
                                    <TableCell>
                                        {item.warehouse ? item.warehouse.name : "Unknown"}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {lowStockItems.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        No low stock items
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="space-y-4">
                        <Skeleton className="h-[50px] w-full" />
                        <Skeleton className="h-[50px] w-full" />
                        <Skeleton className="h-[50px] w-full" />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

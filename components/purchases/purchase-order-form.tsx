"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
    supplierId: z.string().min(1, "Supplier is required"),
    expectedDeliveryDate: z.date({
        required_error: "Expected delivery date is required",
    }),
    taxAmount: z.number().min(0, "Tax amount must be positive"),
    shippingAmount: z.number().min(0, "Shipping amount must be positive"),
    notes: z.string().optional(),
});

export function PurchaseOrderForm() {
    const suppliers = useQuery(api.suppliers.listSuppliers);
    const inventoryItems = useQuery(api.inventory.listInventory, { paginationOpts: { numItems: 50, cursor: null } });
    const createPurchaseOrder = useMutation(api.purchases.createPurchaseOrder);

    const [items, setItems] = useState<
        {
            inventoryId: string;
            quantity: number;
            unitPrice: number;
            name?: string;
            sku?: string;
        }[]
    >([]);

    const [selectedItem, setSelectedItem] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(1);
    const [unitPrice, setUnitPrice] = useState<number>(0);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            taxAmount: 0,
            shippingAmount: 0,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (items.length === 0) {
                toast({
                    title: "Error",
                    description: "Please add at least one item to the order",
                    variant: "destructive",
                });
                return;
            }

            await createPurchaseOrder({
                supplierId: values.supplierId as any,
                expectedDeliveryDate: values.expectedDeliveryDate.getTime(),
                items,
                taxAmount: values.taxAmount,
                shippingAmount: values.shippingAmount,
                notes: values.notes,
            });

            toast({
                title: "Success",
                description: "Purchase order created successfully",
            });

            form.reset();
            setItems([]);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create purchase order",
                variant: "destructive",
            });
        }
    }

    const handleAddItem = () => {
        if (!selectedItem) return;

        const item = inventoryItems?.find((i) => i._id === selectedItem);
        if (!item) return;

        setItems([
            ...items,
            {
                inventoryId: selectedItem,
                quantity,
                unitPrice,
                name: item.name,
                sku: item.sku,
            },
        ]);

        setSelectedItem("");
        setQuantity(1);
        setUnitPrice(0);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
    );
    const total = subtotal + (form.watch("taxAmount") || 0) + (form.watch("shippingAmount") || 0);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="supplierId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Supplier</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a supplier" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {suppliers?.map((supplier) => (
                                            <SelectItem key={supplier._id} value={supplier._id}>
                                                {supplier.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="expectedDeliveryDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Expected Delivery Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < new Date()}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Order Items</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <Select
                            value={selectedItem}
                            onValueChange={setSelectedItem}
                        >
                            <SelectTrigger className="col-span-2">
                                <SelectValue placeholder="Select an item" />
                            </SelectTrigger>
                            <SelectContent>
                                <ScrollArea className="h-72">
                                    {inventoryItems?.map((item) => (
                                        <SelectItem key={item._id} value={item._id}>
                                            {item.name} ({item.sku})
                                        </SelectItem>
                                    ))}
                                </ScrollArea>
                            </SelectContent>
                        </Select>

                        <Input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            placeholder="Quantity"
                        />

                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={unitPrice}
                            onChange={(e) => setUnitPrice(Number(e.target.value))}
                            placeholder="Unit Price"
                        />
                    </div>

                    <Button
                        type="button"
                        onClick={handleAddItem}
                        disabled={!selectedItem}
                    >
                        Add Item
                    </Button>

                    {items.length > 0 && (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Unit Price</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.sku}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>
                                                {new Intl.NumberFormat("en-US", {
                                                    style: "currency",
                                                    currency: "USD",
                                                }).format(item.unitPrice)}
                                            </TableCell>
                                            <TableCell>
                                                {new Intl.NumberFormat("en-US", {
                                                    style: "currency",
                                                    currency: "USD",
                                                }).format(item.quantity * item.unitPrice)}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveItem(index)}
                                                >
                                                    Remove
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <FormField
                        control={form.control}
                        name="taxAmount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tax Amount</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...field}
                                        onChange={(e) =>
                                            field.onChange(parseFloat(e.target.value))
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="shippingAmount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Shipping Amount</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...field}
                                        onChange={(e) =>
                                            field.onChange(parseFloat(e.target.value))
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="space-y-2">
                        <div className="text-sm font-medium">Order Summary</div>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>
                                    {new Intl.NumberFormat("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                    }).format(subtotal)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax:</span>
                                <span>
                                    {new Intl.NumberFormat("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                    }).format(form.watch("taxAmount") || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping:</span>
                                <span>
                                    {new Intl.NumberFormat("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                    }).format(form.watch("shippingAmount") || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between font-bold">
                                <span>Total:</span>
                                <span>
                                    {new Intl.NumberFormat("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                    }).format(total)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Optional notes" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit">Create Purchase Order</Button>
            </form>
        </Form>
    );
}

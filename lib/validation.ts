import { z } from "zod";

export const inventoryItemSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    sku: z.string().min(1, "SKU is required"),
    barcode: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    unit: z.string().min(1, "Unit is required"),
    costPrice: z.number().min(0, "Cost price must be positive"),
    sellingPrice: z.number().min(0, "Selling price must be positive"),
    quantity: z.number().min(0, "Quantity must be positive"),
    minStockLevel: z.number().min(0, "Minimum stock level must be positive"),
    supplierId: z.string().min(1, "Supplier is required"),
    warehouseId: z.string().min(1, "Warehouse is required"),
});

export const warehouseSchema = z.object({
    name: z.string().min(1, "Name is required"),
    location: z.string().min(1, "Location is required"),
    capacity: z.number().min(1, "Capacity must be positive"),
    managerId: z.string().min(1, "Manager is required"),
    contact: z.string().min(1, "Contact is required"),
});

export const supplierSchema = z.object({
    name: z.string().min(1, "Name is required"),
    contact: z.string().min(1, "Contact is required"),
    email: z.string().email("Invalid email"),
    address: z.string().min(1, "Address is required"),
    taxId: z.string().optional(),
    paymentTerms: z.number().min(0, "Payment terms must be positive"),
    notes: z.string().optional(),
});

export const INVENTORY_CATEGORIES = [
    "Electronics",
    "Clothing",
    "Food",
    "Furniture",
    "Tools",
    "Office Supplies",
    "Medical",
    "Automotive",
    "Sports",
    "Other",
];

export const INVENTORY_UNITS = [
    "Piece",
    "Box",
    "Pack",
    "Kilogram",
    "Gram",
    "Liter",
    "Milliliter",
    "Meter",
    "Centimeter",
    "Pair",
    "Set",
];

export const PURCHASE_ORDER_STATUS = {
    draft: "Draft",
    pending: "Pending",
    approved: "Approved",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

export const INVENTORY_MOVEMENT_TYPES = {
    purchase: "Purchase",
    sale: "Sale",
    transfer: "Transfer",
    adjustment: "Adjustment",
};

export const USER_ROLES = {
    admin: "Admin",
    manager: "Manager",
    user: "User",
};

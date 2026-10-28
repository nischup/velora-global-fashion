export type CartItem = {
    variant_id: number;
    product_id: number;
    name: string;
    slug: string;
    brand: string | null;
    sku: string;
    options: string;
    image_url: string | null;
    price: number;
    quantity: number;
    stock: number;
    in_stock: boolean;
    line_total: number;
};

export type OrderItem = {
    id: number;
    product_id: number | null;
    product_name: string;
    variant_sku: string;
    variant_label: string | null;
    unit_price: number;
    quantity: number;
    line_total: number;
    product_slug: string | null;
    image_url: string | null;
};

export type OrderStatus =
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';

export type CustomerOrder = {
    id: number;
    number: string;
    status: OrderStatus;
    status_label: string;
    subtotal: number;
    shipping_amount: number;
    total: number;
    shipping_name: string;
    shipping_phone: string;
    shipping_address: string;
    shipping_city: string;
    notes: string | null;
    item_count: number;
    placed_at: string | null;
    items?: OrderItem[];
};

export type AdminOrder = CustomerOrder & {
    customer: {
        id: number;
        name: string;
        email: string;
    };
};

export type OrderStatusOption = {
    value: OrderStatus;
    label: string;
};

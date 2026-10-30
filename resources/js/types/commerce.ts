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
    compare_at_price: number | null;
    sale_percent: number | null;
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
    returned_quantity: number;
    returnable_quantity: number;
    discount_amount: number;
    line_total: number;
    product_slug: string | null;
    image_url: string | null;
};

export type OrderStatus =
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';

export type OrderSource = 'online' | 'pos';

export type PaymentMethod = 'cash' | 'card' | 'bkash';

export type OrderReturnRecord = {
    id: number;
    refund_method: PaymentMethod;
    refund_method_label: string;
    refund_amount: number;
    reason: string | null;
    cashier_name: string | null;
    created_at: string | null;
    items: Array<{
        id: number;
        order_item_id: number;
        product_name: string | null;
        quantity: number;
        unit_price: number;
        line_total: number;
    }>;
};

export type CustomerOrder = {
    id: number;
    number: string;
    status: OrderStatus;
    status_label: string;
    source: OrderSource;
    source_label: string;
    subtotal: number;
    shipping_amount: number;
    discount_amount: number;
    tax_rate: number;
    tax_amount: number;
    exchange_credit: number;
    exchanged_from_number: string | null;
    total: number;
    refunded_amount: number;
    payment_method: PaymentMethod | null;
    payment_method_label: string | null;
    amount_tendered: number | null;
    change_due: number | null;
    shipping_name: string;
    shipping_phone: string;
    shipping_address: string;
    shipping_city: string;
    notes: string | null;
    item_count: number;
    placed_at: string | null;
    is_returnable: boolean;
    items?: OrderItem[];
};

export type OrderPaymentRecord = {
    id: number;
    method: PaymentMethod;
    method_label: string;
    type: 'sale' | 'refund';
    amount: number;
    amount_tendered: number | null;
    change_due: number;
};

export type AdminOrder = CustomerOrder & {
    can_update_status: boolean;
    cashier: { id: number; name: string } | null;
    customer: {
        id: number | null;
        name: string;
        email: string;
    };
    returns: OrderReturnRecord[];
    payments?: OrderPaymentRecord[];
    store_name?: string | null;
    register_name?: string | null;
};

export type PosRegisterOption = {
    id: number;
    store_id: number;
    name: string;
    code: string;
    is_active: boolean;
    store_name: string | null;
    store_code: string | null;
    tax_rate: number;
    label: string;
};

export type PosShiftSummary = {
    id: number;
    status: 'open' | 'closed';
    status_label: string;
    opening_cash: number;
    expected_cash: number;
    counted_cash: number | null;
    difference: number | null;
    opened_at: string | null;
    closed_at: string | null;
    notes: string | null;
    register: PosRegisterOption | null;
    store: {
        id: number;
        name: string;
        code: string;
        tax_rate: number;
    } | null;
    cashier_name: string | null;
    tax_rate: number;
};

export type OrderStatusOption = {
    value: OrderStatus;
    label: string;
};

export type OrderSourceOption = {
    value: OrderSource;
    label: string;
};

export type PaymentMethodOption = {
    value: PaymentMethod;
    label: string;
};

export type PosVariant = {
    id: number;
    sku: string;
    barcode: string | null;
    price: number;
    stock: number;
    label: string;
    in_stock: boolean;
};

export type StoreCustomer = {
    id: number;
    name: string;
    phone: string;
    email: string | null;
};

export type PosHoldSummary = {
    id: number;
    customer_name: string | null;
    customer_phone: string | null;
    store_customer_id: number | null;
    discount_type: 'none' | 'amount' | 'percent';
    discount_value: number;
    notes: string | null;
    item_count: number;
    held_at: string | null;
    items?: Array<{
        variant_id: number;
        product_name: string;
        sku: string;
        barcode: string | null;
        label: string;
        price: number;
        stock: number;
        quantity: number;
        discount_type: 'none' | 'amount' | 'percent';
        discount_value: number;
        image_url: string | null;
        in_stock: boolean;
    }>;
};

export type PosRecentSale = {
    id: number;
    number: string;
    total: number;
    customer_name: string;
    placed_at: string | null;
};

export type PosProduct = {
    id: number;
    name: string;
    image_url: string | null;
    brand: string | null;
    variants: PosVariant[];
};

export type PosLookupItem = {
    product_id: number;
    product_name: string;
    image_url: string | null;
    brand: string | null;
    variant_id: number;
    sku: string;
    barcode: string | null;
    price: number;
    stock: number;
    label: string;
    in_stock: boolean;
};

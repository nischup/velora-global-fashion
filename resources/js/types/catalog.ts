export type CategoryOption = {
    id: number;
    name: string;
    slug: string;
    depth: number;
};

export type CategorySummary = {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    children?: CategorySummary[];
};

export type BrandSummary = {
    id: number;
    name: string;
    slug?: string;
};

export type CatalogImage = {
    id: number;
    url: string;
    alt?: string | null;
    is_primary: boolean;
    sort_order: number;
    product_variant_id?: number | null;
};

export type AttributeValue = {
    id: number;
    product_attribute_id?: number;
    value: string;
    slug: string;
    hex_color?: string | null;
    sort_order: number;
};

export type CatalogAttribute = {
    id: number;
    name: string;
    slug: string;
    values: AttributeValue[];
};

export type StorefrontVariant = {
    id: number;
    sku: string;
    price: number;
    compare_at_price: number | null;
    stock: number;
    in_stock: boolean;
    is_low_stock: boolean;
    attribute_value_ids: number[];
    attributes: Record<string, string>;
};

export type ProductCard = {
    id: number;
    name: string;
    slug: string;
    short_description?: string | null;
    brand: BrandSummary | null;
    category: CategorySummary | null;
    image_url: string | null;
    min_price: number;
    max_price: number;
    in_stock: boolean;
    is_featured: boolean;
};

export type HeroSlide = {
    id: number;
    title: string;
    description: string | null;
    image_url: string | null;
    slug: string;
    brand: string | null;
};

export type ProductDetail = {
    id: number;
    name: string;
    slug: string;
    short_description: string | null;
    description: string | null;
    brand: BrandSummary | null;
    category: CategorySummary | null;
    images: CatalogImage[];
    variants: StorefrontVariant[];
};

export type AdminVariant = {
    id: number;
    sku: string;
    price: number;
    compare_at_price: number | null;
    stock: number;
    low_stock_threshold: number;
    is_active: boolean;
    is_low_stock: boolean;
    attribute_value_ids: number[];
    size: string | null;
    color: string | null;
    size_id: number | null;
    color_id: number | null;
    label: string;
};

export type AdminProduct = {
    id: number;
    name: string;
    slug: string;
    short_description: string | null;
    description: string | null;
    status: 'draft' | 'live';
    is_featured: boolean;
    category_id: number;
    brand_id: number | null;
    images: CatalogImage[];
    variants: AdminVariant[];
};

export type AdminProductListItem = {
    id: number;
    name: string;
    slug: string;
    status: 'draft' | 'live';
    is_featured: boolean;
    image_url: string | null;
    category: { id: number; name: string } | null;
    brand: { id: number; name: string } | null;
    variants_count: number;
    total_stock: number;
    low_stock_count: number;
    min_price: number | null;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    path: string;
    first_page_url: string | null;
    last_page_url: string | null;
    next_page_url: string | null;
    prev_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
};

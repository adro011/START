export type Section = "men" | "women" | "kids";

export const SECTIONS: Section[] = ["men", "women", "kids"];

export const SHOP_ROUTES = ["new-arrivals", "sale"] as const;
export type ShopRoute = (typeof SHOP_ROUTES)[number];

export interface CatalogImage {
  src: string;
  alt: string;
  blur?: string;
}

export interface Variant {
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  pricePaisa?: number;
}

export interface CatalogProduct {
  slug: string;
  name: string;
  nameBn: string;
  section: Section;
  category: string;
  pricePaisa: number;
  compareAtPaisa?: number;
  fabric: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  images: CatalogImage[];
  isNew: boolean;
  isSale: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  fabricCare: string;
  fitNotes: string;
}

export interface Category {
  slug: string;
  name: string;
  nameBn: string;
  section: Section;
  children?: Category[];
}

export interface CartItem {
  sku: string;
  slug: string;
  name: string;
  size: string;
  color: string;
  qty: number;
  unitPricePaisa: number;
  image: string;
}

export interface Address {
  fullName: string;
  phone: string;
  division: string;
  district: string;
  area: string;
  line1: string;
  notes?: string;
  isDefault: boolean;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentMethod = "cod" | "sslcommerz";

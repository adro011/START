// brand-store database types (hand-written mirror of supabase/migrations).
// Money is integer paisa everywhere.

export type Role = 'customer' | 'staff' | 'admin';
export type Section = 'men' | 'women' | 'kids';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';
export type PaymentMethod = 'cod' | 'sslcommerz';
export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded';
export type CouponType = 'percent' | 'fixed' | 'free_shipping';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface OrderAddress {
  name?: string;
  phone?: string;
  email?: string;
  division?: string;
  district: string;
  area?: string;
  line1?: string;
  notes?: string;
}

export interface CategoryRow {
  id: string;
  parent_id: string | null;
  slug: string;
  name: string;
  name_bn: string | null;
  section: Section;
  sort: number;
  image_path: string | null;
  created_at: string;
  updated_at: string;
}
export type CategoryInsert = Pick<CategoryRow, 'slug' | 'name' | 'section'> &
  Partial<Omit<CategoryRow, 'id' | 'slug' | 'name' | 'section' | 'created_at' | 'updated_at'>>;
export type CategoryUpdate = Partial<Omit<CategoryRow, 'id' | 'created_at' | 'updated_at'>>;

export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  name_bn: string | null;
  description: string;
  description_bn: string;
  section: Section;
  category_id: string | null;
  price_paisa: number;
  compare_at_paisa: number | null;
  fabric: string | null;
  care: string | null;
  fit_notes: string | null;
  is_new: boolean;
  is_sale: boolean;
  is_featured: boolean;
  active: boolean;
  search: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}
export type ProductInsert = Pick<ProductRow, 'slug' | 'name' | 'section' | 'price_paisa'> &
  Partial<Omit<ProductRow, 'id' | 'slug' | 'name' | 'section' | 'price_paisa' | 'search' | 'created_at' | 'updated_at'>>;
export type ProductUpdate = Partial<Omit<ProductRow, 'id' | 'search' | 'created_at' | 'updated_at'>>;

export interface ProductVariantRow {
  id: string;
  product_id: string;
  sku: string;
  size: string | null;
  color: string | null;
  color_hex: string | null;
  stock: number;
  price_override_paisa: number | null;
  created_at: string;
  updated_at: string;
}
export type ProductVariantInsert = Pick<ProductVariantRow, 'product_id' | 'sku'> &
  Partial<Omit<ProductVariantRow, 'id' | 'product_id' | 'sku' | 'created_at' | 'updated_at'>>;
export type ProductVariantUpdate = Partial<
  Omit<ProductVariantRow, 'id' | 'product_id' | 'created_at' | 'updated_at'>
>;

export interface ProductImageRow {
  id: string;
  product_id: string;
  position: number;
  path_thumb: string | null;
  path_medium: string | null;
  path_large: string | null;
  alt: string | null;
  blur_data_url: string | null;
  created_at: string;
  updated_at: string;
}
export type ProductImageInsert = Pick<ProductImageRow, 'product_id' | 'position'> &
  Partial<Omit<ProductImageRow, 'id' | 'product_id' | 'position' | 'created_at' | 'updated_at'>>;
export type ProductImageUpdate = Partial<
  Omit<ProductImageRow, 'id' | 'product_id' | 'created_at' | 'updated_at'>
>;

export interface ProfileRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: Role;
  locale: string;
  created_at: string;
  updated_at: string;
}
export type ProfileInsert = Pick<ProfileRow, 'id'> & Partial<Omit<ProfileRow, 'id' | 'created_at' | 'updated_at'>>;
export type ProfileUpdate = Partial<Omit<ProfileRow, 'id' | 'created_at' | 'updated_at'>>;

export interface AddressRow {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  division: string | null;
  district: string | null;
  area: string | null;
  line1: string;
  notes: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
export type AddressInsert = Pick<AddressRow, 'user_id' | 'name' | 'phone' | 'line1'> &
  Partial<Omit<AddressRow, 'id' | 'user_id' | 'name' | 'phone' | 'line1' | 'created_at' | 'updated_at'>>;
export type AddressUpdate = Partial<Omit<AddressRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export interface OrderRow {
  id: string;
  order_no: string;
  user_id: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal_paisa: number;
  discount_paisa: number;
  shipping_paisa: number;
  total_paisa: number;
  coupon_code: string | null;
  address: OrderAddress | null;
  courier: string | null;
  tracking_no: string | null;
  created_at: string;
  updated_at: string;
}
export type OrderInsert = Pick<OrderRow, 'order_no'> &
  Partial<Omit<OrderRow, 'id' | 'order_no' | 'created_at' | 'updated_at'>>;
export type OrderUpdate = Partial<Omit<OrderRow, 'id' | 'order_no' | 'created_at' | 'updated_at'>>;

export interface OrderItemRow {
  id: string;
  order_id: string;
  variant_id: string | null;
  name_snapshot: string;
  size: string | null;
  color: string | null;
  qty: number;
  unit_price_paisa: number;
  image_snapshot: string | null;
  created_at: string;
}
export type OrderItemInsert = Pick<
  OrderItemRow,
  'order_id' | 'name_snapshot' | 'qty' | 'unit_price_paisa'
> &
  Partial<Omit<OrderItemRow, 'id' | 'order_id' | 'name_snapshot' | 'qty' | 'unit_price_paisa' | 'created_at'>>;
export type OrderItemUpdate = Partial<Omit<OrderItemRow, 'id' | 'order_id' | 'created_at'>>;

export interface OrderEventRow {
  id: string;
  order_id: string;
  status: string;
  note: string | null;
  actor: string | null;
  created_at: string;
}
export type OrderEventInsert = Pick<OrderEventRow, 'order_id' | 'status'> &
  Partial<Omit<OrderEventRow, 'id' | 'order_id' | 'status' | 'created_at'>>;
export type OrderEventUpdate = Partial<Omit<OrderEventRow, 'id' | 'order_id' | 'created_at'>>;

export interface CouponRow {
  code: string;
  type: CouponType;
  value: number;
  min_subtotal_paisa: number;
  starts_at: string | null;
  ends_at: string | null;
  usage_limit: number | null;
  used_count: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}
export type CouponInsert = Pick<CouponRow, 'code' | 'type'> &
  Partial<Omit<CouponRow, 'code' | 'type' | 'created_at' | 'updated_at'>>;
export type CouponUpdate = Partial<Omit<CouponRow, 'code' | 'created_at' | 'updated_at'>>;

export interface WishlistRow {
  user_id: string;
  product_id: string;
  created_at: string;
}
export type WishlistInsert = Omit<WishlistRow, 'created_at'>;
export type WishlistUpdate = Partial<Pick<WishlistRow, 'product_id'>>;

export interface ReviewRow {
  id: string;
  product_id: string;
  user_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  photos: string[] | null;
  approved: boolean;
  created_at: string;
  updated_at: string;
}
export type ReviewInsert = Pick<ReviewRow, 'product_id' | 'rating'> &
  Partial<Omit<ReviewRow, 'id' | 'product_id' | 'rating' | 'created_at' | 'updated_at'>>;
export type ReviewUpdate = Partial<Omit<ReviewRow, 'id' | 'product_id' | 'created_at' | 'updated_at'>>;

export interface StockAlertRow {
  id: string;
  variant_id: string;
  email: string;
  created_at: string;
}
export type StockAlertInsert = Pick<StockAlertRow, 'variant_id' | 'email'> &
  Partial<Pick<StockAlertRow, 'id'>>;
export type StockAlertUpdate = Partial<Pick<StockAlertRow, 'email'>>;

export interface ShippingZoneRow {
  id: string;
  name: string;
  districts: string[];
  fee_paisa: number;
  free_over_paisa: number | null;
  eta_days: string | null;
  created_at: string;
  updated_at: string;
}
export type ShippingZoneInsert = Pick<ShippingZoneRow, 'name'> &
  Partial<Omit<ShippingZoneRow, 'id' | 'name' | 'created_at' | 'updated_at'>>;
export type ShippingZoneUpdate = Partial<Omit<ShippingZoneRow, 'id' | 'created_at' | 'updated_at'>>;

export interface AuditLogRow {
  id: string;
  actor: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  diff: Json | null;
  created_at: string;
}
export type AuditLogInsert = Pick<AuditLogRow, 'action' | 'entity'> &
  Partial<Omit<AuditLogRow, 'id' | 'action' | 'entity' | 'created_at'>>;
export type AuditLogUpdate = Partial<Pick<AuditLogRow, 'diff'>>;

export interface SiteSettingRow {
  key: string;
  value: Json;
  created_at: string;
  updated_at: string;
}
export type SiteSettingInsert = Pick<SiteSettingRow, 'key' | 'value'> &
  Partial<Pick<SiteSettingRow, 'created_at'>>;
export type SiteSettingUpdate = Partial<Pick<SiteSettingRow, 'value'>>;

export interface CreateOrderResult {
  id: string;
  order_no: string;
  total_paisa: number;
}

export interface SearchProductResult {
  id: string;
  slug: string;
  name: string;
  price_paisa: number;
  rank: number;
}

export interface Database {
  categories: {
    Row: CategoryRow;
    Insert: CategoryInsert;
    Update: CategoryUpdate;
  };
  products: {
    Row: ProductRow;
    Insert: ProductInsert;
    Update: ProductUpdate;
  };
  product_variants: {
    Row: ProductVariantRow;
    Insert: ProductVariantInsert;
    Update: ProductVariantUpdate;
  };
  product_images: {
    Row: ProductImageRow;
    Insert: ProductImageInsert;
    Update: ProductImageUpdate;
  };
  profiles: {
    Row: ProfileRow;
    Insert: ProfileInsert;
    Update: ProfileUpdate;
  };
  addresses: {
    Row: AddressRow;
    Insert: AddressInsert;
    Update: AddressUpdate;
  };
  orders: {
    Row: OrderRow;
    Insert: OrderInsert;
    Update: OrderUpdate;
  };
  order_items: {
    Row: OrderItemRow;
    Insert: OrderItemInsert;
    Update: OrderItemUpdate;
  };
  order_events: {
    Row: OrderEventRow;
    Insert: OrderEventInsert;
    Update: OrderEventUpdate;
  };
  coupons: {
    Row: CouponRow;
    Insert: CouponInsert;
    Update: CouponUpdate;
  };
  wishlist: {
    Row: WishlistRow;
    Insert: WishlistInsert;
    Update: WishlistUpdate;
  };
  reviews: {
    Row: ReviewRow;
    Insert: ReviewInsert;
    Update: ReviewUpdate;
  };
  stock_alerts: {
    Row: StockAlertRow;
    Insert: StockAlertInsert;
    Update: StockAlertUpdate;
  };
  shipping_zones: {
    Row: ShippingZoneRow;
    Insert: ShippingZoneInsert;
    Update: ShippingZoneUpdate;
  };
  audit_log: {
    Row: AuditLogRow;
    Insert: AuditLogInsert;
    Update: AuditLogUpdate;
  };
  site_settings: {
    Row: SiteSettingRow;
    Insert: SiteSettingInsert;
    Update: SiteSettingUpdate;
  };
}

// Demo storefront data for the admin area (stub → replace with Supabase queries).
// Money is integer paisa everywhere. Dates are ISO strings.

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

export interface DemoOrderItem {
  variantId?: string;
  name: string;
  size?: string;
  color?: string;
  qty: number;
  unitPricePaisa: number;
  image?: string;
}

export interface DemoOrderEvent {
  status: OrderStatus;
  note?: string;
  actor?: string;
  at: string;
}

export interface DemoOrder {
  id: string;
  orderNo: string;
  customerName: string;
  email?: string;
  phone: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotalPaisa: number;
  discountPaisa: number;
  shippingPaisa: number;
  totalPaisa: number;
  couponCode?: string;
  courier?: string;
  trackingNo?: string;
  address: {
    name: string;
    phone: string;
    division: string;
    district: string;
    area: string;
    line1: string;
  };
  createdAt: string;
  items: DemoOrderItem[];
  events: DemoOrderEvent[];
}

function daysAgoIso(days: number, hour = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 15, 0, 0);
  return d.toISOString();
}

function hoursAgoIso(hours: number): string {
  return new Date(Date.now() - hours * 3600_000).toISOString();
}

export const DEMO_ORDERS: DemoOrder[] = [
  {
    id: 'demo-1',
    orderNo: 'BR-100231',
    customerName: 'Tanvir Hasan',
    email: 'tanvir@example.com',
    phone: '01712345678',
    status: 'pending',
    paymentMethod: 'cod',
    paymentStatus: 'unpaid',
    subtotalPaisa: 499800,
    discountPaisa: 0,
    shippingPaisa: 6000,
    totalPaisa: 505800,
    address: {
      name: 'Tanvir Hasan',
      phone: '01712345678',
      division: 'Dhaka',
      district: 'Dhaka',
      area: 'Mirpur',
      line1: 'House 12, Road 5, Mirpur 10',
    },
    createdAt: hoursAgoIso(3),
    items: [
      { name: 'Classic Cotton Panjabi', size: 'L', color: 'White', qty: 1, unitPricePaisa: 299900 },
      { name: 'Slim Chinos', size: '32', color: 'Khaki', qty: 1, unitPricePaisa: 199900 },
    ],
    events: [{ status: 'pending', note: 'Order placed (COD)', actor: 'system', at: hoursAgoIso(3) }],
  },
  {
    id: 'demo-2',
    orderNo: 'BR-100230',
    customerName: 'Nusrat Jahan',
    email: 'nusrat@example.com',
    phone: '01812345678',
    status: 'confirmed',
    paymentMethod: 'sslcommerz',
    paymentStatus: 'paid',
    subtotalPaisa: 349900,
    discountPaisa: 34990,
    shippingPaisa: 6000,
    totalPaisa: 320910,
    couponCode: 'EID10',
    address: {
      name: 'Nusrat Jahan',
      phone: '01812345678',
      division: 'Dhaka',
      district: 'Dhaka',
      area: 'Dhanmondi',
      line1: 'House 8, Road 27, Dhanmondi',
    },
    createdAt: hoursAgoIso(7),
    items: [{ name: 'Jamdaani Sharee', size: 'One Size', color: 'Red', qty: 1, unitPricePaisa: 349900 }],
    events: [
      { status: 'pending', note: 'Order placed', actor: 'system', at: hoursAgoIso(8) },
      { status: 'confirmed', note: 'Payment VALIDATED via SSLCommerz', actor: 'system', at: hoursAgoIso(7) },
    ],
  },
  {
    id: 'demo-3',
    orderNo: 'BR-100229',
    customerName: 'Arif Chowdhury',
    phone: '01912345678',
    status: 'packed',
    paymentMethod: 'cod',
    paymentStatus: 'unpaid',
    subtotalPaisa: 189900,
    discountPaisa: 0,
    shippingPaisa: 12000,
    totalPaisa: 201900,
    address: {
      name: 'Arif Chowdhury',
      phone: '01912345678',
      division: 'Chattogram',
      district: 'Chattogram',
      area: 'GEC Circle',
      line1: 'Flat 4B, GEC Circle',
    },
    createdAt: daysAgoIso(1, 14),
    items: [{ name: "Boy's Panjabi Set", size: '8Y', color: 'Navy', qty: 1, unitPricePaisa: 189900 }],
    events: [
      { status: 'pending', note: 'Order placed', actor: 'system', at: daysAgoIso(1, 11) },
      { status: 'confirmed', note: 'Phone confirmed', actor: 'staff', at: daysAgoIso(1, 12) },
      { status: 'packed', note: 'Packed in warehouse', actor: 'staff', at: daysAgoIso(1, 14) },
    ],
  },
  {
    id: 'demo-4',
    orderNo: 'BR-100228',
    customerName: 'Priya Das',
    email: 'priya@example.com',
    phone: '01612345678',
    status: 'shipped',
    paymentMethod: 'sslcommerz',
    paymentStatus: 'paid',
    subtotalPaisa: 559800,
    discountPaisa: 0,
    shippingPaisa: 0,
    totalPaisa: 559800,
    courier: 'Steadfast',
    trackingNo: 'SF-882311',
    address: {
      name: 'Priya Das',
      phone: '01612345678',
      division: 'Sylhet',
      district: 'Sylhet',
      area: 'Zindabazar',
      line1: 'House 21, Zindabazar',
    },
    createdAt: daysAgoIso(5, 12),
    items: [
      { name: '3 Pcs Set — Cord', size: 'M', color: 'Sage', qty: 1, unitPricePaisa: 329900 },
      { name: 'Ladies Polo', size: 'S', color: 'Blush', qty: 1, unitPricePaisa: 229900 },
    ],
    events: [
      { status: 'pending', note: 'Order placed', actor: 'system', at: daysAgoIso(5, 9) },
      { status: 'confirmed', note: 'Payment VALIDATED', actor: 'system', at: daysAgoIso(5, 9) },
      { status: 'packed', note: 'Packed', actor: 'staff', at: daysAgoIso(5, 10) },
      { status: 'shipped', note: 'Handed to Steadfast SF-882311', actor: 'staff', at: daysAgoIso(5, 12) },
    ],
  },
  {
    id: 'demo-5',
    orderNo: 'BR-100227',
    customerName: 'Rahim Uddin',
    phone: '01512345678',
    status: 'delivered',
    paymentMethod: 'cod',
    paymentStatus: 'paid',
    subtotalPaisa: 159900,
    discountPaisa: 0,
    shippingPaisa: 6000,
    totalPaisa: 165900,
    courier: 'Pathao',
    trackingNo: 'PA-551020',
    address: {
      name: 'Rahim Uddin',
      phone: '01512345678',
      division: 'Dhaka',
      district: 'Gazipur',
      area: 'Tongi',
      line1: 'House 3, Tongi Bazar',
    },
    createdAt: daysAgoIso(12, 11),
    items: [{ name: 'Casual Fatua', size: 'XL', color: 'Umber', qty: 1, unitPricePaisa: 159900 }],
    events: [
      { status: 'pending', note: 'Order placed', actor: 'system', at: daysAgoIso(12, 9) },
      { status: 'confirmed', note: 'Confirmed', actor: 'staff', at: daysAgoIso(12, 10) },
      { status: 'packed', note: 'Packed', actor: 'staff', at: daysAgoIso(11, 10) },
      { status: 'shipped', note: 'Shipped via Pathao', actor: 'staff', at: daysAgoIso(11, 12) },
      { status: 'delivered', note: 'Delivered, COD collected', actor: 'courier', at: daysAgoIso(10, 16) },
    ],
  },
  {
    id: 'demo-6',
    orderNo: 'BR-100226',
    customerName: 'Mim Akter',
    phone: '01312345678',
    status: 'cancelled',
    paymentMethod: 'cod',
    paymentStatus: 'failed',
    subtotalPaisa: 279900,
    discountPaisa: 0,
    shippingPaisa: 6000,
    totalPaisa: 285900,
    address: {
      name: 'Mim Akter',
      phone: '01312345678',
      division: 'Rajshahi',
      district: 'Rajshahi',
      area: 'Shaheb Bazar',
      line1: 'House 9, Shaheb Bazar',
    },
    createdAt: daysAgoIso(20, 13),
    items: [{ name: 'Silk Panjabi', size: 'M', color: 'Terracotta', qty: 1, unitPricePaisa: 279900 }],
    events: [
      { status: 'pending', note: 'Order placed', actor: 'system', at: daysAgoIso(20, 12) },
      { status: 'cancelled', note: 'Cancelled by customer — stock restored', actor: 'staff', at: daysAgoIso(20, 13) },
    ],
  },
];

export interface DemoCoupon {
  code: string;
  type: 'percent' | 'fixed' | 'free_shipping';
  value: number;
  minSubtotalPaisa: number;
  startsAt: string;
  endsAt: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
}

export const DEMO_COUPONS: DemoCoupon[] = [
  {
    code: 'EID10',
    type: 'percent',
    value: 10,
    minSubtotalPaisa: 200000,
    startsAt: daysAgoIso(30),
    endsAt: daysAgoIso(-30),
    usageLimit: 500,
    usedCount: 132,
    active: true,
  },
  {
    code: 'FLAT200',
    type: 'fixed',
    value: 20000,
    minSubtotalPaisa: 300000,
    startsAt: daysAgoIso(10),
    endsAt: daysAgoIso(-10),
    usageLimit: 200,
    usedCount: 41,
    active: true,
  },
  {
    code: 'FREESHIP',
    type: 'free_shipping',
    value: 0,
    minSubtotalPaisa: 150000,
    startsAt: daysAgoIso(5),
    endsAt: daysAgoIso(-20),
    usageLimit: 1000,
    usedCount: 210,
    active: false,
  },
];

export interface DemoCategory {
  slug: string;
  name: string;
  section: 'men' | 'women' | 'kids';
  sort: number;
}

export const DEMO_CATEGORIES: DemoCategory[] = [
  { slug: 'panjabi', name: 'Panjabi', section: 'men', sort: 1 },
  { slug: 'shirts', name: 'Shirts', section: 'men', sort: 2 },
  { slug: 'fatua', name: 'Fatua', section: 'men', sort: 3 },
  { slug: 'sharee', name: 'Sharee', section: 'women', sort: 1 },
  { slug: '3pcs', name: '3 Pcs & 2 Pcs', section: 'women', sort: 2 },
  { slug: 'tunics', name: 'Tunics', section: 'women', sort: 3 },
  { slug: 'boys-panjabi', name: "Boy's Panjabi", section: 'kids', sort: 1 },
  { slug: 'girls-3pcs', name: "Girls' 3 Pcs", section: 'kids', sort: 2 },
];

export interface DemoSetting {
  key: string;
  value: unknown;
  description: string;
}

export const DEMO_SETTINGS: DemoSetting[] = [
  { key: 'announcement', value: 'Eid Edit — up to 30% off + free exchange', description: 'Announcement bar text' },
  { key: 'hero_copy', value: { men: 'Heritage Panjabi', women: 'Handloom Sharee', kids: 'Festive Kids' }, description: 'Homepage hero copy per section' },
  { key: 'shipping_dhaka_fee', value: 6000, description: 'Shipping fee inside Dhaka (paisa)' },
  { key: 'shipping_outside_fee', value: 12000, description: 'Shipping fee outside Dhaka (paisa)' },
  { key: 'free_over', value: 500000, description: 'Free shipping threshold (paisa)' },
];

export interface LowStockItem {
  sku: string;
  productSlug: string;
  productName: string;
  size: string;
  color: string;
  stock: number;
}

export const DEMO_LOW_STOCK: LowStockItem[] = [
  { sku: 'CCP-W-XL', productSlug: 'classic-cotton-panjabi-white', productName: 'Classic Cotton Panjabi', size: 'XL', color: 'White', stock: 3 },
  { sku: 'MSR-W-L', productSlug: 'muslin-sharee-rose', productName: 'Muslin Sharee', size: 'L', color: 'Rose', stock: 3 },
  { sku: 'BKM-M-4-5Y', productSlug: 'boys-kabli-mustard', productName: 'Boys Kabli Set', size: '4-5Y', color: 'Mustard', stock: 3 },
  { sku: 'L3M-G-L', productSlug: 'lawn-3pcs-mint', productName: 'Lawn 3 Pcs Set', size: 'L', color: 'Mint', stock: 3 },
];

export function getLowStock(threshold = 5): LowStockItem[] {
  return DEMO_LOW_STOCK.filter((i) => i.stock <= threshold).sort((a, b) => a.stock - b.stock);
}

export function getPendingOrders(): DemoOrder[] {
  return DEMO_ORDERS.filter((o) => o.status === 'pending');
}

export function getDemoOrder(idOrNo: string): DemoOrder | undefined {
  return DEMO_ORDERS.find((o) => o.id === idOrNo || o.orderNo === idOrNo);
}

export function todayStats(now: Date = new Date()): { orders: number; revenuePaisa: number } {
  const day = now.toDateString();
  const todays = DEMO_ORDERS.filter((o) => new Date(o.createdAt).toDateString() === day && o.status !== 'cancelled');
  return {
    orders: todays.length,
    revenuePaisa: todays.reduce((s, o) => s + o.totalPaisa, 0),
  };
}

export interface SalesPoint {
  date: string;
  label: string;
  orders: number;
  revenuePaisa: number;
}

export function salesSeries(days = 30): SalesPoint[] {
  const byDay = new Map<string, { orders: number; revenuePaisa: number }>();
  for (const o of DEMO_ORDERS) {
    if (o.status === 'cancelled') continue;
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    const cur = byDay.get(key) ?? { orders: 0, revenuePaisa: 0 };
    cur.orders += 1;
    cur.revenuePaisa += o.totalPaisa;
    byDay.set(key, cur);
  }
  const out: SalesPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    // Deterministic filler so the sparkline is never flat in demo.
    const filler = Math.round(40000 + 30000 * Math.abs(Math.sin(i * 1.7)) + (i % 7 === 0 ? 60000 : 0));
    const real = byDay.get(key);
    out.push({
      date: key,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      orders: real?.orders ?? (i % 4 === 0 ? 1 : 0),
      revenuePaisa: (real?.revenuePaisa ?? 0) + (real ? 0 : i % 4 === 0 ? filler : 0),
    });
  }
  return out;
}

export interface TopProduct {
  slug: string;
  name: string;
  qty: number;
  revenuePaisa: number;
}

export const DEMO_TOP_PRODUCTS: TopProduct[] = [
  { slug: 'classic-cotton-panjabi-white', name: 'Classic Cotton Panjabi', qty: 34, revenuePaisa: 11896600 },
  { slug: 'muslin-sharee-rose', name: 'Muslin Sharee', qty: 21, revenuePaisa: 18897900 },
  { slug: 'lawn-3pcs-mint', name: 'Lawn 3 Pcs Set', qty: 18, revenuePaisa: 5938200 },
  { slug: 'endi-fatua-natural', name: 'Endi Fatua', qty: 15, revenuePaisa: 4198500 },
  { slug: 'boys-kabli-mustard', name: 'Boys Kabli Set', qty: 12, revenuePaisa: 2998800 },
];

export const ORDER_STATUS_FLOW: OrderStatus[] = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];

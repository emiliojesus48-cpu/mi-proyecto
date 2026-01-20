
export enum Currency {
  VES = 'VES',
  USD = 'USD',
  EUR = 'EUR',
  USDT = 'USDT',
  GOLD = 'GOLD'
}

export enum PlanLevel {
  BASIC = 'Básico',
  PRO = 'Pro',
  PREMIUM = 'Premium'
}

export interface OperationalLimits {
  users: number;
  registers: number; // "Cajas"
  companies: number;
  products: number;
  features: string[];
}

export interface BusinessPlan {
  level: PlanLevel;
  price: number;
  limits: OperationalLimits;
}

export interface ExchangeRates {
  ves: number;
  eur: number; 
  usdt: number; 
  lastUpdated: string;
}

export interface BusinessInfo {
  name: string;
  rif: string;
  address: string;
  logo?: string;
}

export interface Supplier {
  id: string;
  name: string;
  rif: string;
  address: string;
  phone: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  basePriceUSD: number; 
  supplierCostUSD: number; 
  unit: string;
  barcode?: string;
  imageUrl?: string;
  lastPriceChange?: string;
}

export interface CartItem extends Product {
  cartQuantity: number;
}

export type PaymentMethodType = 'Efectivo' | 'Pago Móvil' | 'Zelle' | 'Punto' | 'Divisa' | 'USDT' | 'Oro';

export interface PaymentMethod {
  method: PaymentMethodType;
  amount: number;
  currency: Currency;
}

export interface CreditIdentity {
  firstName: string;
  lastName: string;
  idNumber: string;
  phone: string;
  address: string;
}

export interface Transaction {
  id: string;
  saleCode: string;
  type: 'IN' | 'OUT';
  items: { productId: string; name: string; quantity: number; priceUSD: number; costUSD: number }[];
  totalUSD: number;
  payments: PaymentMethod[];
  rateAtTimeVES: number;
  status: 'PAID' | 'PENDING';
  timestamp: string;
  category: 'SALE' | 'SUPPLY' | 'EXPENSE';
  referenceNumber?: string;
  identity?: CreditIdentity; // Identity data for credits
}

export interface Expense {
  id: string;
  description: string;
  amountUSD: number;
  category: string;
  date: string;
}

export interface AuditLog {
  id: string;
  event: string;
  user: string;
  timestamp: string;
  details: string;
  relatedTransaction?: Transaction; // For viewing ticket data from audit
}

export interface AppState {
  products: Product[];
  transactions: Transaction[];
  expenses: Expense[];
  auditLogs: AuditLog[];
  suppliers: Supplier[];
  rates: ExchangeRates;
  businessInfo: BusinessInfo;
  plan: BusinessPlan;
  user: {
    isAuthenticated: boolean;
    name: string;
  } | null;
}

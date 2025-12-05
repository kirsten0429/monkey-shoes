export type PaymentMethod = 'CASH' | 'LINE_PAY';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  isPaid: boolean;
  paymentMethod: PaymentMethod;
  createdAt: number; // timestamp
  notes?: string;
  photoPreview?: string; // Base64 thumbnail string
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  isVip: boolean; // Manual VIP or > 5 orders
  totalSpent: number;
  visitCount: number;
}

export interface DailyStats {
  date: string;
  revenue: number;
  count: number;
}
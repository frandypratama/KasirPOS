//src\types\transaction.ts
import { PaymentMethod } from './cart';

export type TransactionItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  subtotal: number;
};

export type Transaction = {
  id: string;
  invoiceNumber: string;

  items: TransactionItem[];

  // Subtotal sebelum diskon
  total: number;

  // Diskon
  discount: number;

  // Total setelah diskon
  grandTotal: number;

  // Uang customer
  paidAmount: number;

  // Kembalian
  changeAmount: number;

  paymentMethod: PaymentMethod;

  createdAt: Date;
};

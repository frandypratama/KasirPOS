// import type {Product, P}

import { Product } from "@/types/product";

export const STORAGE_KEY = 'minipos-products';

export const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Kopi Susu',
    sku: 'KOPI001',
    price: 18000,
    stock: 10,
  },
  {
    id: '2',
    name: 'Teh Manis',
    sku: 'TEH001',
    price: 8000,
    stock: 5,
  },
  {
    id: '3',
    name: 'Roti Bakar',
    sku: 'ROTI001',
    price: 15000,
    stock: 3,
  },
]


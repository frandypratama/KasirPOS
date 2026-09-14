'use client';
import { useAuth } from '@/components/auth/Auth-provider';
import { getProducts } from '@/services/product.service';
import { getTransactions } from '@/services/transaction.service';
import { Product } from '@/types/product';
import { Transaction } from '@/types/transaction';
import { formatCurrency } from '@/utils/currency';
import { Boxes, CircleDollarSign, ReceiptText, TriangleAlert } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const LOW_STOCK_LIMIT = 5;

const cards = [
  { label: 'Total Produk', value: '0', icon: Boxes },
  { label: 'Transaksi Hari Ini', value: '0', icon: ReceiptText },
  { label: 'Omzet Hari Ini', value: '0', icon: CircleDollarSign },
  { label: 'Stok menipis', value: '0', icon: TriangleAlert },
];

function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  async function loadDashboardData() {
    try {
      if (!user) return;
      setLoading(true);
      setError('');
      const [productData, transactionData] = await Promise.all([getProducts(user.uid), getTransactions(user.uid)]);
      setProducts(productData);
      setTransactions(transactionData as Transaction[]);
    } catch {
      setError('Gagal memuat data dahsboard');
    } finally {
      setLoading(false);
    }
  }

  function toDate(value: Date | { toDate: () => Date }) {
    return value instanceof Date ? value : value.toDate();
  }

  function isToday(value: Date | { toDate: () => Date }) {
    const date = toDate(value);
    const today = new Date();

    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }

  const todayTransactions = useMemo(() => {
    return transactions.filter((transaction) => isToday(transaction.createdAt));
  }, [transactions]);

  const todayRevenue = useMemo(() => {
    return todayTransactions.reduce((total, transaction) => total + transaction.total, 0);
  }, [todayTransactions]);

  const averageTransaction = todayTransactions.length ? todayRevenue / todayTransactions.length : 0;

  const lowStockProducts = useMemo(() => {
    return products.filter((product) => product.stock <= LOW_STOCK_LIMIT);
  }, [products]);

  const totalLowStock = lowStockProducts.length;

  const bestSellingProducts = useMemo(() => {
    const summary: Record<string, number> = {};

    todayTransactions.forEach(({ items }) => {
      items.forEach(({ name, qty }) => {
        summary[name] = (summary[name] ?? 0) + qty;
      });
    });

    return Object.entries(summary)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [todayTransactions]);

  const stats = [
    { label: 'Total Produk', value: products.length, icon: Boxes },
    {
      label: 'Transaksi Hari Ini',
      value: todayTransactions.length,
      icon: ReceiptText,
    },
    {
      label: 'Omzet Hari Ini',
      value: formatCurrency(todayRevenue),
      icon: CircleDollarSign,
    },
    {
      label: 'Stok Menipis',
      value: totalLowStock,
      icon: TriangleAlert,
    },
  ];

  const latestTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime()).slice(0, 5);
  }, [transactions]);

  useEffect(() => {
    loadDashboardData();
  });

  return (
    <div>
      <div className='mb-7'>
        <p className='text-sm font-bold text-indigo-600 '> Overview</p>
        <h1 className='mt-1 text-3xl font-black tracking-tight'>Dashboard</h1>
        <p className='mt-2 text-sm text-slate-500'>Ringkasan aktivitas MiniPOS Hari ini</p>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {stats.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
              <div className='grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600'>
                <Icon size={19} />
              </div>
              <div className='mt-5 text-sm font-semibold text-slate-500'>{card.label}</div>
              <div className='mt-1 text-2xl font-black tracking-tight text-slate-950'>{card.value}</div>
            </div>
          );
        })}
      </div>

      <section className='mt-6 rounded-2xl border bg-white p-5 shadow-sm'>
        <h2 className='text-lg font-black text-slate-800'>Produk Terlaris Hari Ini</h2>

        {bestSellingProducts.length === 0 ? (
          <p className='mt-4 text-sm text-slate-500'>Belum ada penjualan hari ini.</p>
        ) : (
          <div className='mt-6 space-y-5'>
            {(() => {
              const maxQuantity = Math.max(...bestSellingProducts.map(([, quantity]) => quantity));

              const colors = ['bg-indigo-600', 'bg-emerald-500', 'bg-violet-600', 'bg-orange-500', 'bg-pink-500'];

              return bestSellingProducts.map(([name, quantity], index) => {
                const percentage = (quantity / maxQuantity) * 100;

                return (
                  <div key={name} className='flex flex-col gap-1'>
                    <div className='flex flex-row items-center justify-between'>
                      {/* NAMA */}
                      <div className='w-28 shrink-0 truncate text-xs font-medium text-slate-500'>{name}</div>

                      {/* JUMLAH TERJUAL */}
                      <div className='w-20 shrink-0 text-right'>
                        <span className='text-sm font-bold text-slate-700'>{quantity}</span>
                        <span className='ml-1 text-xs text-slate-400'>terjual</span>
                      </div>
                    </div>
                    {/* BAR */}
                    <div className='flex-1'>
                      <div className='h-4 w-full overflow-hidden rounded-sm bg-slate-100'>
                        <div
                          className={`h-full ${colors[index % colors.length]} transition-all duration-500`}
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </section>

      <section className='mt-6 rounded-2xl border bg-white p-5 shadow-sm'>
        <h2 className='text-lg font-black text-slate-800'>Stok Menipis</h2>

        {lowStockProducts.length === 0 ? (
          <p className='mt-4 text-sm text-slate-500'>Semua stok masih aman.</p>
        ) : (
          <div className='mt-6 space-y-5'>
            {lowStockProducts.map((product) => {
              // Misalnya batas stok aman adalah 10
              const maxStock = 10;

              const percentage = Math.min((product.stock / maxStock) * 100, 100);

              return (
                <div key={product.id} className='space-y-2'>
                  {/* Nama + jumlah */}
                  <div className='flex items-center justify-between'>
                    <span className='truncate pr-4 font-semibold text-slate-700'>{product.name}</span>

                    <span className='shrink-0 text-sm font-bold text-amber-600'>Stok {product.stock}</span>
                  </div>

                  {/* Progress bar */}
                  <div className='h-3 w-full overflow-hidden rounded-full bg-slate-100'>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${product.stock <= 2 ? 'bg-red-500' : 'bg-amber-500'}`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;

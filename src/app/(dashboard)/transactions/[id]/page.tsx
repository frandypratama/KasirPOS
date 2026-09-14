'use client';

import { useAuth } from '@/components/auth/Auth-provider';
import { getTransactionById } from '@/services/transaction.service';
import { Transaction } from '@/types/transaction';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { ArrowLeft, Banknote, CheckCircle, CreditCard, Package, ReceiptText, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const PAYMENT_INFO: Record<string, { label: string; icon: React.ElementType; className: string; iconClass: string }> = {
  cash: {
    label: 'Tunai',
    icon: Banknote,
    className: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    iconClass: 'text-emerald-600 bg-emerald-100',
  },
  transfer: {
    label: 'Transfer Bank',
    icon: CreditCard,
    className: 'bg-blue-50 border-blue-200 text-blue-700',
    iconClass: 'text-blue-600 bg-blue-100',
  },
  qris: {
    label: 'QRIS',
    icon: Smartphone,
    className: 'bg-violet-50 border-violet-200 text-violet-700',
    iconClass: 'text-violet-600 bg-violet-100',
  },
};

function SkeletonDetail() {
  return (
    <div className='animate-pulse space-y-6'>
      <div className='h-8 w-48 rounded-xl bg-slate-200' />
      <div className='rounded-2xl border border-slate-200 bg-white p-8'>
        <div className='flex items-start justify-between'>
          <div className='space-y-2'>
            <div className='h-6 w-40 rounded-lg bg-slate-200' />
            <div className='h-4 w-24 rounded-lg bg-slate-200' />
          </div>
          <div className='h-10 w-28 rounded-full bg-slate-200' />
        </div>
        <div className='mt-8 space-y-3'>
          {[0, 1, 2].map((i) => (
            <div key={i} className='flex justify-between'>
              <div className='h-4 w-36 rounded-md bg-slate-200' />
              <div className='h-4 w-24 rounded-md bg-slate-200' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center py-24 text-center'>
      <div className='mb-4 grid size-16 place-items-center rounded-2xl bg-slate-100'>
        <ReceiptText size={28} className='text-slate-400' />
      </div>
      <h3 className='font-bold text-slate-800'>Transaksi tidak ditemukan</h3>
      <p className='mt-1 text-sm text-slate-500'>Transaksi yang kamu cari tidak ada atau telah dihapus.</p>
      <Link href='/transactions' className='mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700'>
        <ArrowLeft size={15} />
        Kembali ke Daftar
      </Link>
    </div>
  );
}

function TransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const {user} = useAuth()

  useEffect(() => {
    async function loadData() {
      if(!user) return
      const data = await getTransactionById(user.uid,params.id);
      if (!data) {
        setNotFound(true);
      } else {
        setTransaction(data as Transaction);
      }
      setLoading(false);
    }
    loadData();
  }, [params.id]);

  if (loading) {
    return (
      <div>
        <div className='mb-6'>
          <div className='h-5 w-32 animate-pulse rounded-lg bg-slate-200' />
        </div>
        <SkeletonDetail />
      </div>
    );
  }

  if (notFound || !transaction) {
    return <NotFound />;
  }

  const payment = PAYMENT_INFO[transaction.paymentMethod] ?? {
    label: transaction.paymentMethod,
    icon: Banknote,
    className: 'bg-slate-50 border-slate-200 text-slate-700',
    iconClass: 'text-slate-600 bg-slate-100',
  };
  const PaymentIcon = payment.icon;

  return (
    <div>
      {/* Back link */}
      <Link href='/transactions' className='mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600'>
        <ArrowLeft size={16} />
        Kembali ke Daftar
      </Link>

      {/* Invoice card */}
      <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
        {/* Invoice header */}
        <div className='border-b border-slate-100 bg-linear-to-r from-indigo-600 to-indigo-500 px-8 py-8'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <div className='flex items-center gap-2 text-indigo-200'>
                <ReceiptText size={16} />
                <span className='text-sm font-semibold uppercase tracking-widest'>Invoice</span>
              </div>
              <div className='mt-1 font-mono text-2xl font-black text-white'>{transaction.invoiceNumber}</div>
            </div>
            <div className='flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm'>
              <CheckCircle size={16} className='text-emerald-300' />
              <span className='text-sm font-bold text-white'>Selesai</span>
            </div>
          </div>
        </div>

        <div className='px-8 py-8'>
          {/* Date & payment method row */}
          <div className='mb-8 flex flex-wrap gap-6'>
            <div>
              <div className='text-xs font-semibold uppercase tracking-wider text-slate-400'>Tanggal Transaksi</div>
              <div className='mt-1 font-semibold text-slate-800'>{formatDate(new Date(transaction.createdAt))}</div>
            </div>
            <div>
              <div className='text-xs font-semibold uppercase tracking-wider text-slate-400'>Metode Pembayaran</div>
              <div className={`mt-1 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${payment.className}`}>
                <span className={`grid size-5 place-items-center rounded-full ${payment.iconClass}`}>
                  <PaymentIcon size={12} />
                </span>
                {payment.label}
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className='mb-8'>
            <div className='mb-3 flex items-center gap-2'>
              <Package size={16} className='text-slate-400' />
              <h2 className='text-sm font-bold uppercase tracking-wider text-slate-500'>Item Pesanan</h2>
            </div>
            <div className='overflow-hidden rounded-xl border border-slate-100'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='bg-slate-50 text-xs'>
                    <th className='px-4 py-3 text-left font-bold uppercase tracking-wider text-slate-500'>Produk</th>
                    <th className='px-4 py-3 text-center font-bold uppercase tracking-wider text-slate-500'>Qty</th>
                    <th className='px-4 py-3 text-right font-bold uppercase tracking-wider text-slate-500'>Harga</th>
                    <th className='px-4 py-3 text-right font-bold uppercase tracking-wider text-slate-500'>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {transaction.items.map((item, index) => (
                    <tr key={`${item.productId}-${index}`} className='border-t border-slate-100 hover:bg-slate-50'>
                      <td className='px-4 py-3 font-medium text-slate-800'>{item.name}</td>
                      <td className='px-4 py-3 text-center text-slate-600'>
                        <span className='inline-flex size-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700'>{item.qty}</span>
                      </td>
                      <td className='px-4 py-3 text-right text-slate-600'>{formatCurrency(item.price)}</td>
                      <td className='px-4 py-3 text-right font-semibold text-slate-800'>{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className='ml-auto max-w-sm rounded-2xl bg-slate-50 p-5'>
            <div className='space-y-3'>
              <div className='flex justify-between text-sm'>
                <span className='text-slate-500'>Subtotal</span>
                <span className='font-semibold text-slate-800'>{formatCurrency(transaction.total)}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-slate-500'>Dibayar</span>
                <span className='font-semibold text-slate-800'>{formatCurrency(transaction.paidAmount)}</span>
              </div>
              <div className='my-2 border-t border-slate-200' />
              <div className='flex justify-between'>
                <span className='font-bold text-slate-700'>Total</span>
                <span className='text-lg font-black text-slate-900'>{formatCurrency(transaction.total)}</span>
              </div>
              <div className='flex justify-between rounded-xl bg-emerald-50 px-4 py-3'>
                <span className='text-sm font-semibold text-emerald-700'>Kembalian</span>
                <span className='font-black text-emerald-700'>{formatCurrency(transaction.changeAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='border-t border-slate-100 bg-slate-50 px-8 py-5 text-center text-xs text-slate-400'>Terima kasih sudah berbelanja - MiniPOS</div>
      </div>
    </div>
  );
}

export default TransactionDetailPage;

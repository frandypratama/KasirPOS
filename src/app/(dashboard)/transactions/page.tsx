'use client';

import { useAuth } from '@/components/auth/Auth-provider';
import PrintButton from '@/components/transactions/print-button';
import { getTransactions } from '@/services/transaction.service';
import { Transaction } from '@/types/transaction';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import {
  ArrowRight,
  ReceiptText,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// =========================================
// PAYMENT BADGE
// =========================================

const PAYMENT_BADGE: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  cash: {
    label: 'Tunai',
    className:
      'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  },

  transfer: {
    label: 'Transfer',
    className:
      'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  },

  qris: {
    label: 'QRIS',
    className:
      'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  },
};

// =========================================
// SKELETON ROW
// =========================================

function SkeletonRow() {
  return (
    <tr className='animate-pulse border-b border-slate-100'>
      {/* Invoice */}
      <td className='px-6 py-4'>
        <div className='h-4 w-32 rounded-md bg-slate-200' />
      </td>

      {/* Tanggal */}
      <td className='px-6 py-4'>
        <div className='h-4 w-40 rounded-md bg-slate-200' />
      </td>

      {/* Total */}
      <td className='px-6 py-4'>
        <div className='h-4 w-24 rounded-md bg-slate-200' />
      </td>

      {/* Pembayaran */}
      <td className='px-6 py-4'>
        <div className='h-6 w-20 rounded-full bg-slate-200' />
      </td>

      {/* Aksi */}
      <td className='px-6 py-4'>
        <div className='ml-auto h-8 w-32 rounded-lg bg-slate-200' />
      </td>
    </tr>
  );
}

// =========================================
// EMPTY TRANSACTIONS
// =========================================

function EmptyTransactions() {
  return (
    <tr>
      <td colSpan={5}>
        <div className='flex flex-col items-center justify-center py-20 text-center'>
          {/* Icon */}
          <div className='mb-4 grid size-16 place-items-center rounded-2xl bg-slate-100'>
            <ShoppingBag
              size={28}
              className='text-slate-400'
            />
          </div>

          {/* Title */}
          <h3 className='font-bold text-slate-800'>
            Belum ada transaksi
          </h3>

          {/* Description */}
          <p className='mt-1 text-sm text-slate-500'>
            Transaksi yang sudah selesai akan muncul
            di sini.
          </p>

          {/* Button */}
          <Link
            href='/transactions/new'
            className='mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700'
          >
            Buat Transaksi Baru

            <ArrowRight size={16} />
          </Link>
        </div>
      </td>
    </tr>
  );
}

// =========================================
// TRANSACTIONS PAGE
// =========================================

function TransactionsPage() {
  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [loading, setLoading] =
    useState(true);

  const { user } = useAuth();

  // =========================================
  // LOAD TRANSACTIONS
  // =========================================

  useEffect(() => {
    async function loadData() {
      // Belum login
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const data =
          await getTransactions(user.uid);

        setTransactions(data);
      } catch (error) {
        console.error(
          'Gagal mengambil transaksi:',
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  // =========================================
  // TOTAL OMZET
  // =========================================

  const totalOmzet =
    transactions.reduce(
      (acc, transaction) =>
        acc + transaction.grandTotal,
      0
    );

  // =========================================
  // RENDER
  // =========================================

  return (
    <div>
      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <div className='mb-7'>
        <p className='text-sm font-bold text-indigo-600'>
          Riwayat
        </p>

        <h1 className='mt-1 text-3xl font-black tracking-tight text-white'>
          Transaksi
        </h1>

        <p className='mt-2 text-sm text-slate-500'>
          Semua riwayat transaksi penjualan MiniPOS
        </p>
      </div>

      {/* ===================================== */}
      {/* STATS SUMMARY */}
      {/* ===================================== */}

      {!loading &&
        transactions.length > 0 && (
          <div className='mb-6 flex flex-wrap gap-4'>
            {/* TOTAL TRANSAKSI */}

            <div className='flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm'>
              <div className='grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600'>
                <ReceiptText size={18} />
              </div>

              <div>
                <div className='text-xs font-semibold text-slate-500'>
                  Total Transaksi
                </div>

                <div className='text-xl font-black text-slate-900'>
                  {transactions.length}
                </div>
              </div>
            </div>

            {/* TOTAL OMZET */}

            <div className='flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm'>
              <div className='grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600'>
                <ShoppingBag size={18} />
              </div>

              <div>
                <div className='text-xs font-semibold text-slate-500'>
                  Total Omzet
                </div>

                <div className='text-xl font-black text-slate-900'>
                  {formatCurrency(totalOmzet)}
                </div>
              </div>
            </div>
          </div>
        )}

      {/* ===================================== */}
      {/* TABLE */}
      {/* ===================================== */}

      <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            {/* ================================= */}
            {/* TABLE HEADER */}
            {/* ================================= */}

            <thead>
              <tr className='border-b border-slate-100 bg-slate-50'>
                <th className='px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500'>
                  No. Invoice
                </th>

                <th className='px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500'>
                  Tanggal
                </th>

                <th className='px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500'>
                  Total
                </th>

                <th className='px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500'>
                  Pembayaran
                </th>

                <th className='px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-500'>
                  Aksi
                </th>
              </tr>
            </thead>

            {/* ================================= */}
            {/* TABLE BODY */}
            {/* ================================= */}

            <tbody>
              {/* LOADING */}

              {loading ? (
                Array.from({ length: 5 }).map(
                  (_, index) => (
                    <SkeletonRow
                      key={index}
                    />
                  )
                )
              ) : /* EMPTY */ transactions.length ===
                0 ? (
                <EmptyTransactions />
              ) : (
                /* DATA */
                transactions.map(
                  (transaction) => {
                    // Payment badge
                    const badge =
                      PAYMENT_BADGE[
                        transaction.paymentMethod
                      ] ?? {
                        label:
                          transaction.paymentMethod,

                        className:
                          'bg-slate-100 text-slate-600',
                      };

                    return (
                      <tr
                        key={
                          transaction.id
                        }
                        className='group border-b border-slate-100 transition last:border-0 hover:bg-slate-50'
                      >
                        {/* ================================= */}
                        {/* INVOICE */}
                        {/* ================================= */}

                        <td className='px-6 py-4'>
                          <span className='font-mono text-xs font-bold text-indigo-600'>
                            {
                              transaction.invoiceNumber
                            }
                          </span>
                        </td>

                        {/* ================================= */}
                        {/* TANGGAL */}
                        {/* ================================= */}

                        <td className='px-6 py-4 text-slate-600'>
                          {transaction.createdAt
                            ? formatDate(
                                new Date(
                                  transaction.createdAt
                                )
                              )
                            : '-'}
                        </td>

                        {/* ================================= */}
                        {/* TOTAL */}
                        {/* ================================= */}

                        <td className='px-6 py-4 font-bold text-slate-900'>
                          {formatCurrency(
                            transaction.grandTotal
                          )}
                        </td>

                        {/* ================================= */}
                        {/* PEMBAYARAN */}
                        {/* ================================= */}

                        <td className='px-6 py-4'>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </td>

                        {/* ================================= */}
                        {/* AKSI */}
                        {/* ================================= */}

                        <td className='px-6 py-4 text-right'>
                          <div className='flex items-center justify-end gap-2'>
                            {/* DETAIL */}

                            <Link
                              href={`/transactions/${transaction.id}`}
                              className='inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-indigo-100 hover:text-indigo-700'
                            >
                              Detail

                              <ArrowRight
                                size={13}
                              />
                            </Link>

                            {/* PRINT */}

                            <PrintButton
                              invoiceNumber={
                                transaction.invoiceNumber
                              }

                              date={
                                transaction.createdAt
                                  ? formatDate(
                                      new Date(
                                        transaction.createdAt
                                      )
                                    )
                                  : '-'
                              }

                              items={
                                transaction.items
                              }

                              total={
                                transaction.total
                              }

                              discount={
                                transaction.discount
                              }

                              grandTotal={
                                transaction.grandTotal
                              }

                              paidAmount={
                                transaction.paidAmount
                              }

                              changeAmount={
                                transaction.changeAmount
                              }

                              paymentMethod={
                                transaction.paymentMethod
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TransactionsPage;

"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  subtotal: number;
};

type PaymentMethod = "cash" | "transfer" | "qris";

type Transaction = {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
};

export default function InvoicePage() {
  const router = useRouter();

  const params = useParams<{ id: string }>();

  const [transaction, setTransaction] =
    useState<Transaction | null>(null);

  const [loading, setLoading] = useState(true);

  // ================================
  // FORMAT RUPIAH
  // ================================

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  }

  // ================================
  // FORMAT TANGGAL
  // ================================

  function formatDate(date: string) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Tanggal tidak valid";
    }

    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(parsedDate);
  }

  // ================================
  // AMBIL TRANSAKSI
  // ================================

  useEffect(() => {
    const saved = localStorage.getItem("transactions");

    if (!saved) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        setLoading(false);
        return;
      }

      const invoiceId = decodeURIComponent(
        String(params.id)
      );

      const found = parsed.find(
        (item: Transaction) =>
          String(item.id) === invoiceId
      );

      if (found) {
        setTransaction(found);
      }
    } catch (error) {
      console.error(
        "Gagal membaca transaksi:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  // ================================
  // LOADING
  // ================================

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Memuat invoice...
        </p>
      </div>
    );
  }

  // ================================
  // TIDAK DITEMUKAN
  // ================================

  if (!transaction) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold">
            Invoice tidak ditemukan
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Data transaksi tidak tersedia.
          </p>

          <button
            type="button"
            onClick={() => router.push("/transactions")}
            className="
              mt-4
              rounded-lg
              border
              px-4
              py-2
              text-sm
              font-semibold
              hover:bg-muted
            "
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // ================================
  // INVOICE
  // ================================

  return (
    <div className="min-h-screen">

      {/* ================================
          TOOLBAR
      ================================= */}

      <div
        className="
          print:hidden
          mb-5
          flex
          items-center
          justify-between
        "
      >
        <button
          type="button"
          onClick={() => router.push("/transactions")}
          className="
            flex
            items-center
            gap-2
            rounded-lg
            border
            px-3
            py-2
            text-sm
            font-semibold
            hover:bg-muted
          "
        >
          <ArrowLeft size={16} />

          Kembali
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="
            flex
            items-center
            gap-2
            rounded-lg
            bg-black
            px-4
            py-2
            text-sm
            font-semibold
            text-white
            hover:opacity-80
          "
        >
          <Printer size={16} />

          Cetak Invoice
        </button>
      </div>

      {/* ================================
          INVOICE
      ================================= */}

      <div
        id="invoice"
        className="
          invoice-print
          mx-auto
          w-full
          max-w-2xl
          rounded-xl
          border
          bg-white
          p-6
          text-black
          shadow-sm
        "
      >

        {/* HEADER */}

        <div
          className="
            border-b
            border-black
            pb-4
            text-center
          "
        >
          <h1 className="text-2xl font-black">
            INVOICE
          </h1>

          <p className="mt-1 text-sm font-bold">
            MiniPOS
          </p>

          <p className="mt-3 text-xs font-semibold">
            {transaction.id}
          </p>

          <p className="mt-1 text-xs">
            {formatDate(transaction.date)}
          </p>
        </div>

        {/* DETAIL PRODUK */}

        <div className="py-4">

          <h2 className="mb-3 text-xs font-bold">
            Detail Produk
          </h2>

          <div>
            {transaction.items.map(
              (item, index) => (
                <div
                  key={`${item.productId}-${index}`}
                  className="
                    mb-3
                    flex
                    items-start
                    justify-between
                    border-b
                    border-black
                    pb-3
                  "
                >

                  <div className="min-w-0">
                    <p className="text-xs font-bold">
                      {item.name}
                    </p>

                    <p className="mt-1 text-[10px]">
                      {item.qty} x{" "}
                      {formatCurrency(item.price)}
                    </p>
                  </div>

                  <p
                    className="
                      ml-2
                      whitespace-nowrap
                      text-xs
                      font-bold
                    "
                  >
                    {formatCurrency(item.subtotal)}
                  </p>

                </div>
              )
            )}
          </div>

        </div>

        {/* TOTAL */}

        <div className="border-t border-black pt-3">

          {/* SUBTOTAL */}

          <div
            className="
              flex
              justify-between
              text-xs
            "
          >
            <span>
              Subtotal
            </span>

            <span>
              {formatCurrency(
                transaction.subtotal
              )}
            </span>
          </div>

          {/* DISKON */}

          <div
            className="
              mt-2
              flex
              justify-between
              text-xs
            "
          >
            <span>
              Diskon
            </span>

            <span className="text-red-600">
              - {formatCurrency(
                transaction.discount
              )}
            </span>
          </div>

          {/* TOTAL */}

          <div
            className="
              mt-3
              flex
              justify-between
              border-t
              border-black
              pt-3
              text-sm
              font-black
            "
          >
            <span>
              Total
            </span>

            <span>
              {formatCurrency(
                transaction.total
              )}
            </span>
          </div>

          {/* PEMBAYARAN */}

          <div
            className="
              mt-3
              flex
              justify-between
              text-xs
            "
          >
            <span>
              Metode Pembayaran
            </span>

            <span className="font-bold uppercase">
              {transaction.paymentMethod}
            </span>
          </div>

        </div>

        {/* FOOTER */}

        <div
          className="
            mt-5
            border-t
            border-black
            pt-4
            text-center
          "
        >
          <p className="text-xs font-bold">
            Terima kasih telah berbelanja
          </p>

          <p className="mt-1 text-[10px]">
            Invoice ini dibuat oleh MiniPOS
          </p>
        </div>

      </div>
{/* ================================
          PRINT CSS
      ================================= */}
<style>{`
        @media print {

          @page {
            size: 80mm auto;
            margin: 0;
          }
 
          html,
          body {
            width: 80mm !important;
            min-width: 80mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body {
            overflow: visible !important;
          }

          aside,
          nav,
          header,
          footer {
            display: none !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          .invoice-print {
            position: absolute !important;

            left: 0 !important;
            top: 0 !important;

            width: 80mm !important;
            min-width: 80mm !important;
            max-width: 80mm !important;

            margin: 0 !important;
            padding: 4mm !important;

            border: none !important;
            border-radius: 0 !important;

            box-shadow: none !important;

            background: white !important;

            color: black !important;

            font-size: 9px !important;

            box-sizing: border-box !important;
          }

          .invoice-print * {
            box-sizing: border-box !important;
          }
        }
      `}</style>
      
      
    </div>
  );
}
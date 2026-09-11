"use client";

import { useEffect, useState } from "react";
import {
  Boxes,
  CircleDollarSign,
  ReceiptText,
  TriangleAlert,
} from "lucide-react";

import { getProducts } from "@/services/product.service";
import type { Product } from "@/types/product";

// ======================================================
// TYPE ITEM TRANSAKSI
// ======================================================

type TransactionItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  subtotal: number;
};

// ======================================================
// TYPE TRANSAKSI
// ======================================================

type Transaction = {
  id: string;
  date: string;
  total: number;
  items?: TransactionItem[];
  cartItems?: TransactionItem[];
};

// ======================================================
// TYPE PRODUK TERLARIS
// ======================================================

type BestSeller = {
  productId: string;
  name: string;
  qty: number;
};

// ======================================================
// DASHBOARD PAGE
// ======================================================

export default function DashboardPage() {
  // ====================================================
  // STATE
  // ====================================================

  const [totalProducts, setTotalProducts] = useState(0);

  const [todayTransactions, setTodayTransactions] =
    useState(0);

  const [todayRevenue, setTodayRevenue] =
    useState(0);

  const [lowStock, setLowStock] = useState(0);

  // Produk yang stoknya <= 5
  const [lowStockProducts, setLowStockProducts] =
    useState<Product[]>([]);

  const [bestSellers, setBestSellers] =
    useState<BestSeller[]>([]);

  // ====================================================
  // FORMAT RUPIAH
  // ====================================================

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  // ====================================================
  // LOAD DASHBOARD
  // ====================================================

  useEffect(() => {
    async function loadDashboard() {
      try {
        // ==================================================
        // AMBIL PRODUK DARI FIREBASE
        // ==================================================

        const products: Product[] =
          await getProducts();

        console.log(
          "Produk dari Firebase:",
          products
        );

        // ==================================================
        // TOTAL PRODUK
        // ==================================================

        setTotalProducts(products.length);

        // ==================================================
        // STOK MENIPIS
        // ==================================================

        const lowStockData =
          products.filter(
            (product) =>
              Number(product.stock) <= 5
          );

        // Jumlah produk stok menipis
        setLowStock(
          lowStockData.length
        );

        // Simpan daftar produk stok menipis
        setLowStockProducts(
          lowStockData
        );

        console.log(
          "Produk stok menipis:",
          lowStockData
        );

        // ==================================================
        // AMBIL TRANSAKSI
        // ==================================================

        const savedTransactions =
          localStorage.getItem(
            "transactions"
          );

        let transactions: Transaction[] = [];

        if (savedTransactions) {
          try {
            const parsed =
              JSON.parse(
                savedTransactions
              );

            if (
              Array.isArray(parsed)
            ) {
              transactions = parsed;
            }
          } catch (error) {
            console.error(
              "Data transaksi tidak valid:",
              error
            );
          }
        }

        console.log(
          "Semua transaksi:",
          transactions
        );

        // ==================================================
        // TANGGAL HARI INI
        // ==================================================

        const today = new Date();

        const todayString =
          today.toLocaleDateString(
            "en-CA"
          );

        // ==================================================
        // FILTER TRANSAKSI HARI INI
        // ==================================================

        const transactionsToday =
          transactions.filter(
            (transaction) => {
              if (!transaction.date) {
                return false;
              }

              const transactionDate =
                new Date(
                  transaction.date
                );

              if (
                Number.isNaN(
                  transactionDate.getTime()
                )
              ) {
                return false;
              }

              const transactionDateString =
                transactionDate.toLocaleDateString(
                  "en-CA"
                );

              return (
                transactionDateString ===
                todayString
              );
            }
          );

        console.log(
          "Transaksi hari ini:",
          transactionsToday
        );

        // ==================================================
        // JUMLAH TRANSAKSI HARI INI
        // ==================================================

        setTodayTransactions(
          transactionsToday.length
        );

        // ==================================================
        // HITUNG OMZET
        // ==================================================

        const revenue =
          transactionsToday.reduce(
            (
              total,
              transaction
            ) => {
              return (
                total +
                Number(
                  transaction.total || 0
                )
              );
            },
            0
          );

        setTodayRevenue(revenue);

        console.log(
          "Omzet hari ini:",
          revenue
        );

        // ==================================================
        // HITUNG PRODUK TERLARIS
        // ==================================================

        const salesMap: Record<
          string,
          BestSeller
        > = {};

        transactionsToday.forEach(
          (transaction) => {
            // Bisa menggunakan:
            // transaction.items
            // atau
            // transaction.cartItems

            const items =
              transaction.items ||
              transaction.cartItems ||
              [];

            items.forEach(
              (item) => {
                const productId =
                  String(
                    item.productId
                  );

                const productName =
                  item.name ||
                  "Produk";

                const quantity =
                  Number(
                    item.qty || 0
                  );

                // Abaikan qty 0
                if (
                  quantity <= 0
                ) {
                  return;
                }

                // Produk belum ada
                if (
                  !salesMap[
                    productId
                  ]
                ) {
                  salesMap[
                    productId
                  ] = {
                    productId,
                    name: productName,
                    qty: 0,
                  };
                }

                // Tambahkan quantity
                salesMap[
                  productId
                ].qty += quantity;
              }
            );
          }
        );

        // ==================================================
        // SORT PRODUK TERLARIS
        // ==================================================

        const sortedBestSellers =
          Object.values(
            salesMap
          )
            .sort(
              (a, b) =>
                b.qty - a.qty
            )
            .slice(0, 5);

        setBestSellers(
          sortedBestSellers
        );

        console.log(
          "Produk terlaris hari ini:",
          sortedBestSellers
        );
      } catch (error) {
        console.error(
          "Gagal memuat Dashboard:",
          error
        );
      }
    }

    loadDashboard();
  }, []);

  // ======================================================
  // PERSENTASE CARD
  // ======================================================

  // Total produk
  // 20 produk = 100%

  const productPercentage =
    Math.min(
      (totalProducts / 20) * 100,
      100
    );

  // Transaksi
  // 10 transaksi = 100%

  const transactionPercentage =
    Math.min(
      (todayTransactions / 10) *
        100,
      100
    );

  // Omzet
  // Rp1.000.000 = 100%

  const revenuePercentage =
    Math.min(
      (todayRevenue / 1000000) *
        100,
      100
    );

  // Stok menipis
  // 5 produk = 100%

  const lowStockPercentage =
    Math.min(
      (lowStock / 5) * 100,
      100
    );

  // ======================================================
  // NILAI TERBESAR PRODUK TERLARIS
  // ======================================================

  const highestSales =
    bestSellers.length > 0
      ? bestSellers[0].qty
      : 0;

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="p-6 lg:p-8">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-7">

          <p className="text-sm font-bold text-indigo-600">
            OVERVIEW
          </p>

          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Ringkasan aktivitas MiniPOS hari ini.
          </p>

        </div>


        {/* ==================================================
            4 STATISTIC CARDS
        ================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* ==================================================
              TOTAL PRODUK
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="grid size-10 place-items-center rounded-full bg-indigo-50 text-indigo-600">
              <Boxes size={19} />
            </div>

            <div className="mt-5 text-sm font-semibold text-slate-500">
              Total produk
            </div>

            <div className="mt-1 text-2xl font-black tracking-tight text-slate-950">
              {totalProducts}
            </div>

            <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-slate-200">

              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                style={{
                  width: `${productPercentage}%`,
                }}
              />

            </div>

          </div>


          {/* ==================================================
              TRANSAKSI HARI INI
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="grid size-10 place-items-center rounded-full bg-indigo-50 text-indigo-600">
              <ReceiptText size={19} />
            </div>

            <div className="mt-5 text-sm font-semibold text-slate-500">
              Transaksi hari ini
            </div>

            <div className="mt-1 text-2xl font-black tracking-tight text-slate-950">
              {todayTransactions}
            </div>

            <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-slate-200">

              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                style={{
                  width: `${transactionPercentage}%`,
                }}
              />

            </div>

          </div>


          {/* ==================================================
              OMZET HARI INI
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="grid size-10 place-items-center rounded-full bg-indigo-50 text-indigo-600">
              <CircleDollarSign size={19} />
            </div>

            <div className="mt-5 text-sm font-semibold text-slate-500">
              Omzet hari ini
            </div>

            <div className="mt-1 text-2xl font-black tracking-tight text-slate-950">
              {formatCurrency(
                todayRevenue
              )}
            </div>

            <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-slate-200">

              <div
                className="h-full rounded-full bg-violet-500 transition-all duration-700"
                style={{
                  width: `${revenuePercentage}%`,
                }}
              />

            </div>

          </div>


          {/* ==================================================
              STOK MENIPIS
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="grid size-10 place-items-center rounded-full bg-indigo-50 text-indigo-600">
              <TriangleAlert size={19} />
            </div>

            <div className="mt-5 text-sm font-semibold text-slate-500">
              Stok menipis
            </div>

            <div className="mt-1 text-2xl font-black tracking-tight text-slate-950">
              {lowStock}
            </div>

            <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-slate-200">

              <div
                className="h-full rounded-full bg-orange-500 transition-all duration-700"
                style={{
                  width: `${lowStockPercentage}%`,
                }}
              />

            </div>

          </div>

        </div>


        {/* ==================================================
            BOTTOM SECTION
        ================================================== */}

        <div className="mt-7 grid gap-6 lg:grid-cols-[1.8fr_1fr]">


          {/* ==================================================
              PRODUK TERLARIS
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

            {/* TITLE */}

            <h2 className="text-lg font-black text-slate-900">
              Produk terlaris hari ini
            </h2>


            {/* PRODUK */}

            <div className="mt-6 space-y-6">

              {bestSellers.length === 0 ? (

                <div className="py-10 text-center">

                  <p className="text-sm text-slate-400">
                    Belum ada transaksi
                    hari ini.
                  </p>

                </div>

              ) : (

                bestSellers.map(
                  (
                    product,
                    index
                  ) => {

                    // ==================================================
                    // HITUNG PANJANG BAR
                    // ==================================================

                    const percentage =
                      highestSales > 0
                        ? (product.qty /
                            highestSales) *
                          100
                        : 0;

                    // ==================================================
                    // WARNA BAR
                    // ==================================================

                    const barColors = [
                      "bg-indigo-500",
                      "bg-emerald-500",
                      "bg-orange-500",
                      "bg-violet-500",
                      "bg-cyan-500",
                    ];

                    const barColor =
                      barColors[
                        index %
                          barColors.length
                      ];

                    return (

                      <div
                        key={
                          product.productId
                        }
                        className="flex items-center gap-4"
                      >

                        {/* NAMA PRODUK */}

                        <div className="w-40 shrink-0 truncate text-sm font-bold text-slate-800">
                          {product.name}
                        </div>


                        {/* PROGRESS */}

                        <div className="h-4 flex-1 overflow-hidden rounded-full bg-slate-100">

                          <div
                            className={`h-full rounded-full ${barColor} transition-all duration-700`}
                            style={{
                              width: `${percentage}%`,
                            }}
                          />

                        </div>


                        {/* JUMLAH */}

                        <div className="w-8 text-right text-sm font-semibold text-slate-500">
                          {product.qty}
                        </div>

                      </div>

                    );
                  }
                )

              )}

            </div>

          </div>


          {/* ==================================================
              STOK MENIPIS
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

            {/* HEADER */}

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-lg font-black text-slate-900">
                  Stok menipis
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Produk dengan stok ≤ 5
                </p>

              </div>

              <div className="grid size-10 place-items-center rounded-full bg-orange-50 text-orange-500">
                <TriangleAlert size={19} />
              </div>

            </div>


            {/* LIST PRODUK */}

            <div className="mt-6 space-y-3">

              {lowStockProducts.length === 0 ? (

                /* SEMUA STOK AMAN */

                <div className="rounded-xl bg-emerald-50 px-4 py-5 text-center">

                  <p className="text-sm font-semibold text-emerald-600">
                    Semua stok aman
                  </p>

                </div>

              ) : (

                lowStockProducts.map(
                  (product) => {

                    const stock =
                      Number(
                        product.stock
                      );

                    return (

                      <div
                        key={product.id}
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                      >

                        {/* NAMA PRODUK */}

                        <div className="min-w-0">

                          <p className="truncate text-sm font-bold text-slate-800">
                            {product.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            SKU: {product.sku}
                          </p>

                        </div>


                        {/* JUMLAH STOK */}

                        <div
                          className={`ml-3 shrink-0 rounded-lg px-3 py-1 text-xs font-black ${
                            stock <= 2
                              ? "bg-red-100 text-red-600"
                              : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          {stock} stok
                        </div>

                      </div>

                    );
                  }
                )

              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
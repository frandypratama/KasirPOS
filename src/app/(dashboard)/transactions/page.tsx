"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Search, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";

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

export default function TransactionPage() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // ==============================
  // SEARCH
  // ==============================
  const [search, setSearch] = useState("");

  // ==============================
  // FORMAT RUPIAH
  // ==============================
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  };

  // ==============================
  // FORMAT TANGGAL
  // ==============================
  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Tanggal tidak valid";
    }

    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(parsedDate);
  };

  // ==============================
  // LOAD TRANSACTIONS
  // ==============================
  useEffect(() => {
    const saved = localStorage.getItem("transactions");

    if (!saved) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        const validTransactions = parsed.filter(
          (transaction): transaction is Transaction =>
            transaction &&
            typeof transaction === "object" &&
            transaction.id &&
            transaction.date &&
            Array.isArray(transaction.items)
        );

        setTransactions([...validTransactions].reverse());
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Gagal membaca transaksi:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ==============================
  // FILTER / SEARCH TRANSACTIONS
  // ==============================
  const filteredTransactions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    // Jika search kosong, tampilkan semua
    if (!keyword) {
      return transactions;
    }

    return transactions.filter((transaction) => {
      // Invoice
      const invoice = String(transaction.id || "").toLowerCase();

      // Tanggal
      const date = formatDate(transaction.date).toLowerCase();

      // Metode pembayaran
      const paymentMethod = String(
        transaction.paymentMethod || ""
      ).toLowerCase();

      // Total dalam format rupiah
      const formattedTotal = formatCurrency(
        transaction.total
      ).toLowerCase();

      // Total angka biasa
      const numericTotal = String(
        transaction.total || ""
      ).toLowerCase();

      return (
        invoice.includes(keyword) ||
        date.includes(keyword) ||
        paymentMethod.includes(keyword) ||
        formattedTotal.includes(keyword) ||
        numericTotal.includes(keyword)
      );
    });
  }, [transactions, search]);

  // ==============================
  // DELETE TRANSACTION
  // ==============================
  const handleDelete = (id: string) => {
    const confirmed = window.confirm(
      "Yakin ingin menghapus transaksi ini?"
    );

    if (!confirmed) return;

    const updated = transactions.filter(
      (transaction) => transaction.id !== id
    );

    localStorage.setItem(
      "transactions",
      JSON.stringify([...updated].reverse())
    );

    setTransactions(updated);
  };

  // ==============================
  // DELETE ALL
  // ==============================
  const handleClearAll = () => {
    const confirmed = window.confirm(
      "Yakin ingin menghapus semua riwayat transaksi?"
    );

    if (!confirmed) return;

    localStorage.removeItem("transactions");
    localStorage.removeItem("lastTransaction");

    setTransactions([]);
    setSearch("");
  };

  // ==============================
  // CLEAR SEARCH
  // ==============================
  const handleClearSearch = () => {
    setSearch("");
  };

  // ==============================
  // LOADING
  // ==============================
  if (loading) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-bold">
          Riwayat Transaksi
        </h1>

        <p className="text-sm text-muted-foreground">
          Memuat transaksi...
        </p>
      </div>
    );
  }

  // ==============================
  // PAGE
  // ==============================
  return (
    <div className="space-y-4">

      {/* ==============================
          HEADER
      ============================== */}
      <div className="flex items-start justify-between">

        <div>
          <h1 className="text-xl font-bold">
            Riwayat Transaksi
          </h1>

          <p className="text-xs text-muted-foreground">
            Daftar transaksi yang sudah dibayar.
          </p>

          <p className="mt-1 text-xs font-medium">
            Total transaksi: {transactions.length}
          </p>
        </div>

        {transactions.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="
              rounded-lg
              border border-red-400
              px-3 py-2
              text-xs font-bold
              text-red-500
              transition
              hover:bg-red-500
              hover:text-white
            "
          >
            Hapus Semua
          </button>
        )}

      </div>

      {/* ==============================
          SEARCH
      ============================== */}
      {transactions.length > 0 && (
        <div className="flex w-full items-center gap-2">

          {/* SEARCH INPUT */}
          <div className="relative w-full max-w-md">

            <Search
              size={16}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-muted-foreground
              "
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Cari invoice, tanggal, metode..."
              className="
                h-9
                w-full
                rounded-lg
                border
                bg-background
                pl-9
                pr-9
                text-xs
                outline-none
                transition
                focus:border-indigo-500
                focus:ring-1
                focus:ring-indigo-500
              "
            />

            {/* CLEAR SEARCH */}
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="
                  absolute
                  right-2
                  top-1/2
                  -translate-y-1/2
                  rounded
                  p-1
                  text-muted-foreground
                  transition
                  hover:bg-muted
                  hover:text-foreground
                "
                title="Hapus pencarian"
              >
                <X size={14} />
              </button>
            )}

          </div>

          {/* HASIL PENCARIAN */}
          {search && (
            <p className="whitespace-nowrap text-xs text-muted-foreground">
              {filteredTransactions.length} hasil
            </p>
          )}

        </div>
      )}

      {/* ==============================
          EMPTY STATE
      ============================== */}
      {transactions.length === 0 ? (

        <div className="rounded-lg border p-8 text-center">

          <h2 className="font-semibold">
            Belum ada transaksi
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Tidak ada data transaksi.
          </p>

        </div>

      ) : (

        /* ==============================
           TABLE
        ============================== */
        <div className="w-full overflow-x-auto rounded-lg border">

          <table className="w-full border-collapse text-xs">

            {/* TABLE HEADER */}
            <thead>
              <tr className="border-b bg-muted/40">

                <th className="px-3 py-3 text-center font-bold">
                  No. Invoice
                </th>

                <th className="px-3 py-3 text-center font-bold">
                  Tanggal
                </th>

                <th className="px-3 py-3 text-center font-bold">
                  Total
                </th>

                <th className="px-3 py-3 text-center font-bold">
                  Metode Pembayaran
                </th>

                <th className="px-3 py-3 text-center font-bold">
                  Aksi
                </th>

              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody>

              {filteredTransactions.length === 0 ? (

                /* ==============================
                   SEARCH NOT FOUND
                ============================== */
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-10 text-center"
                  >

                    <div className="flex flex-col items-center">

                      <Search
                        size={28}
                        className="mb-2 text-muted-foreground"
                      />

                      <p className="font-semibold">
                        Transaksi tidak ditemukan
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Tidak ada transaksi yang cocok
                        dengan &quot;{search}&quot;
                      </p>

                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="
                          mt-3
                          rounded-lg
                          border
                          px-3
                          py-2
                          text-xs
                          font-semibold
                          transition
                          hover:bg-muted
                        "
                      >
                        Reset Pencarian
                      </button>

                    </div>

                  </td>
                </tr>

              ) : (

                /* ==============================
                   TRANSACTION LIST
                ============================== */
                filteredTransactions.map(
                  (transaction) => (

                    <tr
                      key={transaction.id}
                      className="
                        border-b
                        last:border-b-0
                        transition
                        hover:bg-muted/30
                      "
                    >

                      {/* INVOICE */}
                      <td
                        className="
                          whitespace-nowrap
                          px-3
                          py-3
                          text-center
                          font-semibold
                        "
                      >
                        {transaction.id}
                      </td>

                      {/* DATE */}
                      <td
                        className="
                          whitespace-nowrap
                          px-3
                          py-3
                          text-center
                        "
                      >
                        {formatDate(transaction.date)}
                      </td>

                      {/* TOTAL */}
                      <td
                        className="
                          whitespace-nowrap
                          px-3
                          py-3
                          text-center
                          font-semibold
                        "
                      >
                        {formatCurrency(
                          transaction.total
                        )}
                      </td>

                      {/* PAYMENT */}
                      <td className="px-3 py-3 text-center">

                        <span className="font-semibold uppercase">
                          {transaction.paymentMethod}
                        </span>

                      </td>

                      {/* ACTION */}
                      <td className="px-3 py-3">

                        <div className="flex items-center justify-center gap-3">

                          {/* VIEW INVOICE */}
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/transactions/${encodeURIComponent(
                                  transaction.id
                                )}`
                              )
                            }
                            className="
                              flex
                              cursor-pointer
                              items-center
                              gap-1
                              font-semibold
                              text-indigo-600
                              transition
                              hover:text-indigo-800
                              hover:underline
                            "
                          >
                            <Eye size={14} />
                            Lihat Invoice
                          </button>

                          {/* DELETE */}
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                transaction.id
                              )
                            }
                            className="
                              cursor-pointer
                              text-red-500
                              transition
                              hover:text-red-700
                            "
                            title="Hapus transaksi"
                          >
                            <Trash2 size={15} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}
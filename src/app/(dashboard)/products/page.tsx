"use client";

import Link from "next/link";
import { Search, Loader2, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import type { Product } from "@/types/product";
import { formatCurrency } from "@/utils/currency";

import {
  deleteProduct,
  getProducts,
} from "@/services/product.service";
import { Button } from "@/components/ui/Button";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // =========================
  // LOAD PRODUCTS
  // =========================
  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const data = await getProducts();

      setProducts(data);
    } catch (error) {
      console.error("Gagal mengambil produk:", error);
      setError("Gagal memuat produk. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  // Load pertama kali
  useEffect(() => {
    loadProducts();
  }, []);

  // =========================
  // DELETE PRODUCT
  // =========================
  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Yakin ingin menghapus produk ini?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      await deleteProduct(id);

      // Ambil ulang data dari Firebase
      await loadProducts();
    } catch (error) {
      console.error("Gagal menghapus produk:", error);
      setError("Gagal menghapus produk. Silakan coba lagi.");
    } finally {
      setDeletingId(null);
    }
  }

  // =========================
  // SEARCH / FILTER
  // =========================
  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(keyword) ||
        product.sku.toLowerCase().includes(keyword)
      );
    });
  }, [products, search]);

  // =========================
  // LOADING STATE
  // =========================
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />

          <p className="text-sm font-medium">
            Memuat produk...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* =========================
          HEADER
      ========================= */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-indigo-600">
            MASTER DATA
          </p>

          <h1 className="mt-1 text-3xl font-black tracking-tight">
            Produk
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Kelola produk, harga, dan stok
          </p>
        </div>
        <Link href="/products/create">
                  <Button className="w-full sm:w-auto">
                    <Plus size={18} />
                    Tambah Produk
                  </Button>
                </Link>
      </div>

      {/* =========================
          ERROR MESSAGE
      ========================= */}
      {error && (
        <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}

          <button
            type="button"
            onClick={loadProducts}
            className="ml-2 font-bold underline hover:no-underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* =========================
          SEARCH
      ========================= */}
      {products.length > 0 && (
        <div className="mb-5 max-w-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              placeholder="Cari nama atau SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      )}

      {/* =========================
          NO PRODUCTS AT ALL
      ========================= */}
      {products.length === 0 && (
        <EmptyState
          title="Belum ada produk"
          description="Tambahkan produk pertama untuk memulai transaksi POS."
        />
      )}

      {/* =========================
          SEARCH HAS NO RESULT
      ========================= */}
      {products.length > 0 && filtered.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <Search className="mx-auto mb-3 h-8 w-8 text-slate-400" />

          <h2 className="font-bold text-slate-800">
            Produk tidak ditemukan
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Tidak ada produk yang cocok dengan pencarian "{search}".
          </p>

          <button
            type="button"
            onClick={() => setSearch("")}
            className="mt-4 text-sm font-bold text-indigo-600 hover:underline"
          >
            Reset pencarian
          </button>
        </div>
      )}

      {/* =========================
          PRODUCT TABLE
      ========================= */}
      {filtered.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">
                    Produk
                  </th>

                  <th className="px-5 py-4">
                    SKU
                  </th>

                  <th className="px-5 py-4">
                    Harga
                  </th>

                  <th className="px-5 py-4">
                    Stok
                  </th>

                  <th className="px-5 py-4 text-center">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((product) => {
                  const stockColor =
                    product.stock <= 5
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800";

                  const isDeleting =
                    deletingId === product.id;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/70"
                    >
                      {/* PRODUK */}
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {product.name}
                      </td>

                      {/* SKU */}
                      <td className="px-5 py-4 font-bold text-slate-700">
                        {product.sku}
                      </td>

                      {/* HARGA */}
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {formatCurrency(product.price)}
                      </td>

                      {/* STOK */}
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-sm font-bold ${stockColor}`}
                        >
                          {product.stock}
                        </span>
                      </td>

                      {/* AKSI */}
                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          {/* EDIT */}
                          <Link
                            href={`/products/${product.id}/edit`}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition duration-200 hover:bg-slate-100"
                          >
                            Edit
                          </Link>

                          {/* DELETE */}
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(product.id)
                            }
                            disabled={isDeleting}
                            className="flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 transition duration-200 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isDeleting && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}

                            {isDeleting
                              ? "Menghapus..."
                              : "Hapus"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

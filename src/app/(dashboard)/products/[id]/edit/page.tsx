"use client";

import { ProductForm } from "@/components/products/product-form";
import {
  getProductById,
  updateProduct,
} from "@/services/product.service";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { ProductInput, Product } from "@/types/product";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await getProductById(params.id);

        setProduct(data ?? null);
      } catch (error) {
        console.error("Gagal mengambil produk:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">
          Memuat produk...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-4">
        <h1 className="text-lg font-bold">
          Produk tidak ditemukan
        </h1>

        <button
          type="button"
          onClick={() => router.push("/products")}
          className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Kembali ke Produk
        </button>
      </div>
    );
  }

  async function handleSubmit(input: ProductInput) {
    if (!product || saving) return;

    try {
      setSaving(true);

      await updateProduct(product.id, input);

      router.push("/products");
    } catch (error) {
      console.error("Gagal mengupdate produk:", error);

      alert("Gagal menyimpan perubahan produk.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div>
        <p className="text-xs font-bold text-indigo-600">
          MASTER DATA
        </p>

        <h1 className="mt-1 text-2xl font-black">
          Edit Produk
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Ubah informasi produk kemudian simpan perubahan.
        </p>
      </div>

      {/* FORM */}
      <ProductForm
        initialValues={product}
        submitLabel={
          saving ? "Menyimpan..." : "Simpan Perubahan"
        }
        onSubmit={handleSubmit}
      />

    </div>
  );
}
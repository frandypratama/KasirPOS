"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import { Input } from "@/components/ui/input";

import {
  decreaseProductsStock,
  getProducts,
} from "@/services/product.service";

import type { Product } from "@/types/product";

import type {
  CartItem,
  PaymentMethod,
} from "@/types/cart";

type Transaction = {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
};

export default function NewTransactionPage() {
  // =====================================
  // STATE
  // =====================================

  const [products, setProducts] =
    useState<Product[]>([]);

  const [cartItems, setCartItems] =
    useState<CartItem[]>([]);

  const [search, setSearch] =
    useState("");

  const [discount, setDiscount] =
    useState(0);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cash");

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [transactionDate, setTransactionDate] =
    useState<string | null>(null);

  // =====================================
  // LOAD PRODUCTS
  // =====================================

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getProducts();

      setProducts(data);
    } catch (error) {
      console.error(error);

      setError(
        "Gagal mengambil data produk."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // =====================================
  // SEARCH
  // =====================================

  const filteredProducts =
    useMemo(() => {
      const keyword =
        search
          .toLowerCase()
          .trim();

      if (!keyword) {
        return products;
      }

      return products.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(keyword) ||
          product.sku
            .toLowerCase()
            .includes(keyword)
      );
    }, [products, search]);

  // =====================================
  // FORMAT RUPIAH
  // =====================================

  function formatCurrency(
    value: number
  ) {
    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }
    ).format(value);
  }

  // =====================================
  // CARI QTY PRODUK DI KERANJANG
  // =====================================

  function getCartQty(
    productId: string
  ) {
    const item =
      cartItems.find(
        (item) =>
          item.productId ===
          productId
      );

    return item?.qty ?? 0;
  }

  // =====================================
  // TAMBAH PRODUK
  // =====================================

  function handleAddToCart(
    product: Product
  ) {
    const currentQty =
      getCartQty(product.id);

    const stock =
      Number(product.stock ?? 0);

    /* ================================
       CEK STOK
    ================================= */

    if (stock <= 0) {
      alert(
        `${product.name} sedang habis.`
      );

      return;
    }

    if (currentQty >= stock) {
      alert(
        `Stok ${product.name} hanya ${stock}.`
      );

      return;
    }

    setCartItems(
      (currentItems) => {
        const existingItem =
          currentItems.find(
            (item) =>
              item.productId ===
              product.id
          );

        /* ============================
           PRODUK SUDAH ADA
        ============================ */

        if (existingItem) {
          const newQty =
            existingItem.qty + 1;

          return currentItems.map(
            (item) =>
              item.productId ===
              product.id
                ? {
                    ...item,
                    qty: newQty,
                    subtotal:
                      newQty *
                      item.price,
                  }
                : item
          );
        }

        /* ============================
           PRODUK BARU
        ============================ */

        const newItem: CartItem = {
          productId:
            product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          subtotal:
            product.price,
        };

        return [
          ...currentItems,
          newItem,
        ];
      }
    );
  }

  // =====================================
  // UPDATE QTY
  // =====================================

  function handleUpdateQty(
    productId: string,
    qty: number
  ) {
    const product =
      products.find(
        (item) =>
          item.id ===
          productId
      );

    if (!product) {
      return;
    }

    const stock =
      Number(product.stock ?? 0);

    /* ================================
       QTY 0 = HAPUS
    ================================= */

    if (qty <= 0) {
      setCartItems(
        (currentItems) =>
          currentItems.filter(
            (item) =>
              item.productId !==
              productId
          )
      );

      return;
    }

    /* ================================
       JANGAN MELEBIHI STOK
    ================================= */

    if (qty > stock) {
      alert(
        `Stok ${product.name} hanya ${stock}.`
      );

      return;
    }

    setCartItems(
      (currentItems) =>
        currentItems.map(
          (item) =>
            item.productId ===
            productId
              ? {
                  ...item,
                  qty,
                  subtotal:
                    qty *
                    item.price,
                }
              : item
        )
    );
  }

  // =====================================
  // INPUT QTY
  // =====================================

  function handleQtyInput(
    productId: string,
    value: string
  ) {
    if (value === "") {
      return;
    }

    const qty =
      Number(value);

    if (!Number.isFinite(qty)) {
      return;
    }

    handleUpdateQty(
      productId,
      Math.floor(qty)
    );
  }

  // =====================================
  // HAPUS ITEM
  // =====================================

  function handleRemoveItem(
    productId: string
  ) {
    setCartItems(
      (currentItems) =>
        currentItems.filter(
          (item) =>
            item.productId !==
            productId
        )
    );
  }

  // =====================================
  // SUBTOTAL
  // =====================================

  const subtotal =
    useMemo(() => {
      return cartItems.reduce(
        (total, item) =>
          total +
          item.subtotal,
        0
      );
    }, [cartItems]);

  // =====================================
  // DISCOUNT
  // =====================================

  const discountAmount =
    Math.min(
      Math.max(
        discount,
        0
      ),
      subtotal
    );

  // =====================================
  // GRAND TOTAL
  // =====================================

  const grandTotal =
    Math.max(
      subtotal -
        discountAmount,
      0
    );

  // =====================================
  // CHECKOUT
  // =====================================

  async function handleCheckout() {
    /* ================================
       CEK KERANJANG
    ================================= */

    if (
      cartItems.length === 0
    ) {
      alert(
        "Keranjang masih kosong."
      );

      return;
    }

    /* ================================
       CEGAH DOUBLE CLICK
    ================================= */

    if (processing) {
      return;
    }

    try {
      setProcessing(true);

      /* ==============================
         CEK STOK TERBARU
         Ambil Firebase lagi supaya
         tidak menggunakan data lama
      ============================== */

      const latestProducts =
        await getProducts();

      /* ==============================
         VALIDASI STOK
      ============================== */

      for (const item of cartItems) {
        const product =
          latestProducts.find(
            (product) =>
              product.id ===
              item.productId
          );

        if (!product) {
          throw new Error(
            `Produk ${item.name} tidak ditemukan.`
          );
        }

        const stock =
          Number(
            product.stock ?? 0
          );

        if (
          stock <
          item.qty
        ) {
          throw new Error(
            `Stok ${item.name} tidak cukup. ` +
            `Stok tersedia: ${stock}, ` +
            `jumlah dibeli: ${item.qty}.`
          );
        }
      }

      /* ==============================
         WAKTU TRANSAKSI
      ============================== */

      const now =
        new Date();

      const transactionTime =
        now.toISOString();

      setTransactionDate(
        transactionTime
      );

      /* ==============================
         KURANGI STOK FIREBASE
         
         Semua produk diproses dalam
         satu Firestore transaction.
      ============================== */

      await decreaseProductsStock(
        cartItems.map(
          (item) => ({
            productId:
              item.productId,
            qty: item.qty,
          })
        )
      );

      /* ==============================
         BUAT TRANSAKSI
      ============================== */

      const transaction: Transaction =
        {
          id: `TRX-${Date.now()}`,

          date:
            transactionTime,

          items: cartItems,

          subtotal,

          discount:
            discountAmount,

          total:
            grandTotal,

          paymentMethod,
        };

      /* ==============================
         AMBIL TRANSAKSI LAMA
      ============================== */

      const saved =
        localStorage.getItem(
          "transactions"
        );

      let transactions: Transaction[] =
        [];

      if (saved) {
        try {
          const parsed =
            JSON.parse(saved);

          if (
            Array.isArray(
              parsed
            )
          ) {
            transactions =
              parsed;
          }
        } catch (error) {
          console.error(
            "Data transaksi lama rusak:",
            error
          );

          transactions = [];
        }
      }

      /* ==============================
         TAMBAHKAN TRANSAKSI
      ============================== */

      transactions.push(
        transaction
      );

      /* ==============================
         SIMPAN TRANSAKSI
      ============================== */

      localStorage.setItem(
        "transactions",
        JSON.stringify(
          transactions
        )
      );

      /* ==============================
         SIMPAN TRANSAKSI TERAKHIR
      ============================== */

      localStorage.setItem(
        "lastTransaction",
        JSON.stringify(
          transaction
        )
      );

      /* ==============================
         REFRESH PRODUK
         Supaya stok di halaman POS
         langsung berubah
      ============================== */

      const updatedProducts =
        await getProducts();

      setProducts(
        updatedProducts
      );

      /* ==============================
         NOTIFIKASI
      ============================== */

      alert(
        `Pembayaran berhasil!\n\n` +
        `Total: ${formatCurrency(
          grandTotal
        )}`
      );

      /* ==============================
         RESET
      ============================== */

      setCartItems([]);

      setDiscount(0);

      setPaymentMethod(
        "cash"
      );

      setSearch("");

    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      if (
        error instanceof
        Error
      ) {
        alert(
          error.message
        );
      } else {
        alert(
          "Gagal menyimpan transaksi."
        );
      }
    } finally {
      setProcessing(false);
    }
  }

  // =====================================
  // RENDER
  // =====================================

  return (
    <div className="space-y-6">

      {/* =================================
          HEADER
      ================================= */}

      <div>
        <h1 className="text-2xl font-bold">
          Kasir / POS
        </h1>

        <p className="text-sm text-muted-foreground">
          Buat transaksi baru.
        </p>
      </div>

      {/* =================================
          CONTENT
      ================================= */}

      <div className="grid gap-6 lg:grid-cols-3">

        {/* =================================
            PRODUK
        ================================= */}

        <div className="space-y-4 lg:col-span-2">

          <div>
            <h2 className="text-lg font-semibold">
              Produk
            </h2>

            <p className="text-sm text-muted-foreground">
              Cari produk berdasarkan
              nama atau SKU.
            </p>
          </div>

          {/* SEARCH */}

          <Input
            type="text"
            placeholder="Cari produk atau SKU..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          {/* LOADING */}

          {loading && (
            <div className="rounded-xl border p-6 text-center">
              <p>
                Loading produk...
              </p>
            </div>
          )}

          {/* ERROR */}

          {!loading &&
            error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
                {error}
              </div>
            )}

          {/* PRODUCT LIST */}

          {!loading &&
            !error && (
              <div className="grid gap-3 sm:grid-cols-2">

                {filteredProducts.length ===
                0 ? (
                  <div className="rounded-xl border p-6 sm:col-span-2">
                    <p className="text-center text-sm text-muted-foreground">
                      Produk tidak ditemukan.
                    </p>
                  </div>
                ) : (
                  filteredProducts.map(
                    (product) => {
                      const stock =
                        Number(
                          product.stock ??
                            0
                        );

                      const cartQty =
                        getCartQty(
                          product.id
                        );

                      const outOfStock =
                        stock <= 0;

                      const maxReached =
                        cartQty >=
                        stock;

                      return (
                        <div
                          key={
                            product.id
                          }
                          className="flex items-center justify-between gap-4 rounded-xl border p-4"
                        >

                          {/* INFO */}

                          <div className="min-w-0">

                            <p className="font-bold">
                              {
                                product.name
                              }
                            </p>

                            <p className="text-sm text-muted-foreground">
                              SKU:{" "}
                              {
                                product.sku
                              }
                            </p>

                            <p className="mt-1 font-semibold">
                              {formatCurrency(
                                product.price
                              )}
                            </p>

                            {/* STOCK */}

                            <p
                              className={
                                stock <=
                                0
                                  ? "mt-1 text-sm font-bold text-red-500"
                                  : stock <=
                                      5
                                    ? "mt-1 text-sm font-bold text-orange-500"
                                    : "mt-1 text-sm font-bold text-green-600"
                              }
                            >
                              Stok:{" "}
                              {stock}
                            </p>

                          </div>

                          {/* TAMBAH */}

                          <button
                            type="button"
                            disabled={
                              outOfStock ||
                              maxReached
                            }
                            onClick={() =>
                              handleAddToCart(
                                product
                              )
                            }
                            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            <ShoppingCart
                              size={
                                16
                              }
                            />

                            {outOfStock
                              ? "Habis"
                              : maxReached
                                ? "Maks"
                                : "Tambah"}
                          </button>

                        </div>
                      );
                    }
                  )
                )}

              </div>
            )}

        </div>

        {/* =================================
            KERANJANG
        ================================= */}

        <div className="rounded-xl border p-4">

          {/* HEADER */}

          <div className="mb-4">

            <h2 className="text-lg font-semibold">
              Keranjang
            </h2>

            <p className="text-sm text-muted-foreground">
              {cartItems.length} item
            </p>

          </div>

          {/* EMPTY */}

          {cartItems.length ===
          0 ? (
            <div className="py-10 text-center">

              <ShoppingCart
                className="mx-auto mb-3 text-muted-foreground"
                size={40}
              />

              <p className="text-sm text-muted-foreground">
                Keranjang masih kosong.
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Klik tombol Tambah
                pada produk.
              </p>

            </div>
          ) : (
            <div className="space-y-4">

              {/* ITEMS */}

              <div className="space-y-3">

                {cartItems.map(
                  (item) => (
                    <div
                      key={
                        item.productId
                      }
                      className="rounded-xl border p-3"
                    >

                      {/* NAME */}

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <p className="font-semibold">
                            {item.name}
                          </p>

                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(
                              item.price
                            )}
                          </p>

                        </div>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveItem(
                              item.productId
                            )
                          }
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2
                            size={16}
                          />
                        </button>

                      </div>

                      {/* QTY */}

                      <div className="mt-3 flex items-center justify-between gap-3">

                        <div className="flex items-center gap-2">

                          {/* MINUS */}

                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateQty(
                                item.productId,
                                item.qty -
                                  1
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border cursor-pointer hover:bg-slate-50"
                          >
                            <Minus
                              size={14}
                            />
                          </button>

                          {/* INPUT */}

                          <Input
                            type="number"
                            min={1}
                            value={
                              item.qty
                            }
                            onChange={(
                              event
                            ) =>
                              handleQtyInput(
                                item.productId,
                                event
                                  .target
                                  .value
                              )
                            }
                            className="w-16 text-center"
                          />

                          {/* PLUS */}

                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateQty(
                                item.productId,
                                item.qty +
                                  1
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border cursor-pointer hover:bg-slate-50"
                          >
                            <Plus
                              size={14}
                            />
                          </button>

                        </div>

                        {/* SUBTOTAL */}

                        <p className="font-bold">
                          {formatCurrency(
                            item.subtotal
                          )}
                        </p>

                      </div>

                    </div>
                  )
                )}

              </div>

              {/* =================================
                  SUMMARY
              ================================= */}

              <div className="space-y-4 border-t pt-4">

                {/* SUBTOTAL */}

                <div className="flex justify-between">

                  <span>
                    Subtotal
                  </span>

                  <span className="font-semibold">
                    {formatCurrency(
                      subtotal
                    )}
                  </span>

                </div>

                {/* DISCOUNT INPUT */}

                <div className="space-y-2">

                  <label
                    htmlFor="discount"
                    className="text-sm font-medium"
                  >
                    Discount
                  </label>

                  <Input
                    id="discount"
                    type="number"
                    min={0}
                    max={
                      subtotal
                    }
                    value={
                      discount
                    }
                    onChange={(
                      event
                    ) =>
                      setDiscount(
                        Number(
                          event
                            .target
                            .value
                        ) || 0
                      )
                    }
                    placeholder="0"
                  />

                </div>

                {/* POTONGAN */}

                <div className="flex justify-between text-sm">

                  <span>
                    Potongan
                  </span>

                  <span className="text-red-500">
                    -{" "}
                    {formatCurrency(
                      discountAmount
                    )}
                  </span>

                </div>

                {/* TOTAL */}

                <div className="flex justify-between border-t pt-3 text-xl font-bold">

                  <span>
                    Total
                  </span>

                  <span>
                    {formatCurrency(
                      grandTotal
                    )}
                  </span>

                </div>

                {/* PAYMENT METHOD */}

                <div className="space-y-2">

                  <label
                    htmlFor="paymentMethod"
                    className="text-sm font-medium"
                  >
                    Metode Pembayaran
                  </label>

                  <select
                    id="paymentMethod"
                    value={
                      paymentMethod
                    }
                    onChange={(
                      event
                    ) =>
                      setPaymentMethod(
                        event
                          .target
                          .value as PaymentMethod
                      )
                    }
                    className="w-full rounded-xl border bg-background px-3 py-3 text-sm"
                  >

                    <option value="cash">
                      Cash
                    </option>

                    <option value="transfer">
                      Transfer
                    </option>

                    <option value="qris">
                      QRIS
                    </option>

                  </select>

                </div>

                {/* BAYAR */}

                <button
                  type="button"
                  disabled={
                    cartItems.length ===
                      0 ||
                    processing
                  }
                  onClick={
                    handleCheckout
                  }
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                >
                  {processing
                    ? "Memproses..."
                    : `Bayar ${formatCurrency(
                        grandTotal
                      )}`}
                </button>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
'use client';

import { useAuth } from '@/components/auth/Auth-provider';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/InputField';
import { getProducts } from '@/services/product.service';
import { createTransaction } from '@/services/transaction.service';
import { CartItem, PaymentMethod } from '@/types/cart';
import { Product } from '@/types/product';
import { formatCurrency } from '@/utils/currency';
import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';

function NewTransactionsPage() {
  // =========================================
  // STATE
  // =========================================

  const [products, setProducts] =
    useState<Product[]>([]);

  const [cartItems, setCartItems] =
    useState<CartItem[]>([]);

  const [search, setSearch] =
    useState('');

  const [discount, setDiscount] =
    useState(0);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('cash');

  const [paidAmount, setPaidAmount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const { user } = useAuth();

  const router = useRouter();


  // =========================================
  // TAMBAH PRODUK KE KERANJANG
  // =========================================

  function handleAddToCart(
    product: Product
  ) {
    // Cek stok
    if ((product.stock ?? 0) <= 0) {
      alert(
        `Stok ${product.name} habis`
      );
      return;
    }

    setCartItems((currentItems) => {

      const existingItem =
        currentItems.find(
          (item) =>
            item.productId === product.id
        );

      // Jika produk sudah ada
      if (existingItem) {

        // Cek apakah qty sudah mencapai stok
        if (
          existingItem.qty >=
          (product.stock ?? 0)
        ) {
          alert(
            `Stok ${product.name} hanya tersedia ${product.stock}`
          );

          return currentItems;
        }

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

      // Produk baru
      return [
        ...currentItems,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          subtotal: product.price,
        },
      ];
    });
  }


  // =========================================
  // UPDATE QTY
  // =========================================

  function handleUpdateQty(
    productId: string,
    qty: number
  ) {
    if (qty < 1) {
      return;
    }

    const product =
      products.find(
        (item) =>
          item.id === productId
      );

    if (
      product &&
      qty > (product.stock ?? 0)
    ) {
      alert(
        `Stok ${product.name} hanya tersedia ${product.stock}`
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
                    qty * item.price,
                }
              : item
        )
    );
  }


  // =========================================
  // HAPUS ITEM
  // =========================================

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


  // =========================================
  // SUBTOTAL
  // =========================================

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total + item.subtotal,
      0
    );
  }, [cartItems]);


  // =========================================
  // TOTAL SETELAH DISKON
  // =========================================

  const granTotal = useMemo(() => {
    return Math.max(
      subtotal - discount,
      0
    );
  }, [
    subtotal,
    discount,
  ]);


  // =========================================
  // KEMBALIAN
  // =========================================

  const changeAmount = useMemo(() => {
    return Math.max(
      paidAmount - granTotal,
      0
    );
  }, [
    paidAmount,
    granTotal,
  ]);


  // =========================================
  // UANG KURANG
  // =========================================

  const remainingAmount = useMemo(() => {
    return Math.max(
      granTotal - paidAmount,
      0
    );
  }, [
    paidAmount,
    granTotal,
  ]);


  // =========================================
  // FILTER PRODUK
  // =========================================

  const filterProducts =
    useMemo(() => {

      const keyword =
        search.toLowerCase();

      return products.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(keyword) ||
          product.sku
            .toLowerCase()
            .includes(keyword)
      );

    }, [
      products,
      search,
    ]);


  // =========================================
  // CHECKOUT
  // =========================================

  async function handleCheckout() {

    // Keranjang kosong
    if (cartItems.length === 0) {
      alert(
        'Keranjang masih kosong'
      );
      return;
    }

    // User belum login
    if (!user) {
      alert(
        'Silakan login terlebih dahulu'
      );
      return;
    }

    // Validasi pembayaran tunai
    if (
      paymentMethod === 'cash' &&
      paidAmount < granTotal
    ) {
      alert(
        `Pembayaran kurang ${formatCurrency(
          granTotal - paidAmount
        )}`
      );

      return;
    }

    try {

      setSubmitting(true);

      console.log(
        'DATA TRANSAKSI:',
        {
          items: cartItems,
          total: subtotal,
          grandTotal: granTotal,
          discount,
          paidAmount,
          paymentMethod,
          changeAmount,
        }
      );


      // =====================================
      // SIMPAN TRANSAKSI
      // =====================================

      const transactionId =
        await createTransaction(
          user.uid,
          {
            items: cartItems,

            // Subtotal sebelum diskon
            total: subtotal,

            // Total setelah diskon
            grandTotal: granTotal,

            // Diskon
            discond: discount,

            // Uang yang dibayar customer
            paidAmount: paidAmount,

            // Metode pembayaran
            paymentMethod:
              paymentMethod,
          }
        );


      // =====================================
      // REDIRECT KE INVOICE
      // =====================================

      router.push(
        '/transactions/' +
          transactionId
      );

    } catch (err) {

      console.error(
        'Checkout gagal:',
        err
      );

      alert(
        'Gagal membuat transaksi, coba lagi.'
      );

      setSubmitting(false);
    }
  }


  // =========================================
  // LOAD PRODUCTS
  // =========================================

  useEffect(() => {

    async function loadProducts() {

      if (!user) {
        setLoading(false);
        return;
      }

      try {

        setLoading(true);

        const data =
          await getProducts(
            user.uid
          );

        setProducts(data);

      } catch (error) {

        console.error(
          'Gagal mengambil produk:',
          error
        );

        alert(
          'Gagal mengambil data produk'
        );

      } finally {

        setLoading(false);

      }
    }

    loadProducts();

  }, [user]);


  // =========================================
  // RESET PEMBAYARAN JIKA METODE NON-CASH
  // =========================================

  useEffect(() => {

    if (
      paymentMethod !== 'cash'
    ) {
      setPaidAmount(0);
    }

  }, [paymentMethod]);


  // =========================================
  // RENDER
  // =========================================

  return (
    <>
      {/* =====================================
          HEADER
      ===================================== */}

      <div className='pb-6'>

        <h1 className='text-2xl font-bold'>
          Kasir / POS
        </h1>

        <p className='text-sm text-slate-500'>
          Halaman transaksi baru
        </p>

      </div>


      {/* =====================================
          CONTENT
      ===================================== */}

      <div className='flex flex-col gap-4 md:flex-row'>


        {/* ===================================
            PRODUK
        =================================== */}

        <div className='flex-1'>

          <div className='mb-4'>

            <Input
              placeholder='Cari produk atau SKU...'
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>


          {loading ? (

            <div className='rounded-2xl border p-8 text-center'>

              <p className='text-sm text-slate-500'>
                Memuat produk...
              </p>

            </div>

          ) : filterProducts.length === 0 ? (

            <div className='rounded-2xl border border-dashed p-8 text-center'>

              <p className='text-sm text-slate-500'>
                Produk tidak ditemukan
              </p>

            </div>

          ) : (

            <div className='grid gap-3'>

              {filterProducts.map(
                (product) => {

                  const cartItem =
                    cartItems.find(
                      (item) =>
                        item.productId ===
                        product.id
                    );

                  const currentQty =
                    cartItem?.qty ?? 0;

                  const stock =
                    product.stock ?? 0;

                  const isOutOfStock =
                    stock <= 0;

                  const maxStock =
                    currentQty >= stock;

                  return (

                    <div
                      key={product.id}
                      className='flex items-center justify-between rounded-2xl border bg-white p-4'
                    >

                      <div>

                        <h3 className='font-bold text-slate-800'>
                          {product.name}
                        </h3>

                        <p className='text-sm text-slate-500'>
                          {formatCurrency(
                            product.price
                          )}
                        </p>

                        <p className='mt-1 text-xs text-slate-400'>
                          Stok: {stock}
                        </p>

                      </div>


                      <Button
                        type='button'
                        disabled={
                          isOutOfStock ||
                          maxStock
                        }
                        onClick={() =>
                          handleAddToCart(
                            product
                          )
                        }
                      >
                        {isOutOfStock
                          ? 'Habis'
                          : maxStock
                          ? 'Maks'
                          : 'Tambah'}
                      </Button>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </div>


        {/* ===================================
            KERANJANG
        =================================== */}

        {cartItems.length === 0 ? (

          <div className='flex-1 rounded-2xl border border-dashed p-8 text-center'>

            <ShoppingCart className='mx-auto text-slate-400' />

            <h3 className='mt-4 font-bold'>
              Keranjang belanja masih kosong
            </h3>

            <p className='mt-1 text-sm text-slate-500'>
              Pilih produk dari daftar di sebelah kiri
            </p>

          </div>

        ) : (

          <div className='flex flex-1 flex-col justify-between gap-4 rounded-2xl border bg-white p-4'>


            {/* =================================
                LIST ITEM
            ================================= */}

            <div className='flex flex-col gap-4'>

              <div className='flex items-center justify-between'>

                <h2 className='font-bold text-slate-800'>
                  Keranjang
                </h2>

                <span className='text-sm text-slate-500'>
                  {cartItems.length} item
                </span>

              </div>


              {cartItems.map(
                (item) => (

                  <div
                    key={item.productId}
                    className='flex items-start justify-between gap-4 border-b border-slate-100 pb-4'
                  >

                    <div className='min-w-0'>

                      <h3 className='font-bold text-slate-800'>
                        {item.name}
                      </h3>

                      <p className='text-sm text-slate-500'>
                        {formatCurrency(
                          item.price
                        )}{' '}
                        x {item.qty}
                      </p>

                      <p className='mt-1 text-sm font-semibold text-slate-800'>
                        {formatCurrency(
                          item.subtotal
                        )}
                      </p>

                    </div>


                    <div className='flex items-center gap-2'>

                      <Input
                        type='number'
                        min={1}
                        value={item.qty}
                        onChange={(
                          event
                        ) =>
                          handleUpdateQty(
                            item.productId,
                            Number(
                              event.target.value
                            )
                          )
                        }
                        className='max-w-16'
                      />

                      <button
                        type='button'
                        className='rounded-lg bg-red-600 px-4 py-2 font-bold text-white transition-colors duration-300 hover:bg-red-800'
                        onClick={() =>
                          handleRemoveItem(
                            item.productId
                          )
                        }
                      >
                        Hapus
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>


            {/* =================================
                PEMBAYARAN
            ================================= */}

            <div className='flex flex-col gap-4 border-t border-slate-100 pt-4'>


              {/* DISKON */}

              <Input
                label='Diskon'
                type='number'
                min={0}
                value={
                  discount === 0
                    ? ''
                    : discount
                }
                onChange={(event) => {

                  const value =
                    Number(
                      event.target.value
                    );

                  setDiscount(
                    Number.isNaN(
                      value
                    )
                      ? 0
                      : Math.min(
                          value,
                          subtotal
                        )
                  );

                }}
                placeholder='Masukkan diskon'
              />


              {/* METODE PEMBAYARAN */}

              <label className='grid gap-2 text-sm font-semibold text-slate-700'>

                <span>
                  Metode Pembayaran
                </span>

                <select
                  value={
                    paymentMethod
                  }
                  onChange={(event) =>
                    setPaymentMethod(
                      event.target
                        .value as PaymentMethod
                    )
                  }
                  className='min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-100'
                >

                  <option value='cash'>
                    Cash
                  </option>

                  <option value='transfer'>
                    Transfer
                  </option>

                  <option value='qris'>
                    QRIS
                  </option>

                </select>

              </label>


              {/* DIBAYAR */}

              <Input
                label='Dibayar'
                type='number'
                min={0}
                value={
                  paidAmount === 0
                    ? ''
                    : paidAmount
                }
                onChange={(event) => {

                  const value =
                    Number(
                      event.target.value
                    );

                  setPaidAmount(
                    Number.isNaN(
                      value
                    )
                      ? 0
                      : Math.max(
                          value,
                          0
                        )
                  );

                }}
                placeholder='Masukkan jumlah pembayaran'
                disabled={
                  paymentMethod !==
                  'cash'
                }
              />


              {/* UANG KURANG */}

              {paymentMethod ===
                'cash' &&
                paidAmount > 0 &&
                paidAmount <
                  granTotal && (

                  <div className='rounded-xl bg-red-50 px-4 py-3'>

                    <div className='flex items-center justify-between'>

                      <span className='text-sm font-semibold text-red-600'>
                        Uang Kurang
                      </span>

                      <span className='font-bold text-red-600'>
                        {formatCurrency(
                          remainingAmount
                        )}
                      </span>

                    </div>

                  </div>

                )}


              {/* KEMBALIAN */}

              <div className='flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3'>

                <span className='text-sm font-semibold text-emerald-700'>
                  Kembalian
                </span>

                <span className='font-black text-emerald-700'>
                  {formatCurrency(
                    changeAmount
                  )}
                </span>

              </div>


              {/* TOTAL */}

              <div className='rounded-xl bg-slate-50 p-4'>

                <div className='flex items-center justify-between'>

                  <span className='text-sm text-slate-500'>
                    Subtotal
                  </span>

                  <span className='font-semibold text-slate-800'>
                    {formatCurrency(
                      subtotal
                    )}
                  </span>

                </div>


                <div className='mt-2 flex items-center justify-between'>

                  <span className='text-sm text-slate-500'>
                    Diskon
                  </span>

                  <span className='font-semibold text-red-600'>
                    -{' '}
                    {formatCurrency(
                      discount
                    )}
                  </span>

                </div>


                <div className='my-3 border-t border-slate-200' />


                <div className='flex items-center justify-between'>

                  <span className='font-bold text-slate-700'>
                    Total
                  </span>

                  <span className='text-xl font-black text-slate-900'>
                    {formatCurrency(
                      granTotal
                    )}
                  </span>

                </div>

              </div>


              {/* CHECKOUT */}

              <Button
                type='button'
                disabled={
                  cartItems.length ===
                    0 ||
                  submitting ||
                  (
                    paymentMethod ===
                      'cash' &&
                    paidAmount <
                      granTotal
                  )
                }
                onClick={
                  handleCheckout
                }
                className='w-full'
              >

                {submitting
                  ? 'Memproses...'
                  : 'Checkout'}

              </Button>

            </div>

          </div>

        )}

      </div>
    </>
  );
}

export default NewTransactionsPage;
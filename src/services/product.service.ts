import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import type {
  Product,
  ProductInput,
} from "@/types/product";

const DEMO_USER_ID = "demo-user";

/* =========================================
   PRODUCT COLLECTION
========================================= */

function productCollection() {
  return collection(
    db,
    "users",
    DEMO_USER_ID,
    "products"
  );
}

/* =========================================
   GET ALL PRODUCTS
========================================= */

export async function getProducts(): Promise<Product[]> {
  const productsQuery = query(
    productCollection(),
    orderBy("createdAt", "desc")
  );

  const snapshot =
    await getDocs(productsQuery);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as Product[];
}

/* =========================================
   GET PRODUCT BY ID
========================================= */

export async function getProductById(
  id: string
): Promise<Product | undefined> {
  const productRef = doc(
    db,
    "users",
    DEMO_USER_ID,
    "products",
    id
  );

  const snapshot =
    await getDoc(productRef);

  if (!snapshot.exists()) {
    return undefined;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Product;
}

/* =========================================
   ADD PRODUCT
========================================= */

export async function addProduct(
  input: ProductInput
) {
  await addDoc(productCollection(), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/* =========================================
   UPDATE PRODUCT
========================================= */

export async function updateProduct(
  id: string,
  input: ProductInput
) {
  const productRef = doc(
    db,
    "users",
    DEMO_USER_ID,
    "products",
    id
  );

  await updateDoc(productRef, {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

/* =========================================
   DELETE PRODUCT
========================================= */

export async function deleteProduct(
  id: string
) {
  const productRef = doc(
    db,
    "users",
    DEMO_USER_ID,
    "products",
    id
  );

  await deleteDoc(productRef);
}

/* =========================================
   DECREASE MULTIPLE PRODUCTS STOCK

   Dipakai ketika checkout.

   Contoh:
   [
     {
       productId: "abc",
       qty: 2
     },
     {
       productId: "xyz",
       qty: 1
     }
   ]
========================================= */

type StockItem = {
  productId: string;
  qty: number;
};

export async function decreaseProductsStock(
  items: StockItem[]
) {
  if (items.length === 0) {
    throw new Error(
      "Keranjang kosong."
    );
  }

  /*
   * Jalankan semua perubahan stok
   * dalam satu Firestore transaction.
   */
  await runTransaction(
    db,
    async (transaction) => {
      /* =================================
         BUAT REFERENCE PRODUK
      ================================= */

      const productRefs =
        items.map((item) =>
          doc(
            db,
            "users",
            DEMO_USER_ID,
            "products",
            item.productId
          )
        );

      /* =================================
         AMBIL SEMUA PRODUK
      ================================= */

      const productSnapshots =
        [];

      for (
        const productRef of productRefs
      ) {
        const snapshot =
          await transaction.get(
            productRef
          );

        productSnapshots.push(
          snapshot
        );
      }

      /* =================================
         CEK SEMUA PRODUK DAN STOK
      ================================= */

      for (
        let index = 0;
        index < items.length;
        index++
      ) {
        const item =
          items[index];

        const snapshot =
          productSnapshots[index];

        /* Produk tidak ditemukan */

        if (!snapshot.exists()) {
          throw new Error(
            `Produk dengan ID ${item.productId} tidak ditemukan.`
          );
        }

        /* Qty tidak valid */

        if (
          !Number.isInteger(
            item.qty
          ) ||
          item.qty <= 0
        ) {
          throw new Error(
            "Jumlah produk tidak valid."
          );
        }

        const productData =
          snapshot.data();

        const currentStock =
          Number(
            productData.stock ?? 0
          );

        /* Stok tidak cukup */

        if (
          currentStock <
          item.qty
        ) {
          const productName =
            productData.name ??
            "Produk";

          throw new Error(
            `Stok ${productName} tidak cukup. ` +
            `Stok tersedia: ${currentStock}, ` +
            `jumlah dibeli: ${item.qty}.`
          );
        }
      }

      /* =================================
         UPDATE SEMUA STOK
      ================================= */

      for (
        let index = 0;
        index < items.length;
        index++
      ) {
        const item =
          items[index];

        const snapshot =
          productSnapshots[index];

        const productData =
          snapshot.data();

        const currentStock =
          Number(
            productData?.stock ?? 0
          );

        const newStock =
          currentStock -
          item.qty;

        transaction.update(
          productRefs[index],
          {
            stock: newStock,
            updatedAt:
              serverTimestamp(),
          }
        );
      }
    }
  );
}

/* =========================================
   INCREASE MULTIPLE PRODUCTS STOCK

   Bisa digunakan nanti untuk refund/
   pembatalan transaksi.
========================================= */

export async function increaseProductsStock(
  items: StockItem[]
) {
  if (items.length === 0) {
    return;
  }

  await runTransaction(
    db,
    async (transaction) => {
      const productRefs =
        items.map((item) =>
          doc(
            db,
            "users",
            DEMO_USER_ID,
            "products",
            item.productId
          )
        );

      const productSnapshots =
        [];

      for (
        const productRef of productRefs
      ) {
        const snapshot =
          await transaction.get(
            productRef
          );

        productSnapshots.push(
          snapshot
        );
      }

      for (
        let index = 0;
        index < items.length;
        index++
      ) {
        const item =
          items[index];

        const snapshot =
          productSnapshots[index];

        if (!snapshot.exists()) {
          throw new Error(
            "Produk tidak ditemukan."
          );
        }

        if (
          !Number.isInteger(
            item.qty
          ) ||
          item.qty <= 0
        ) {
          throw new Error(
            "Jumlah produk tidak valid."
          );
        }

        const productData =
          snapshot.data();

        const currentStock =
          Number(
            productData.stock ?? 0
          );

        transaction.update(
          productRefs[index],
          {
            stock:
              currentStock +
              item.qty,

            updatedAt:
              serverTimestamp(),
          }
        );
      }
    }
  );
}
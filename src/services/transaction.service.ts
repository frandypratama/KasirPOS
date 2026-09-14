//src\services\transaction.service.ts
import db from "@/lib/firebase";
import { PaymentMethod } from "@/types/cart";
import { TransactionItem } from "@/types/transaction";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { productCollection } from "./product.service";


// =========================================
// COLLECTION TRANSAKSI
// =========================================

const transactionCollection = (uid: string) => {
  return collection(
    db,
    "users",
    uid,
    "transactions"
  );
};


// =========================================
// PAYLOAD TRANSAKSI
// =========================================

type CreateTransactionPayload = {
  items: TransactionItem[];
  total: number;
  paidAmount: number;
  paymentMethod: PaymentMethod;
  grandTotal: number;
  discond: number;
};


// =========================================
// GENERATE INVOICE
// =========================================

function generateInvoinceNumber() {
  return `TRX-${Date.now()}`;
}


// =========================================
// CREATE TRANSACTION
// =========================================

export const createTransaction = async (
  uid: string,
  payload: CreateTransactionPayload
) => {

  // Hitung kembalian
  const changeAmount = Math.max(
    payload.paidAmount - payload.grandTotal,
    0
  );

  // Buat reference transaksi
  const transactionRef = doc(
    transactionCollection(uid)
  );

  await runTransaction(
    db,
    async (transaction) => {

      const products: {
        item: TransactionItem;
        ref: ReturnType<typeof doc>;
        stock: number;
        name: string;
      }[] = [];


      // =========================================
      // READ PRODUCTS
      // =========================================

      for (const item of payload.items) {

        const productRef = doc(
          productCollection(uid),
          item.productId
        );

        const productSnap =
          await transaction.get(productRef);

        if (!productSnap.exists()) {
          throw new Error(
            `Product "${item.name}" dengan ID "${item.productId}" tidak ditemukan`
          );
        }

        const productData =
          productSnap.data();

        products.push({
          item,
          ref: productSnap.ref,
          stock: productData.stock ?? 0,
          name:
            productData.name ??
            item.name,
        });
      }


      // =========================================
      // UPDATE STOCK
      // =========================================

      for (const product of products) {

        if (
          product.stock <
          product.item.qty
        ) {
          throw new Error(
            `Stock "${product.name}" tidak mencukupi. ` +
            `Tersedia: ${product.stock}, ` +
            `dibutuhkan: ${product.item.qty}`
          );
        }

        transaction.update(
          product.ref,
          {
            stock:
              product.stock -
              product.item.qty,
          }
        );
      }


      // =========================================
      // CREATE TRANSACTION
      // =========================================

      transaction.set(
        transactionRef,
        {
          invoiceNumber:
            generateInvoinceNumber(),

          items: payload.items,

          // Subtotal sebelum diskon
          total: payload.total,

          // Diskon
          discount: payload.discond,

          // Total setelah diskon
          grandTotal:
            payload.grandTotal,

          // Uang yang diberikan customer
          paidAmount:
            payload.paidAmount,

          // Kembalian
          changeAmount:
            changeAmount,

          // Metode pembayaran
          paymentMethod:
            payload.paymentMethod,

          // Waktu transaksi
          createdAt:
            serverTimestamp(),
        }
      );
    }
  );

  return transactionRef.id;
};


// =========================================
// GET ALL TRANSACTIONS
// =========================================

export const getTransactions = async (
  uid: string
) => {

  const q = query(
    transactionCollection(uid),
    orderBy("createdAt", "desc")
  );

  const snapshot =
    await getDocs(q);

  return snapshot.docs.map(
    (item) => {

      const data =
        item.data();

      return {
        id: item.id,
        ...data,

        createdAt:
          data.createdAt
            ?.toDate?.() ??
          new Date(),

        // Pastikan tidak undefined
        paidAmount:
          data.paidAmount ?? 0,

        changeAmount:
          data.changeAmount ?? 0,

        grandTotal:
          data.grandTotal ??
          data.total ??
          0,
      };
    }
  );
};


// =========================================
// GET TRANSACTION BY ID
// =========================================

export const getTransactionById = async (
  uid: string,
  id: string
) => {

  const docRef = doc(
    transactionCollection(uid),
    id
  );

  const snapshot =
    await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data =
    snapshot.data();

  return {
    id: snapshot.id,
    ...data,

    createdAt:
      data.createdAt
        ?.toDate?.() ??
      new Date(),

    // =====================================
    // PAYMENT
    // =====================================

    paidAmount:
      data.paidAmount ?? 0,

    changeAmount:
      data.changeAmount ?? 0,

    // =====================================
    // TOTAL
    // =====================================

    total:
      data.total ?? 0,

    grandTotal:
      data.grandTotal ??
      data.total ??
      0,

    discount:
      data.discount ??
      data.discond ??
      0,
  };
};
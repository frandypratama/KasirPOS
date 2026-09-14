'use client';

import { Printer } from 'lucide-react';

type TransactionItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  subtotal: number;
};

type PrintButtonProps = {
  invoiceNumber: string;
  date: string;
  items: TransactionItem[];
  total: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: string;
};

const PAYMENT_LABEL: Record<string, string> = {
  cash: 'Tunai',
  transfer: 'Transfer',
  qris: 'QRIS',
};

export default function PrintButton({
  invoiceNumber,
  date,
  items,
  total,
  discount,
  grandTotal,
  paidAmount,
  changeAmount,
  paymentMethod,
}: PrintButtonProps) {
  const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const handlePrint = () => {
    const paymentLabel =
      PAYMENT_LABEL[paymentMethod] ?? paymentMethod;

    const itemsHtml = items
      .map(
        (item) => `
          <div class="item">
            <div class="item-name">
              ${item.name}
            </div>

            <div class="item-row">
              <span>
                ${item.qty} x ${formatCurrency(item.price)}
              </span>

              <strong>
                ${formatCurrency(item.subtotal)}
              </strong>
            </div>
          </div>
        `
      )
      .join('');

    const printWindow = window.open(
      '',
      '_blank',
      'width=400,height=700'
    );

    if (!printWindow) {
      alert(
        'Popup diblokir browser. Silakan izinkan popup untuk mencetak.'
      );

      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>

      <html lang="id">

      <head>

        <meta charset="UTF-8">

        <title>${invoiceNumber}</title>

        <style>

          @page {
            size: 80mm auto;
            margin: 0;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            width: 80mm;
            margin: 0;
            padding: 0;
            background: white;
            color: black;
          }

          body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
          }

          .receipt {
            width: 80mm;
            padding: 5mm;
          }

          /* HEADER */

          .header {
            text-align: center;
          }

          .header h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 800;
            letter-spacing: 1px;
          }

          .header p {
            margin: 4px 0 0;
            font-size: 11px;
          }

          /* GARIS */

          .divider {
            margin: 10px 0;
            border-top: 1px dashed black;
          }

          /* INFO */

          .info {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }

          .info-row {
            display: flex;
            justify-content: space-between;
            gap: 10px;
          }

          .info-row span {
            color: #444;
          }

          .info-row strong {
            text-align: right;
            word-break: break-word;
          }

          /* ITEM */

          .items {
            display: flex;
            flex-direction: column;
            gap: 9px;
          }

          .item-name {
            font-weight: 700;
            margin-bottom: 2px;
          }

          .item-row {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            font-size: 11px;
          }

          .item-row span {
            color: #444;
          }

          /* SUMMARY */

          .summary {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            gap: 10px;
          }

          .summary-row span {
            color: #444;
          }

          .summary-row strong {
            text-align: right;
          }

          .grand-total {
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            font-weight: 800;
          }

          /* FOOTER */

          .footer {
            margin-top: 15px;
            text-align: center;
          }

          .footer p {
            margin: 0;
            font-size: 11px;
          }

          .footer small {
            display: block;
            margin-top: 4px;
            font-size: 9px;
            color: #555;
          }

        </style>

      </head>

      <body>

        <div class="receipt">

          <!-- HEADER -->

          <div class="header">

            <h1>MINIPOS</h1>

            <p>Struk Transaksi</p>

          </div>


          <div class="divider"></div>


          <!-- INFORMASI TRANSAKSI -->

          <div class="info">

            <div class="info-row">
              <span>No. Invoice</span>
              <strong>${invoiceNumber}</strong>
            </div>

            <div class="info-row">
              <span>Tanggal</span>
              <strong>${date}</strong>
            </div>

            <div class="info-row">
              <span>Pembayaran</span>
              <strong>${paymentLabel}</strong>
            </div>

          </div>


          <div class="divider"></div>


          <!-- PRODUK -->

          <div class="items">

            ${itemsHtml}

          </div>


          <div class="divider"></div>


          <!-- TOTAL -->

          <div class="summary">

            <div class="summary-row">
              <span>Subtotal</span>
              <strong>
                ${formatCurrency(total)}
              </strong>
            </div>

            <div class="summary-row">
              <span>Diskon</span>
              <strong>
                ${formatCurrency(discount)}
              </strong>
            </div>

            <div class="grand-total">
              <span>TOTAL</span>
              <strong>
                ${formatCurrency(grandTotal)}
              </strong>
            </div>

          </div>


          <div class="divider"></div>


          <!-- PEMBAYARAN -->

          <div class="summary">

            <div class="summary-row">
              <span>Dibayar</span>
              <strong>
                ${formatCurrency(paidAmount)}
              </strong>
            </div>

            <div class="summary-row">
              <span>Kembalian</span>
              <strong>
                ${formatCurrency(changeAmount)}
              </strong>
            </div>

          </div>


          <div class="divider"></div>


          <!-- FOOTER -->

          <div class="footer">

            <p>
              Terima kasih telah berbelanja
            </p>

            <small>
              MiniPOS
            </small>

          </div>

        </div>


        <script>

          window.onload = function () {

            window.focus();

            window.print();

            window.onafterprint = function () {
              window.close();
            };

          };

        </script>

      </body>

      </html>
    `);

    printWindow.document.close();
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      title="Print transaksi"
      className="inline-flex items-center justify-center rounded-lg bg-slate-100 p-2 text-slate-600 transition hover:bg-indigo-100 hover:text-indigo-700"
    >
      <Printer size={15} />
    </button>
  );
}
